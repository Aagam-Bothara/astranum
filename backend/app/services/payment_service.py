"""
Payment Service - Razorpay integration for Indian payments.

Handles subscription purchases and webhook processing.
"""

import hmac
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.tier_config import get_tier_config
from app.models.subscription import (
    Subscription,
    SubscriptionTier,
    SubscriptionStatus,
    CreditsLedger,
    CreditType,
    UsageLimit,
)


class PaymentService:
    """
    Handles Razorpay payment integration.

    Flow:
    1. create_order() - Creates Razorpay order for upgrade
    2. Frontend completes payment using Razorpay SDK
    3. verify_payment() - Verifies payment signature
    4. process_webhook() - Handles Razorpay webhooks
    5. activate_subscription() - Activates subscription after payment
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self._client = None

    @property
    def client(self):
        """Lazy load Razorpay client."""
        if self._client is None:
            if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
                raise ValueError(
                    "Razorpay credentials not configured. "
                    "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
                )
            import razorpay
            self._client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
        return self._client

    async def create_order(
        self,
        user_id: str,
        tier: SubscriptionTier,
    ) -> Dict[str, Any]:
        """
        Create a Razorpay order for subscription upgrade.

        Args:
            user_id: User ID
            tier: Target subscription tier

        Returns:
            Order details including order_id for frontend
        """
        tier_config = get_tier_config(tier)

        if tier_config.price_paise == 0:
            raise ValueError("Cannot create order for free tier")

        # Create Razorpay order
        order_data = {
            "amount": tier_config.price_paise,
            "currency": "INR",
            "receipt": f"sub_{user_id[:8]}_{tier.value[:3]}_{int(datetime.utcnow().timestamp())}",
            "notes": {
                "user_id": user_id,
                "tier": tier.value,
                "type": "subscription",
            },
        }

        order = self.client.order.create(data=order_data)

        return {
            "order_id": order["id"],
            "amount": tier_config.price_paise,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "tier": tier.value,
            "tier_name": tier.value.title(),
            "price_display": f"₹{tier_config.price_paise // 100}/month",
        }

    def verify_payment_signature(
        self,
        order_id: str,
        payment_id: str,
        signature: str,
    ) -> bool:
        """
        Verify Razorpay payment signature.

        Called after frontend payment completion.
        """
        message = f"{order_id}|{payment_id}"
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(signature, expected_signature)

    def verify_webhook_signature(
        self,
        body: bytes,
        signature: str,
    ) -> bool:
        """Verify Razorpay webhook signature."""
        expected_signature = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(signature, expected_signature)

    async def activate_subscription(
        self,
        user_id: str,
        tier: SubscriptionTier,
        payment_id: str,
        order_id: str,
    ) -> Subscription:
        """
        Activate subscription after successful payment.

        Creates or updates subscription record.
        """
        tier_config = get_tier_config(tier)

        # Check for existing subscription
        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.status == "active")
        )
        existing = result.scalar_one_or_none()

        now = datetime.utcnow()
        period_end = now + timedelta(days=30)

        if existing:
            # Upgrade existing subscription
            existing.tier = tier.value if isinstance(tier, SubscriptionTier) else tier
            existing.razorpay_payment_id = payment_id
            existing.razorpay_order_id = order_id
            existing.current_period_start = now
            existing.current_period_end = period_end
            existing.updated_at = now
            subscription = existing
        else:
            # Create new subscription
            subscription = Subscription(
                user_id=user_id,
                tier=tier.value if isinstance(tier, SubscriptionTier) else tier,
                status="active",
                razorpay_order_id=order_id,
                razorpay_payment_id=payment_id,
                current_period_start=now,
                current_period_end=period_end,
            )
            self.db.add(subscription)

        # Log to credits ledger
        ledger_entry = CreditsLedger(
            user_id=user_id,
            subscription_id=subscription.id if existing else None,
            credit_type=CreditType.PURCHASE,
            amount=tier_config.questions_monthly or 0,
            balance_after=tier_config.questions_monthly or 0,
            reference_id=payment_id,
            description=f"Subscription activated: {tier.value}",
        )
        self.db.add(ledger_entry)

        # Reset monthly usage for new period
        await self._reset_monthly_usage(user_id)

        await self.db.commit()
        await self.db.refresh(subscription)

        return subscription

    async def process_webhook(
        self,
        event_type: str,
        payload: Dict[str, Any],
    ) -> bool:
        """
        Process Razorpay webhook events.

        Events handled:
        - payment.captured: Payment successful
        - payment.failed: Payment failed
        - subscription.charged: Recurring payment
        - subscription.cancelled: User cancelled
        """
        if event_type == "payment.captured":
            return await self._handle_payment_captured(payload)
        elif event_type == "payment.failed":
            return await self._handle_payment_failed(payload)
        elif event_type == "subscription.charged":
            return await self._handle_subscription_charged(payload)
        elif event_type == "subscription.cancelled":
            return await self._handle_subscription_cancelled(payload)

        return True  # Acknowledge unknown events

    async def _handle_payment_captured(self, payload: Dict[str, Any]) -> bool:
        """Handle successful payment."""
        payment = payload.get("payment", {}).get("entity", {})
        notes = payment.get("notes", {})

        user_id = notes.get("user_id")
        tier_value = notes.get("tier")

        if not user_id or not tier_value:
            return False

        tier = SubscriptionTier(tier_value)
        await self.activate_subscription(
            user_id=user_id,
            tier=tier,
            payment_id=payment.get("id"),
            order_id=payment.get("order_id"),
        )

        return True

    async def _handle_payment_failed(self, payload: Dict[str, Any]) -> bool:
        """Handle failed payment - notify user but don't deactivate."""
        # TODO: Send notification to user
        return True

    async def _handle_subscription_charged(self, payload: Dict[str, Any]) -> bool:
        """Handle recurring subscription charge."""
        subscription = payload.get("subscription", {}).get("entity", {})
        notes = subscription.get("notes", {})

        user_id = notes.get("user_id")
        tier_value = notes.get("tier")

        if not user_id or not tier_value:
            return False

        # Extend subscription period
        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.status == "active")
        )
        sub = result.scalar_one_or_none()

        if sub:
            sub.current_period_end = sub.current_period_end + timedelta(days=30)
            await self._reset_monthly_usage(user_id)
            await self.db.commit()

        return True

    async def _handle_subscription_cancelled(self, payload: Dict[str, Any]) -> bool:
        """Handle subscription cancellation."""
        subscription = payload.get("subscription", {}).get("entity", {})
        notes = subscription.get("notes", {})

        user_id = notes.get("user_id")

        if not user_id:
            return False

        # Mark subscription as cancelled (but don't deactivate until period ends)
        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.status == "active")
        )
        sub = result.scalar_one_or_none()

        if sub:
            sub.cancel_at_period_end = True
            await self.db.commit()

        return True

    async def _reset_monthly_usage(self, user_id: str) -> None:
        """Reset monthly usage count for user."""
        result = await self.db.execute(
            select(UsageLimit)
            .where(UsageLimit.user_id == user_id)
            .order_by(UsageLimit.period_date.desc())
            .limit(1)
        )
        usage = result.scalar_one_or_none()

        if usage:
            usage.questions_used_monthly = 0

    async def cancel_subscription(self, user_id: str) -> bool:
        """
        Cancel user's subscription.

        Marks for cancellation at period end (user keeps access until then).
        """
        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.user_id == user_id)
            .where(Subscription.status == "active")
        )
        sub = result.scalar_one_or_none()

        if not sub:
            return False

        sub.cancel_at_period_end = True
        await self.db.commit()

        return True

    async def check_and_expire_subscriptions(self) -> int:
        """
        Check for expired subscriptions and deactivate them.

        Should be called periodically (e.g., daily cron job).
        Returns count of expired subscriptions.
        """
        now = datetime.utcnow()

        result = await self.db.execute(
            select(Subscription)
            .where(Subscription.status == "active")
            .where(Subscription.current_period_end < now)
            .where(Subscription.cancel_at_period_end == True)
        )
        expired = result.scalars().all()

        for sub in expired:
            sub.status = "expired"
            sub.tier = "free"

        await self.db.commit()

        return len(expired)
