"""Admin routes for monitoring and user management."""

from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_admin_user
from app.models.user import User, Profile
from app.models.subscription import (
    Subscription,
    SubscriptionTier,
    SubscriptionStatus,
    UsageLimit,
    CreditsLedger,
)
from app.models.conversation import Message

router = APIRouter()


# Response models
class TierBreakdown(BaseModel):
    tier: str
    count: int


class AdminStats(BaseModel):
    total_users: int
    active_users_30d: int
    total_subscriptions: int
    active_subscriptions: int
    revenue_this_month_paise: int
    revenue_total_paise: int
    questions_today: int
    questions_this_month: int
    tier_breakdown: List[TierBreakdown]


class AdminUserResponse(BaseModel):
    id: str
    email: str
    phone_number: Optional[str]
    full_name: Optional[str]
    tier: str
    status: str
    is_active: bool
    questions_used_monthly: int
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserList(BaseModel):
    users: List[AdminUserResponse]
    total: int
    page: int
    page_size: int


class AdminSubscriptionResponse(BaseModel):
    id: str
    user_email: str
    user_name: Optional[str]
    tier: str
    status: str
    amount_paise: int
    razorpay_payment_id: Optional[str]
    razorpay_order_id: Optional[str]
    current_period_start: Optional[datetime]
    current_period_end: Optional[datetime]
    cancel_at_period_end: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdminSubscriptionList(BaseModel):
    subscriptions: List[AdminSubscriptionResponse]
    total: int
    page: int
    page_size: int


class ChangeTierRequest(BaseModel):
    tier: SubscriptionTier


class ChangeTierResponse(BaseModel):
    success: bool
    message: str
    new_tier: str


class ToggleActiveResponse(BaseModel):
    success: bool
    is_active: bool


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    admin_user=Depends(get_admin_user),
):
    """Get dashboard statistics."""
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Total users
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0

    # Active users in last 30 days (users with messages)
    active_users_result = await db.execute(
        select(func.count(func.distinct(Message.user_id)))
        .where(Message.created_at >= thirty_days_ago)
    )
    active_users_30d = active_users_result.scalar() or 0

    # Total subscriptions (paid only)
    total_subs_result = await db.execute(
        select(func.count(Subscription.id))
        .where(Subscription.tier != SubscriptionTier.FREE.value)
    )
    total_subscriptions = total_subs_result.scalar() or 0

    # Active subscriptions
    active_subs_result = await db.execute(
        select(func.count(Subscription.id))
        .where(Subscription.status == SubscriptionStatus.ACTIVE.value)
        .where(Subscription.tier != SubscriptionTier.FREE.value)
    )
    active_subscriptions = active_subs_result.scalar() or 0

    # Revenue this month
    revenue_month_result = await db.execute(
        select(func.sum(Subscription.price_paise))
        .where(Subscription.created_at >= start_of_month)
        .where(Subscription.tier != SubscriptionTier.FREE.value)
        .where(Subscription.status == SubscriptionStatus.ACTIVE.value)
    )
    revenue_this_month_paise = revenue_month_result.scalar() or 0

    # Total revenue
    revenue_total_result = await db.execute(
        select(func.sum(Subscription.price_paise))
        .where(Subscription.tier != SubscriptionTier.FREE.value)
    )
    revenue_total_paise = revenue_total_result.scalar() or 0

    # Questions today
    questions_today_result = await db.execute(
        select(func.count(Message.id))
        .where(Message.created_at >= start_of_today)
        .where(Message.role == "user")
    )
    questions_today = questions_today_result.scalar() or 0

    # Questions this month
    questions_month_result = await db.execute(
        select(func.count(Message.id))
        .where(Message.created_at >= start_of_month)
        .where(Message.role == "user")
    )
    questions_this_month = questions_month_result.scalar() or 0

    # Tier breakdown - get active subscription for each user
    tier_breakdown = []
    for tier in SubscriptionTier:
        tier_count_result = await db.execute(
            select(func.count(Subscription.id))
            .where(Subscription.tier == tier.value)
            .where(Subscription.status == SubscriptionStatus.ACTIVE.value)
        )
        count = tier_count_result.scalar() or 0
        tier_breakdown.append(TierBreakdown(tier=tier.value, count=count))

    return AdminStats(
        total_users=total_users,
        active_users_30d=active_users_30d,
        total_subscriptions=total_subscriptions,
        active_subscriptions=active_subscriptions,
        revenue_this_month_paise=revenue_this_month_paise,
        revenue_total_paise=revenue_total_paise,
        questions_today=questions_today,
        questions_this_month=questions_this_month,
        tier_breakdown=tier_breakdown,
    )


@router.get("/users", response_model=AdminUserList)
async def get_admin_users(
    db: AsyncSession = Depends(get_db),
    admin_user=Depends(get_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    tier: Optional[SubscriptionTier] = Query(None),
):
    """Get paginated list of users with search and filter."""
    offset = (page - 1) * page_size

    # Base query
    base_query = select(User).outerjoin(Profile, User.id == Profile.user_id)

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        base_query = base_query.where(
            or_(
                User.email.ilike(search_pattern),
                User.phone_number.ilike(search_pattern),
                Profile.full_name.ilike(search_pattern),
            )
        )

    # Get total count
    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Get users with pagination
    users_query = base_query.order_by(User.created_at.desc()).offset(offset).limit(page_size)
    users_result = await db.execute(users_query)
    users = users_result.scalars().all()

    # Build response with subscription info
    user_responses = []
    for user in users:
        # Get user's active subscription
        sub_result = await db.execute(
            select(Subscription)
            .where(Subscription.user_id == user.id)
            .where(Subscription.status == SubscriptionStatus.ACTIVE.value)
            .order_by(Subscription.created_at.desc())
            .limit(1)
        )
        subscription = sub_result.scalar_one_or_none()

        # Get user's usage
        usage_result = await db.execute(
            select(UsageLimit)
            .where(UsageLimit.user_id == user.id)
            .order_by(UsageLimit.period_date.desc())
            .limit(1)
        )
        usage = usage_result.scalar_one_or_none()

        user_tier = subscription.tier if subscription else SubscriptionTier.FREE.value
        user_status = subscription.status if subscription else "NO_SUBSCRIPTION"

        # Filter by tier if specified
        if tier and user_tier != tier.value:
            continue

        user_responses.append(AdminUserResponse(
            id=user.id,
            email=user.email,
            phone_number=user.phone_number,
            full_name=user.profile.full_name if user.profile else None,
            tier=user_tier,
            status=user_status,
            is_active=user.is_active,
            questions_used_monthly=usage.questions_used_monthly if usage else 0,
            created_at=user.created_at,
        ))

    return AdminUserList(
        users=user_responses,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_admin_user_detail(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin_user=Depends(get_admin_user),
):
    """Get single user details."""
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get subscription
    sub_result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == user.id)
        .where(Subscription.status == SubscriptionStatus.ACTIVE.value)
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )
    subscription = sub_result.scalar_one_or_none()

    # Get usage
    usage_result = await db.execute(
        select(UsageLimit)
        .where(UsageLimit.user_id == user.id)
        .order_by(UsageLimit.period_date.desc())
        .limit(1)
    )
    usage = usage_result.scalar_one_or_none()

    return AdminUserResponse(
        id=user.id,
        email=user.email,
        phone_number=user.phone_number,
        full_name=user.profile.full_name if user.profile else None,
        tier=subscription.tier if subscription else SubscriptionTier.FREE.value,
        status=subscription.status if subscription else "NO_SUBSCRIPTION",
        is_active=user.is_active,
        questions_used_monthly=usage.questions_used_monthly if usage else 0,
        created_at=user.created_at,
    )


@router.post("/users/{user_id}/change-tier", response_model=ChangeTierResponse)
async def change_user_tier(
    user_id: str,
    request: ChangeTierRequest,
    db: AsyncSession = Depends(get_db),
    admin_user=Depends(get_admin_user),
):
    """Change user's subscription tier (admin override)."""
    # Verify user exists
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get or create subscription
    sub_result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == user_id)
        .where(Subscription.status == SubscriptionStatus.ACTIVE.value)
        .order_by(Subscription.created_at.desc())
        .limit(1)
    )
    subscription = sub_result.scalar_one_or_none()

    now = datetime.utcnow()
    period_end = now + timedelta(days=30)

    if subscription:
        # Update existing subscription
        subscription.tier = request.tier.value
        subscription.updated_at = now
    else:
        # Create new subscription (admin grant)
        subscription = Subscription(
            user_id=user_id,
            tier=request.tier.value,
            status=SubscriptionStatus.ACTIVE.value,
            current_period_start=now,
            current_period_end=period_end,
            price_paise=0,  # Admin grant, no charge
        )
        db.add(subscription)
        await db.flush()

    # Log to credits ledger
    ledger_entry = CreditsLedger(
        user_id=user_id,
        subscription_id=subscription.id,
        credit_type="bonus",
        amount=0,
        balance_after=0,
        description=f"Admin tier change to {request.tier.value} by {admin_user.email}",
    )
    db.add(ledger_entry)

    await db.commit()

    return ChangeTierResponse(
        success=True,
        message=f"User tier changed to {request.tier.value}",
        new_tier=request.tier.value,
    )


@router.post("/users/{user_id}/toggle-active", response_model=ToggleActiveResponse)
async def toggle_user_active(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin_user=Depends(get_admin_user),
):
    """Enable/disable user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Don't allow disabling self
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Cannot disable your own account")

    user.is_active = not user.is_active
    await db.commit()

    return ToggleActiveResponse(
        success=True,
        is_active=user.is_active,
    )


@router.get("/subscriptions", response_model=AdminSubscriptionList)
async def get_admin_subscriptions(
    db: AsyncSession = Depends(get_db),
    admin_user=Depends(get_admin_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[SubscriptionStatus] = Query(None),
    tier_filter: Optional[SubscriptionTier] = Query(None),
):
    """Get paginated list of subscriptions with filters."""
    offset = (page - 1) * page_size

    # Base query - only paid subscriptions
    base_query = (
        select(Subscription)
        .join(User, User.id == Subscription.user_id)
        .outerjoin(Profile, User.id == Profile.user_id)
        .where(Subscription.tier != SubscriptionTier.FREE.value)
    )

    # Apply filters
    if status_filter:
        base_query = base_query.where(Subscription.status == status_filter.value)
    if tier_filter:
        base_query = base_query.where(Subscription.tier == tier_filter.value)

    # Get total count
    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Get subscriptions with pagination
    subs_query = base_query.order_by(Subscription.created_at.desc()).offset(offset).limit(page_size)
    subs_result = await db.execute(subs_query)
    subscriptions = subs_result.scalars().all()

    # Build response
    sub_responses = []
    for sub in subscriptions:
        # Get user info
        user_result = await db.execute(
            select(User).outerjoin(Profile).where(User.id == sub.user_id)
        )
        user = user_result.scalar_one_or_none()

        sub_responses.append(AdminSubscriptionResponse(
            id=sub.id,
            user_email=user.email if user else "Unknown",
            user_name=user.profile.full_name if user and user.profile else None,
            tier=sub.tier,
            status=sub.status,
            amount_paise=sub.price_paise or 0,
            razorpay_payment_id=sub.razorpay_payment_id,
            razorpay_order_id=sub.razorpay_order_id,
            current_period_start=sub.current_period_start,
            current_period_end=sub.current_period_end,
            cancel_at_period_end=sub.cancel_at_period_end,
            created_at=sub.created_at,
        ))

    return AdminSubscriptionList(
        subscriptions=sub_responses,
        total=total,
        page=page,
        page_size=page_size,
    )
