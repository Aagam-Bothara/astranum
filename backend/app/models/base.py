"""Base model with common fields."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, String, func, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.core.config import settings


class Base(DeclarativeBase):
    """Base class for all models."""

    pass


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    """Mixin for UUID primary key (compatible with SQLite and PostgreSQL)."""

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )


# Database-agnostic JSON type
# Use JSONB for PostgreSQL, JSON for SQLite
def get_json_type():
    """Get appropriate JSON column type based on database."""
    if "postgresql" in settings.DATABASE_URL:
        from sqlalchemy.dialects.postgresql import JSONB
        return JSONB
    return JSON

JSONType = get_json_type()
