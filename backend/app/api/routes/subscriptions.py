"""Subscription routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.schemas.subscription import SubscriptionResponse, CreditBalance, UsageStatus
from app.models.subscription import SubscriptionTier, SubscriptionStatus
from app.api.deps import get_db, get_current_user
from app.services.credits_service import CreditsService
from app.services.payment_service import PaymentService
from app.core.tier_config import get_tier_config, get_tier_display_info, TIER_CONFIGS
from app.core.config import settings

router = APIRouter()


class PaymentVerification(BaseModel):
    """Request body for payment verification."""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.get("/current", response_model=SubscriptionResponse)
async def get_current_subscription(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get user's current subscription details."""
    credits_service = CreditsService(db)
    tier_config = await credits_service.get_tier_config(current_user.id)

    return SubscriptionResponse(
        tier=tier_config.tier.value if hasattr(tier_config.tier, 'value') else tier_config.tier,
        status="active",
        current_period_start=None,  # TODO: Get from subscription record
        current_period_end=None,
        price_display=(
            "Free" if tier_config.price_paise == 0
            else f"₹{tier_config.price_paise // 100}/month"
        ),
    )


@router.get("/usage", response_model=UsageStatus)
async def get_usage_status(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get detailed usage status.

    Shows daily/monthly limits and current usage.
    Also includes feature flags (use_validator, use_memory) for frontend.
    """
    credits_service = CreditsService(db)
    return await credits_service.check_can_ask(current_user.id)


@router.post("/upgrade/{tier}")
async def upgrade_subscription(
    tier: SubscriptionTier,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Initiate subscription upgrade.

    Returns payment order for Razorpay integration.

    Flow:
    1. Client calls this endpoint with target tier
    2. Server creates Razorpay order
    3. Client completes payment using Razorpay SDK
    4. Client calls /verify-payment with payment details
    5. Server verifies and activates subscription
    """
    if tier == SubscriptionTier.FREE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upgrade to free tier",
        )

    tier_config = get_tier_config(tier)

    if tier_config.price_paise == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This tier has no cost",
        )

    # Check if Razorpay is configured
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment system not configured. Please contact support.",
        )

    payment_service = PaymentService(db)

    try:
        order = await payment_service.create_order(current_user.id, tier)
        return order
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}",
        )


@router.post("/verify-payment")
async def verify_payment(
    verification: PaymentVerification,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Verify payment after Razorpay checkout completion.

    Called by frontend after successful payment.
    Verifies signature and activates subscription.
    """
    payment_service = PaymentService(db)

    # Verify payment signature
    if not payment_service.verify_payment_signature(
        verification.razorpay_order_id,
        verification.razorpay_payment_id,
        verification.razorpay_signature,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature",
        )

    # Get tier from order (stored in notes)
    try:
        order = payment_service.client.order.fetch(verification.razorpay_order_id)
        tier_value = order.get("notes", {}).get("tier")
        if not tier_value:
            raise ValueError("Tier not found in order")
        tier = SubscriptionTier(tier_value)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch order details: {str(e)}",
        )

    # Activate subscription
    subscription = await payment_service.activate_subscription(
        user_id=current_user.id,
        tier=tier,
        payment_id=verification.razorpay_payment_id,
        order_id=verification.razorpay_order_id,
    )

    return {
        "success": True,
        "message": f"Subscription upgraded to {tier.value}",
        "tier": tier.value,
        "period_end": subscription.current_period_end.isoformat() if subscription.current_period_end else None,
    }


@router.post("/webhook/razorpay")
async def razorpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_razorpay_signature: str = Header(None),
):
    """
    Handle Razorpay payment webhooks.

    Called by Razorpay when payment status changes.
    Configure this URL in Razorpay dashboard: {BACKEND_URL}/api/v1/subscriptions/webhook/razorpay

    Events handled:
    - payment.captured: Payment successful
    - payment.failed: Payment failed
    - subscription.charged: Recurring payment
    - subscription.cancelled: User cancelled
    """
    # Get raw body for signature verification
    body = await request.body()

    # Verify webhook signature
    if settings.RAZORPAY_WEBHOOK_SECRET:
        payment_service = PaymentService(db)
        if not payment_service.verify_webhook_signature(body, x_razorpay_signature or ""):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature",
            )

    # Parse webhook payload
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    event_type = payload.get("event")
    if not event_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing event type",
        )

    # Process webhook
    payment_service = PaymentService(db)
    success = await payment_service.process_webhook(event_type, payload.get("payload", {}))

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to process webhook",
        )

    return {"status": "ok"}


@router.get("/plans")
async def get_available_plans():
    """
    Get all available subscription plans with features and pricing.

    Returns tier information from centralized tier_config.py
    """
    plans = []
    for tier in [SubscriptionTier.FREE, SubscriptionTier.STARTER, SubscriptionTier.PRO, SubscriptionTier.MAX]:
        plans.append(get_tier_display_info(tier))

    return {"plans": plans}


@router.get("/plans/{tier}")
async def get_plan_details(tier: SubscriptionTier):
    """Get detailed information about a specific plan."""
    return get_tier_display_info(tier)


@router.get("/can-ask")
async def check_can_ask_question(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Quick check if user can ask a question.

    Frontend should call this before showing chat input.
    Returns simple boolean with optional upgrade message.
    """
    credits_service = CreditsService(db)
    usage = await credits_service.check_can_ask(current_user.id)

    # Suggest upgrade tiers based on current tier
    upgrade_tiers = []
    if not usage.can_ask_question:
        if usage.tier == "free":
            upgrade_tiers = [
                {"tier": "starter", "price_display": "₹99/month"},
                {"tier": "pro", "price_display": "₹699/month"},
            ]
        elif usage.tier == "starter":
            upgrade_tiers = [
                {"tier": "pro", "price_display": "₹699/month"},
                {"tier": "max", "price_display": "₹1,999/month"},
            ]
        elif usage.tier == "pro":
            upgrade_tiers = [
                {"tier": "max", "price_display": "₹1,999/month"},
            ]

    return {
        "can_ask": usage.can_ask_question,
        "message": usage.limit_message,
        "tier": usage.tier,
        "should_upgrade": not usage.can_ask_question,
        "upgrade_tiers": upgrade_tiers,
    }


@router.post("/cancel")
async def cancel_subscription(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Cancel current subscription.

    Subscription remains active until the end of the current billing period.
    User will be downgraded to Free tier after period ends.
    """
    payment_service = PaymentService(db)
    success = await payment_service.cancel_subscription(current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription to cancel",
        )

    return {
        "success": True,
        "message": "Subscription will be cancelled at the end of the current billing period",
    }
