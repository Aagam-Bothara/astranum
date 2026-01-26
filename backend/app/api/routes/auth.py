"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import Token, LoginRequest
from app.schemas.user import UserCreate, UserResponse, SendOTPRequest, VerifyOTPRequest
from app.core.security import create_access_token, verify_password, get_password_hash
from app.api.deps import get_db
from app.models.user import User
from app.models.otp import OTPType, OTPPurpose
from app.services.otp_service import OTPService

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
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
        is_verified=False,
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
        is_verified=user.is_verified,
        is_phone_verified=user.is_phone_verified,
    )


@router.post("/send-otp")
async def send_otp(
    request: SendOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send OTP for verification."""
    otp_service = OTPService(db)

    # Determine OTP type
    otp_type = OTPType.EMAIL if request.type == "email" else OTPType.PHONE
    purpose = OTPPurpose(request.purpose)

    # Generate OTP
    code = await otp_service.create_otp(
        target=request.target,
        otp_type=otp_type,
        purpose=purpose,
    )

    # Send OTP
    if otp_type == OTPType.EMAIL:
        success = await otp_service.send_email_otp(request.target, code)
    else:
        success = await otp_service.send_sms_otp(request.target, code)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP. Please try again.",
        )

    return {
        "message": f"OTP sent to {request.target}",
        "expires_in_minutes": 10,
    }


@router.post("/verify-otp")
async def verify_otp(
    request: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP."""
    otp_service = OTPService(db)

    otp_type = OTPType.EMAIL if request.type == "email" else OTPType.PHONE
    purpose = OTPPurpose(request.purpose)

    success, message = await otp_service.verify_otp(
        target=request.target,
        code=request.code,
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
                select(User).where(User.email == request.target)
            )
            user = result.scalar_one_or_none()
            if user:
                user.is_verified = True
                await db.commit()
        else:  # Phone verification
            result = await db.execute(
                select(User).where(User.phone_number == request.target)
            )
            user = result.scalar_one_or_none()
            if user:
                user.is_phone_verified = True
                await db.commit()

    return {"message": message, "verified": True}


@router.post("/login", response_model=Token)
async def login(
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
