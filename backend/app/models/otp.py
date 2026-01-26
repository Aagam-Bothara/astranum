"""OTP model for email/phone verification."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin
import enum


class OTPType(str, enum.Enum):
    """Type of OTP verification."""
    EMAIL = "email"
    PHONE = "phone"


class OTPPurpose(str, enum.Enum):
    """Purpose of OTP."""
    SIGNUP = "signup"
    LOGIN = "login"
    PASSWORD_RESET = "password_reset"


class OTP(Base, UUIDMixin):
    """OTP verification model."""

    __tablename__ = "otps"

    # Target (email or phone number)
    target: Mapped[str] = mapped_column(String(255), index=True)
    otp_type: Mapped[str] = mapped_column(
        Enum('email', 'phone', name='otptype', create_type=False)
    )
    purpose: Mapped[str] = mapped_column(
        Enum('signup', 'login', 'password_reset', name='otppurpose', create_type=False)
    )

    # OTP code (6 digits)
    code: Mapped[str] = mapped_column(String(6))

    # Status
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime)

    # Attempt tracking
    attempts: Mapped[int] = mapped_column(default=0)
