"""Person Profile model - allows users to create profiles for different people."""

from datetime import date, time
from typing import Optional, TYPE_CHECKING
import enum

from sqlalchemy import Boolean, Date, Enum, ForeignKey, String, Time, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.chart import ChartSnapshot
    from app.models.conversation import Conversation


class Relationship(str, enum.Enum):
    """Relationship of the profile person to the user."""

    SELF = "self"  # User's own profile
    SPOUSE = "spouse"
    PARTNER = "partner"
    CHILD = "child"
    PARENT = "parent"
    SIBLING = "sibling"
    FRIEND = "friend"
    RELATIVE = "relative"
    OTHER = "other"


class PersonProfile(Base, UUIDMixin, TimestampMixin):
    """
    Profile for a person (self or others) with birth details.

    Each user can create multiple profiles for different people.
    All conversations are linked to a specific profile for context.
    """

    __tablename__ = "person_profiles"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    # Profile identification
    name: Mapped[str] = mapped_column(String(255))  # Full name for calculations
    nickname: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # Display name
    relation_type: Mapped[Relationship] = mapped_column(
        Enum(Relationship), default=Relationship.SELF
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)  # User's main profile

    # Birth Details (required for astrology/numerology)
    date_of_birth: Mapped[date] = mapped_column(Date)
    time_of_birth: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    place_of_birth: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    timezone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Optional notes about this person
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Avatar/color for UI distinction
    avatar_color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)  # Hex color

    # Soft delete
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="person_profiles")
    chart_snapshots: Mapped[list["ChartSnapshot"]] = relationship(
        "ChartSnapshot", back_populates="person_profile"
    )
    conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation", back_populates="person_profile"
    )

    @property
    def display_name(self) -> str:
        """Get display name (nickname or name)."""
        return self.nickname or self.name

    @property
    def full_name(self) -> str:
        """Get full name (alias for name, for compatibility with chart services)."""
        return self.name

    @property
    def has_birth_time(self) -> bool:
        """Check if birth time is available."""
        return self.time_of_birth is not None
