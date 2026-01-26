"""Person Profile schemas for API requests/responses."""

from datetime import date, time, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

# Relationship enum values are stored as strings in database


class PersonProfileCreate(BaseModel):
    """Schema for creating a new person profile."""

    name: str = Field(..., min_length=2, max_length=255, description="Full name for calculations")
    nickname: Optional[str] = Field(None, max_length=100, description="Display name")
    relation_type: str = Field(default="self", description="Relationship to user")

    # Birth details
    date_of_birth: date = Field(..., description="Date of birth")
    time_of_birth: Optional[time] = Field(None, description="Time of birth (optional but recommended for accurate charts)")
    place_of_birth: str = Field(..., min_length=2, max_length=255, description="Place of birth (required for astrology calculations)")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="Latitude (auto-filled from place)")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="Longitude (auto-filled from place)")
    timezone: Optional[str] = Field(None, max_length=50, description="Timezone (e.g., 'Asia/Kolkata')")

    # Optional
    notes: Optional[str] = Field(None, description="Notes about this person")
    avatar_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", description="Hex color")
    is_primary: bool = Field(default=False, description="Set as primary profile")

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, v: date) -> date:
        """Validate date of birth is not in the future."""
        if v > date.today():
            raise ValueError("Date of birth cannot be in the future")
        return v


class PersonProfileUpdate(BaseModel):
    """Schema for updating a person profile."""

    name: Optional[str] = Field(None, min_length=2, max_length=255)
    nickname: Optional[str] = Field(None, max_length=100)
    relation_type: Optional[str] = None

    # Birth details
    date_of_birth: Optional[date] = None
    time_of_birth: Optional[time] = None
    place_of_birth: Optional[str] = Field(None, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    timezone: Optional[str] = Field(None, max_length=50)

    # Optional
    notes: Optional[str] = None
    avatar_color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    is_primary: Optional[bool] = None


class PersonProfileResponse(BaseModel):
    """Schema for person profile response."""

    id: str
    name: str
    nickname: Optional[str]
    relation_type: str
    is_primary: bool

    # Birth details
    date_of_birth: date
    time_of_birth: Optional[time]
    place_of_birth: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    timezone: Optional[str]
    has_birth_time: bool

    # Optional
    notes: Optional[str]
    avatar_color: Optional[str]

    # Metadata
    created_at: datetime
    updated_at: datetime

    # Stats
    conversation_count: int = 0
    last_conversation_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PersonProfileSummary(BaseModel):
    """Brief profile summary for lists."""

    id: str
    name: str
    nickname: Optional[str]
    relation_type: str
    is_primary: bool
    avatar_color: Optional[str]
    date_of_birth: date
    has_birth_time: bool
    conversation_count: int = 0

    model_config = {"from_attributes": True}


class PersonProfileListResponse(BaseModel):
    """Response for listing profiles."""

    profiles: List[PersonProfileSummary]
    total: int
    max_profiles: int  # Based on tier


class ProfileContextSummary(BaseModel):
    """Summary of a profile's conversation context for LLM."""

    profile_id: str
    profile_name: str
    relation_type: str
    recent_topics: List[str]  # Last N conversation topics/themes
    key_insights: List[str]  # Important insights from past conversations
    last_guidance_date: Optional[datetime]
    total_conversations: int
