"""Subscription, Credits, and Usage models."""

from datetime import date, datetime
from typing import Optional
import enum

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin, JSONType


class SubscriptionTier(str, enum.Enum):
    """Subscription tiers."""

    FREE = "free"
    STARTER = "starter"  # ₹99
    PRO = "pro"  # ₹699
    MAX = "max"  # ₹1999


class SubscriptionStatus(str, enum.Enum):
    """Subscription status."""

    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PAUSED = "paused"


class CreditType(str, enum.Enum):
    """Types of credit transactions."""

    SUBSCRIPTION_GRANT = "subscription_grant"  # Monthly credits from subscription
    PURCHASE = "purchase"  # One-time purchase
    USAGE = "usage"  # Credit used for question
    REFUND = "refund"  # Credit refunded
    BONUS = "bonus"  # Promotional bonus
    EXPIRY = "expiry"  # Credits expired


class Subscription(Base, UUIDMixin, TimestampMixin):
    """User subscription details."""

    __tablename__ = "subscriptions"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    tier: Mapped[str] = mapped_column(
        String(20), default="free"
    )
    status: Mapped[str] = mapped_column(
        String(20), default="active"
    )

    # Billing
    current_period_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    current_period_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    price_paise: Mapped[int] = mapped_column(Integer, default=0)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, default=False)

    # Razorpay payment reference
    razorpay_order_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    razorpay_payment_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    razorpay_subscription_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )  # For recurring subscriptions

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subscriptions")


class CreditsLedger(Base, UUIDMixin, TimestampMixin):
    """
    Credit transaction ledger.

    All credit changes are logged here for auditability.
    Current balance = SUM of all transactions for user.
    """

    __tablename__ = "credits_ledger"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    subscription_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True
    )

    # Transaction details
    credit_type: Mapped[CreditType] = mapped_column(Enum(CreditType))
    amount: Mapped[int] = mapped_column(Integer)  # Positive for grants, negative for usage
    balance_after: Mapped[int] = mapped_column(Integer)  # Running balance

    # Reference
    reference_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )  # e.g., message_id for usage
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    extra_data: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)


class UsageLimit(Base, UUIDMixin, TimestampMixin):
    """
    Daily/monthly usage tracking.

    Tracks usage against tier limits to enforce rate limiting.
    """

    __tablename__ = "usage_limits"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    # Period tracking
    period_date: Mapped[date] = mapped_column(Date, index=True)  # Day for daily, 1st of month for monthly

    # Usage counts
    questions_used_daily: Mapped[int] = mapped_column(Integer, default=0)
    questions_used_monthly: Mapped[int] = mapped_column(Integer, default=0)
    characters_used: Mapped[int] = mapped_column(Integer, default=0)

    # Free tier lifetime tracking (separate from period)
    free_questions_used_lifetime: Mapped[int] = mapped_column(Integer, default=0)

    class Meta:
        """Unique constraint on user + period."""

        __table_args__ = (
            # Index for quick lookups
            {"postgresql_partition_by": "RANGE (period_date)"},
        )


from app.models.user import User  # noqa: E402
