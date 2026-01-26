"""Chart snapshot model - stores computed astrology/numerology data."""

from typing import Optional

from sqlalchemy import Enum, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin, JSONType
from app.models.user import GuidanceMode


class ChartSnapshot(Base, UUIDMixin, TimestampMixin):
    """
    Stores computed chart data from deterministic engines.

    This is the source of truth for LLM guidance - no hallucinations allowed.
    LLM can ONLY reference data present in this snapshot.
    """

    __tablename__ = "chart_snapshots"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    person_profile_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("person_profiles.id", ondelete="CASCADE"), index=True, nullable=True
    )

    # Chart type
    mode: Mapped[GuidanceMode] = mapped_column(Enum(GuidanceMode))
    version: Mapped[int] = mapped_column(Integer, default=1)

    # Numerology Data (computed from name + DOB)
    numerology_data: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)
    # Structure:
    # {
    #     "life_path": 7,
    #     "destiny_number": 3,
    #     "soul_urge": 5,
    #     "personality": 8,
    #     "birth_day": 15,
    #     "name_used": "Sachin Kumar"
    # }

    # Astrology Data (computed from DOB, time, place)
    astrology_data: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)
    # Structure:
    # {
    #     "sun_sign": {"sign": "Aries", "degree": 15.5},
    #     "moon_sign": {"sign": "Cancer", "degree": 22.3},
    #     "ascendant": {"sign": "Leo", "degree": 5.2},  # if time provided
    #     "planets": {
    #         "mercury": {"sign": "Pisces", "degree": 28.1},
    #         "venus": {"sign": "Taurus", "degree": 10.0},
    #         ...
    #     },
    #     "moon_nakshatra": "Pushya",  # optional
    #     "houses": {...},  # if time provided
    #     "has_birth_time": true
    # }

    # Transit data (current planetary positions at time of snapshot)
    transit_data: Mapped[Optional[dict]] = mapped_column(JSONType, nullable=True)
    # Structure:
    # {
    #     "date": "2024-01-15",
    #     "planets": {
    #         "sun": {"sign": "Capricorn", "degree": 25.0},
    #         ...
    #     }
    # }

    # Metadata
    input_hash: Mapped[str] = mapped_column(String(64))  # Hash of inputs for caching
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="chart_snapshots")
    person_profile: Mapped[Optional["PersonProfile"]] = relationship(
        "PersonProfile", back_populates="chart_snapshots"
    )


from app.models.user import User  # noqa: E402
from app.models.person_profile import PersonProfile  # noqa: E402
