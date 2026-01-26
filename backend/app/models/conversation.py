"""Conversation and Message models."""

from typing import Optional
import enum

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin, JSONType
from app.models.user import GuidanceMode, Language


class MessageRole(str, enum.Enum):
    """Message role in conversation."""

    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Conversation(Base, UUIDMixin, TimestampMixin):
    """A conversation session with a user."""

    __tablename__ = "conversations"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    chart_snapshot_id: Mapped[str] = mapped_column(
        ForeignKey("chart_snapshots.id", ondelete="SET NULL"), nullable=True
    )
    person_profile_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("person_profiles.id", ondelete="CASCADE"), index=True, nullable=True
    )

    # Conversation context
    mode: Mapped[GuidanceMode] = mapped_column(Enum(GuidanceMode))
    language: Mapped[Language] = mapped_column(Enum(Language))
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(
        "Message", back_populates="conversation", order_by="Message.created_at"
    )
    person_profile: Mapped[Optional["PersonProfile"]] = relationship(
        "PersonProfile", back_populates="conversations"
    )


class Message(Base, UUIDMixin, TimestampMixin):
    """Individual message in a conversation."""

    __tablename__ = "messages"

    conversation_id: Mapped[str] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )

    # Message content
    role: Mapped[MessageRole] = mapped_column(Enum(MessageRole))
    content: Mapped[str] = mapped_column(Text)
    char_count: Mapped[int] = mapped_column(Integer)

    # Response metadata (for assistant messages)
    response_metadata: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)
    # Structure:
    # {
    #     "empathy_line": "I understand your concern...",
    #     "reasons": ["Your Sun in Aries suggests...", "Life path 7 indicates..."],
    #     "direction": "Consider focusing on...",
    #     "caution": "Be mindful of...",
    #     "data_points_used": ["sun_sign", "life_path"],
    #     "validation_passed": true
    # }

    # Validation tracking
    was_regenerated: Mapped[bool] = mapped_column(default=False)
    validation_issues: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)

    # Relationships
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )


from app.models.user import User  # noqa: E402
from app.models.person_profile import PersonProfile  # noqa: E402
