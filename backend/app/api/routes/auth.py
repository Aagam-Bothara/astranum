"""Authentication routes."""

import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserResponse, SendOTPRequest, VerifyOTPRequest
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings
from app.api.deps import get_db
from app.models.user import User
from app.models.otp import OTPType, OTPPurpose
from app.services.otp_service import OTPService

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""
    email: str


class ResetPasswordRequest(BaseModel):
    """Schema for reset password request."""
    email: str
    code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8)


class GoogleAuthRequest(BaseModel):
    """Schema for Google OAuth request."""
    credential: str  # The ID token from Google Sign-In


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user."""
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Check if phone number already exists (if provided)
    if user_data.phone_number:
        result = await db.execute(
            select(User).where(User.phone_number == user_data.phone_number)
        )
        existing_phone = result.scalar_one_or_none()

        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already linked to another account",
            )

    # Create user
    user = User(
        email=user_data.email,
        phone_number=user_data.phone_number,
        hashed_password=get_password_hash(user_data.password),
        is_active=True,
        email_verified=False,
        is_phone_verified=False,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        phone_number=user.phone_number,
        is_active=user.is_active,
        is_verified=user.email_verified,
        is_phone_verified=user.is_phone_verified or False,
    )


@router.post("/send-otp")
@limiter.limit("3/minute")
async def send_otp(
    request: Request,
    otp_request: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send OTP for verification."""
    otp_service = OTPService(db)

    # Determine OTP type
    otp_type = OTPType.EMAIL if otp_request.type == "email" else OTPType.PHONE
    purpose = OTPPurpose(otp_request.purpose)

    # Generate OTP
    code = await otp_service.create_otp(
        target=otp_request.target,
        otp_type=otp_type,
        purpose=purpose,
    )

    # Send OTP
    if otp_type == OTPType.EMAIL:
        success = await otp_service.send_email_otp(otp_request.target, code)
    else:
        success = await otp_service.send_sms_otp(otp_request.target, code)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP. Please try again.",
        )

    return {
        "message": f"OTP sent to {otp_request.target}",
        "expires_in_minutes": 10,
    }


@router.post("/verify-otp")
@limiter.limit("10/minute")
async def verify_otp(
    request: Request,
    otp_request: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP."""
    otp_service = OTPService(db)

    otp_type = OTPType.EMAIL if otp_request.type == "email" else OTPType.PHONE
    purpose = OTPPurpose(otp_request.purpose)

    success, message = await otp_service.verify_otp(
        target=otp_request.target,
        code=otp_request.code,
        otp_type=otp_type,
        purpose=purpose,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    # If signup verification, mark user as verified
    if purpose == OTPPurpose.SIGNUP:
        if otp_type == OTPType.EMAIL:
            result = await db.execute(
                select(User).where(User.email == otp_request.target)
            )
            user = result.scalar_one_or_none()
            if user:
                user.email_verified = True
                await db.commit()
        else:  # Phone verification
            result = await db.execute(
                select(User).where(User.phone_number == otp_request.target)
            )
            user = result.scalar_one_or_none()
            if user:
                user.is_phone_verified = True
                await db.commit()

    return {"message": message, "verified": True}


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login and get access token."""
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled",
        )

    # Create access token
    access_token = create_access_token(data={"sub": user.id})

    return Token(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout():
    """Logout (client-side token removal)."""
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    forgot_request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Request password reset OTP.

    Sends a 6-digit OTP to the user's email for password reset.
    """
    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == forgot_request.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        # Don't reveal if email exists or not for security
        return {
            "message": "If an account with this email exists, you will receive a password reset code.",
            "expires_in_minutes": 10,
        }

    # Generate and send OTP
    otp_service = OTPService(db)
    code = await otp_service.create_otp(
        target=forgot_request.email,
        otp_type=OTPType.EMAIL,
        purpose=OTPPurpose.PASSWORD_RESET,
    )

    success = await otp_service.send_email_otp(forgot_request.email, code)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset code. Please try again.",
        )

    return {
        "message": "If an account with this email exists, you will receive a password reset code.",
        "expires_in_minutes": 10,
    }


@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    reset_request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Reset password using OTP.

    Verifies the OTP and updates the user's password.
    """
    # Verify OTP first
    otp_service = OTPService(db)
    success, message = await otp_service.verify_otp(
        target=reset_request.email,
        code=reset_request.code,
        otp_type=OTPType.EMAIL,
        purpose=OTPPurpose.PASSWORD_RESET,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    # Find user and update password
    result = await db.execute(
        select(User).where(User.email == reset_request.email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )

    # Update password
    user.hashed_password = get_password_hash(reset_request.new_password)
    await db.commit()

    return {"message": "Password reset successfully. You can now login with your new password."}


@router.post("/google", response_model=Token)
@limiter.limit("10/minute")
async def google_auth(
    request: Request,
    google_request: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate with Google OAuth.

    Verifies the Google ID token and creates/logs in the user.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Sign-In not configured",
        )

    # Verify the ID token with Google
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={google_request.credential}"
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token",
                )

            token_info = response.json()

            # Verify the token is for our app
            if token_info.get("aud") != settings.GOOGLE_CLIENT_ID:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token not issued for this application",
                )

            email = token_info.get("email")
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email not provided by Google",
                )

            email_verified = token_info.get("email_verified", False)

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to verify Google token",
        )

    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()

    if user:
        # Existing user - log them in
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is disabled",
            )
    else:
        # New user - create account
        user = User(
            email=email,
            hashed_password="",  # No password for OAuth users
            is_active=True,
            email_verified=email_verified == "true" or email_verified is True,
            is_phone_verified=False,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Create access token
    access_token = create_access_token(data={"sub": user.id})

    return Token(access_token=access_token, token_type="bearer")
