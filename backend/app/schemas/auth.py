"""Authentication schemas."""

from typing import Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """JWT token payload."""

    sub: str  # user_id
    exp: Optional[int] = None


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str
