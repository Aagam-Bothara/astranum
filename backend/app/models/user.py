"""User and Profile models."""

from datetime import date, time
from typing import Optional

from sqlalchemy import Boolean, Date, Enum, ForeignKey, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin
import enum


class GuidanceMode(str, enum.Enum):
    """User's preferred guidance mode."""

    ASTROLOGY = "astrology"
    NUMEROLOGY = "numerology"
    BOTH = "both"


class Language(str, enum.Enum):
    """Supported languages."""

    ENGLISH = "en"
    HINDI = "hi"
    HINGLISH = "hinglish"


class ResponseStyle(str, enum.Enum):
    """User's preferred response style from the AI."""

    SUPPORTIVE = "supportive"  # Warm, encouraging, emotionally supportive
    BALANCED = "balanced"      # Mix of warmth and directness (default)
    DIRECT = "direct"          # Blunt, precise, no sugar coating


class User(Base, UUIDMixin, TimestampMixin):
    """User account model."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_phone_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=True)

    # Relationships
    profile: Mapped[Optional["Profile"]] = relationship(
        "Profile", back_populates="user", uselist=False
    )
    subscriptions: Mapped[list["Subscription"]] = relationship(
        "Subscription", back_populates="user"
    )
    conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation", back_populates="user"
    )
    chart_snapshots: Mapped[list["ChartSnapshot"]] = relationship(
        "ChartSnapshot", back_populates="user"
    )
    person_profiles: Mapped[list["PersonProfile"]] = relationship(
        "PersonProfile", back_populates="user"
    )


class Profile(Base, UUIDMixin, TimestampMixin):
    """User profile with birth details."""

    __tablename__ = "profiles"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )

    # Personal Info
    full_name: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Birth Details (for astrology/numerology)
    date_of_birth: Mapped[date] = mapped_column(Date)
    time_of_birth: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    place_of_birth: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    timezone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Preferences
    guidance_mode: Mapped[GuidanceMode] = mapped_column(
        Enum(GuidanceMode), default=GuidanceMode.BOTH
    )
    language: Mapped[Language] = mapped_column(Enum(Language), default=Language.HINGLISH)
    response_style: Mapped[ResponseStyle] = mapped_column(
        Enum(ResponseStyle), default=ResponseStyle.BALANCED
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")


# Import for type hints (avoid circular imports)
from app.models.subscription import Subscription  # noqa: E402
from app.models.conversation import Conversation  # noqa: E402
from app.models.chart import ChartSnapshot  # noqa: E402
from app.models.person_profile import PersonProfile  # noqa: E402
