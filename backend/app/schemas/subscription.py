"""Subscription and usage schemas."""

from datetime import date
from typing import Optional

from pydantic import BaseModel


class SubscriptionResponse(BaseModel):
    """Current subscription details."""

    tier: str  # "free", "starter", "pro", "max"
    status: str  # "active", "cancelled", "expired", "paused"
    current_period_start: Optional[date] = None
    current_period_end: Optional[date] = None
    price_display: str  # e.g., "₹99/month"

    class Config:
        from_attributes = True


class CreditBalance(BaseModel):
    """User's current credit balance."""

    total_credits: int
    credits_used_this_month: int
    credits_remaining: int


class UsageStatus(BaseModel):
    """Current usage status against limits."""

    tier: str  # "free", "starter", "pro", "max"

    # Daily limits
    daily_limit: int
    daily_used: int
    daily_remaining: int

    # Monthly limits
    monthly_limit: int
    monthly_used: int
    monthly_remaining: int

    # Free tier lifetime (only for free users)
    lifetime_limit: Optional[int] = None
    lifetime_used: Optional[int] = None
    lifetime_remaining: Optional[int] = None

    # Character limit per response
    max_response_chars: int

    # Status flags
    can_ask_question: bool
    limit_message: Optional[str] = None  # e.g., "Daily limit reached, try again tomorrow"

    # Feature flags (from tier config)
    use_validator: bool = False  # Pro only: Generator + Validator pipeline
    use_memory: bool = False  # Pro only: Cross-chat consistency


class UsageCheckResponse(BaseModel):
    """Response for pre-question usage check."""

    allowed: bool
    usage: UsageStatus
    message: Optional[str] = None
