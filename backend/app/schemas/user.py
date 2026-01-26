"""User and Profile schemas."""

from datetime import date, time
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.user import GuidanceMode, Language, ResponseStyle


class UserCreate(BaseModel):
    """Schema for creating a new user."""

    email: EmailStr
    phone_number: Optional[str] = Field(None, pattern=r'^\+?[0-9]{10,15}$')
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    """Schema for user response."""

    id: str
    email: str
    phone_number: Optional[str] = None
    is_active: bool
    is_verified: bool
    is_phone_verified: bool = False

    class Config:
        from_attributes = True


class SendOTPRequest(BaseModel):
    """Schema for requesting OTP."""

    target: str  # email or phone number
    type: str = Field(pattern=r'^(email|phone)$')  # "email" or "phone"
    purpose: str = Field(default="signup", pattern=r'^(signup|login|password_reset)$')


class VerifyOTPRequest(BaseModel):
    """Schema for verifying OTP."""

    target: str  # email or phone number
    code: str = Field(min_length=6, max_length=6)
    type: str = Field(pattern=r'^(email|phone)$')
    purpose: str = Field(default="signup", pattern=r'^(signup|login|password_reset)$')


class ProfileCreate(BaseModel):
    """Schema for creating a user profile."""

    full_name: str = Field(min_length=1, max_length=255)
    display_name: Optional[str] = Field(None, max_length=100)

    # Birth details
    date_of_birth: date
    time_of_birth: Optional[time] = None
    place_of_birth: Optional[str] = Field(None, max_length=255)

    # Preferences
    guidance_mode: GuidanceMode = GuidanceMode.BOTH
    language: Language = Language.HINGLISH
    response_style: ResponseStyle = ResponseStyle.BALANCED


class ProfileUpdate(BaseModel):
    """Schema for updating a user profile."""

    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    display_name: Optional[str] = Field(None, max_length=100)
    time_of_birth: Optional[time] = None
    place_of_birth: Optional[str] = Field(None, max_length=255)
    guidance_mode: Optional[GuidanceMode] = None
    language: Optional[Language] = None
    response_style: Optional[ResponseStyle] = None


class ProfileResponse(BaseModel):
    """Schema for profile response."""

    id: str
    full_name: str
    display_name: Optional[str]
    date_of_birth: date
    time_of_birth: Optional[time]
    place_of_birth: Optional[str]
    guidance_mode: GuidanceMode
    language: Language
    response_style: ResponseStyle = ResponseStyle.BALANCED
    has_birth_time: bool = False

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_computed(cls, profile):
        """Create response with computed fields."""
        return cls(
            id=profile.id,
            full_name=profile.full_name,
            display_name=profile.display_name,
            date_of_birth=profile.date_of_birth,
            time_of_birth=profile.time_of_birth,
            place_of_birth=profile.place_of_birth,
            guidance_mode=profile.guidance_mode,
            language=profile.language,
            response_style=getattr(profile, 'response_style', ResponseStyle.BALANCED),
            has_birth_time=profile.time_of_birth is not None,
        )
