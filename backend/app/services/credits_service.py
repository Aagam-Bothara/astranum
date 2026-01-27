"""
Credits and Usage Service - Manages subscription limits and usage tracking.

All credit logic is server-side for security.
"""

from datetime import date, datetime
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.subscription import (
    Subscription,
    SubscriptionTier,
    SubscriptionStatus,
    UsageLimit,
    CreditsLedger,
    CreditType,
)
from app.schemas.subscription import UsageStatus
from app.core.tier_config import get_tier_config, TierConfig


class CreditsService:
    """
    Manages credits, usage limits, and subscription enforcement.

    Tier limits are defined in tier_config.py:
    - Free: 2 questions lifetime, 400 chars max
    - Starter: 15/month, 3/day, 800 chars
    - Pro: 80/month, 4/day, 1200 chars
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_can_ask(self, user_id: str) -> UsageStatus:
        """
        Check if user can ask a question based on their tier and usage.

        Returns UsageStatus with current limits and whether question is allowed.
        """
        subscription = await self._get_active_subscription(user_id)
        tier = self._get_tier_enum(subscription.tier if subscription else "free")

        usage = await self._get_or_create_usage(user_id)

        # Get limits based on tier
        limits = self._get_tier_limits(tier)

        # Check limits
        can_ask = True
        limit_message = None

        if tier == SubscriptionTier.FREE:
            if usage.free_questions_used_lifetime >= limits["lifetime"]:
                can_ask = False
                limit_message = "You've used your 2 free questions. Upgrade to continue."
        else:
            # Check daily limit
            if usage.questions_used_daily >= limits["daily"]:
                can_ask = False
                limit_message = f"Daily limit reached ({limits['daily']} questions). Try again tomorrow."
            # Check monthly limit
            elif usage.questions_used_monthly >= limits["monthly"]:
                can_ask = False
                limit_message = f"Monthly limit reached ({limits['monthly']} questions). Upgrade for more."

        return UsageStatus(
            tier=tier.value.lower(),
            daily_limit=limits.get("daily", 0),
            daily_used=usage.questions_used_daily,
            daily_remaining=max(0, limits.get("daily", 0) - usage.questions_used_daily),
            monthly_limit=limits.get("monthly", 0),
            monthly_used=usage.questions_used_monthly,
            monthly_remaining=max(0, limits.get("monthly", 0) - usage.questions_used_monthly),
            lifetime_limit=limits.get("lifetime"),
            lifetime_used=usage.free_questions_used_lifetime if tier == SubscriptionTier.FREE else None,
            lifetime_remaining=(
                max(0, limits.get("lifetime", 0) - usage.free_questions_used_lifetime)
                if tier == SubscriptionTier.FREE else None
            ),
            max_response_chars=limits["max_chars"],
            can_ask_question=can_ask,
            limit_message=limit_message,
            use_validator=limits.get("use_validator", False),
            use_memory=limits.get("use_memory", False),
        )

    async def get_tier_config(self, user_id: str) -> TierConfig:
        """
        Get the full tier configuration for a user.

        Useful for guidance service to know all feature flags.
        """
        subscription = await self._get_active_subscription(user_id)
        tier = self._get_tier_enum(subscription.tier if subscription else "free")
        return get_tier_config(tier)

    async def deduct_usage(self, user_id: str, message_id: str) -> bool:
        """
        Deduct one question from user's usage.

        Should be called AFTER successful response generation.
        Returns True if deduction was successful.
        """
        usage = await self._get_or_create_usage(user_id)
        subscription = await self._get_active_subscription(user_id)
        tier = self._get_tier_enum(subscription.tier if subscription else "free")

        # Update usage counts
        usage.questions_used_daily += 1
        usage.questions_used_monthly += 1
        usage.characters_used += 1  # Will be updated with actual chars

        if tier == SubscriptionTier.FREE:
            usage.free_questions_used_lifetime += 1

        # Log to ledger
        ledger_entry = CreditsLedger(
            user_id=user_id,
            subscription_id=subscription.id if subscription else None,
            credit_type=CreditType.USAGE,
            amount=-1,
            balance_after=0,  # TODO: Calculate actual balance
            reference_id=message_id,
            description="Question asked",
        )
        self.db.add(ledger_entry)

        await self.db.commit()
        return True

    async def _get_active_subscription(self, user_id: str) -> Optional[Subscription]:
        """Get user's active subscription."""
        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.status == SubscriptionStatus.ACTIVE.value)
            .order_by(Subscription.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    def _get_tier_enum(self, tier_str: str) -> SubscriptionTier:
        """Convert tier string to enum, handling unknown values gracefully."""
        try:
            # Database stores uppercase values
            return SubscriptionTier(tier_str.upper() if tier_str else "FREE")
        except ValueError:
            return SubscriptionTier.FREE

    async def _get_or_create_usage(self, user_id: str) -> UsageLimit:
        """Get or create usage record for today."""
        today = date.today()

        result = await self.db.execute(
            select(UsageLimit)
            .where(UsageLimit.user_id == user_id)
            .where(UsageLimit.period_date == today)
        )
        usage = result.scalar_one_or_none()

        if usage is None:
            # Create new usage record for today
            # First, get lifetime count from most recent record
            prev_result = await self.db.execute(
                select(UsageLimit)
                .where(UsageLimit.user_id == user_id)
                .order_by(UsageLimit.period_date.desc())
                .limit(1)
            )
            prev_usage = prev_result.scalar_one_or_none()

            # Check if it's a new month (reset monthly count)
            monthly_count = 0
            if prev_usage and prev_usage.period_date.month == today.month:
                monthly_count = prev_usage.questions_used_monthly

            usage = UsageLimit(
                user_id=user_id,
                period_date=today,
                questions_used_daily=0,
                questions_used_monthly=monthly_count,
                free_questions_used_lifetime=(
                    prev_usage.free_questions_used_lifetime if prev_usage else 0
                ),
            )
            self.db.add(usage)
            await self.db.flush()

        return usage

    def _get_tier_limits(self, tier: SubscriptionTier) -> dict:
        """Get limits for a subscription tier from centralized config."""
        config = get_tier_config(tier)

        limits = {
            "max_chars": config.response.max_characters,
            "use_validator": config.response.use_validator,
            "use_memory": config.response.use_memory,
        }

        if config.questions_lifetime is not None:
            limits["lifetime"] = config.questions_lifetime

        if config.questions_monthly is not None:
            limits["monthly"] = config.questions_monthly

        if config.questions_daily is not None:
            limits["daily"] = config.questions_daily

        return limits
