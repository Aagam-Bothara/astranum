"""User routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import ProfileCreate, ProfileUpdate, ProfileResponse, UserResponse
from app.api.deps import get_db, get_current_user
from app.models.person_profile import PersonProfile

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user=Depends(get_current_user),
):
    """Get current user information."""
    return current_user


@router.post("/profile", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile_data: ProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Create user profile with birth details.

    This is required before using guidance features.
    """
    # TODO: Implement profile creation
    # 1. Check if profile already exists
    # 2. Geocode place_of_birth to get lat/lng
    # 3. Create profile record
    # 4. Trigger initial chart computation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Profile creation not yet implemented",
    )


@router.get("/profile")
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get current user's primary profile."""
    # Get the primary person profile for this user
    result = await db.execute(
        select(PersonProfile).where(
            PersonProfile.user_id == current_user.id,
            PersonProfile.is_primary == True,
            PersonProfile.is_active == True,
        )
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile found. Please complete onboarding.",
        )

    # Return in the format expected by frontend
    return {
        "id": profile.id,
        "full_name": profile.name,
        "display_name": profile.nickname or profile.name,
        "date_of_birth": profile.date_of_birth.isoformat() if profile.date_of_birth else None,
        "time_of_birth": profile.time_of_birth.isoformat() if profile.time_of_birth else None,
        "place_of_birth": profile.place_of_birth,
        "guidance_mode": "both",  # Default
        "language": "hinglish",  # Default
        "has_birth_time": profile.time_of_birth is not None,
    }


@router.patch("/profile")
async def update_profile(
    profile_data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Update user profile.

    Note: Changing birth details will trigger chart recomputation.
    """
    # Get the primary person profile for this user
    result = await db.execute(
        select(PersonProfile).where(
            PersonProfile.user_id == current_user.id,
            PersonProfile.is_primary == True,
            PersonProfile.is_active == True,
        )
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile found. Please complete onboarding.",
        )

    # Update fields if provided
    update_data = profile_data.model_dump(exclude_unset=True)

    if "full_name" in update_data:
        profile.name = update_data["full_name"]
    if "display_name" in update_data:
        profile.nickname = update_data["display_name"]
    if "time_of_birth" in update_data:
        profile.time_of_birth = update_data["time_of_birth"]
    if "place_of_birth" in update_data:
        profile.place_of_birth = update_data["place_of_birth"]

    await db.commit()
    await db.refresh(profile)

    # Return in the format expected by frontend
    return {
        "id": profile.id,
        "full_name": profile.name,
        "display_name": profile.nickname or profile.name,
        "date_of_birth": profile.date_of_birth.isoformat() if profile.date_of_birth else None,
        "time_of_birth": profile.time_of_birth.isoformat() if profile.time_of_birth else None,
        "place_of_birth": profile.place_of_birth,
        "guidance_mode": "both",
        "language": "hinglish",
        "has_birth_time": profile.time_of_birth is not None,
    }
