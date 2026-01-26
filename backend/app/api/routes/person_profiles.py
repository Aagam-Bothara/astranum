"""Person Profile routes - manage profiles for self and others."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.person_profile import (
    PersonProfileCreate,
    PersonProfileUpdate,
    PersonProfileResponse,
    PersonProfileSummary,
    PersonProfileListResponse,
    ProfileContextSummary,
)
from app.services.person_profile_service import PersonProfileService
from app.api.deps import get_db, get_current_user, get_current_tier
from app.models.subscription import SubscriptionTier

router = APIRouter()


@router.post(
    "",
    response_model=PersonProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a person profile",
)
async def create_profile(
    profile_data: PersonProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    tier: SubscriptionTier = Depends(get_current_tier),
):
    """
    Create a new person profile.

    Profiles allow you to track guidance for different people:
    - Self (your own profile)
    - Family members (spouse, children, parents)
    - Friends

    **Profile Limits by Tier:**
    - Free: 1 profile (self only)
    - Starter (₹99): 3 profiles
    - Pro (₹699): 10 profiles

    Each profile maintains its own conversation history and context.
    """
    service = PersonProfileService(db)

    try:
        profile = await service.create_profile(
            user_id=current_user.id,
            data=profile_data,
            tier=tier,
        )
        return await service.get_profile_with_stats(profile.id, current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "",
    response_model=PersonProfileListResponse,
    summary="List all profiles",
)
async def list_profiles(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    tier: SubscriptionTier = Depends(get_current_tier),
):
    """
    List all person profiles for the current user.

    Returns profiles sorted by primary status and creation date.
    """
    service = PersonProfileService(db)
    profiles = await service.list_profiles(current_user.id)

    # Get stats for each profile
    summaries = []
    for profile in profiles:
        stats = await service._get_profile_stats(profile.id)
        summaries.append(
            PersonProfileSummary(
                id=profile.id,
                name=profile.name,
                nickname=profile.nickname,
                relationship=profile.relation_type,
                is_primary=profile.is_primary,
                avatar_color=profile.avatar_color,
                date_of_birth=profile.date_of_birth,
                has_birth_time=profile.has_birth_time,
                conversation_count=stats["conversation_count"],
            )
        )

    max_profiles = PersonProfileService.PROFILE_LIMITS.get(tier, 1)

    return PersonProfileListResponse(
        profiles=summaries,
        total=len(summaries),
        max_profiles=max_profiles,
    )


@router.get(
    "/primary",
    response_model=PersonProfileResponse,
    summary="Get primary profile",
)
async def get_primary_profile(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get the user's primary (default) profile.

    The primary profile is used when no specific profile is selected.
    """
    service = PersonProfileService(db)
    profile = await service.get_primary_profile(current_user.id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No primary profile found. Please create a profile first.",
        )

    return await service.get_profile_with_stats(profile.id, current_user.id)


@router.get(
    "/{profile_id}",
    response_model=PersonProfileResponse,
    summary="Get profile details",
)
async def get_profile(
    profile_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get detailed information about a specific profile."""
    service = PersonProfileService(db)
    response = await service.get_profile_with_stats(profile_id, current_user.id)

    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return response


@router.patch(
    "/{profile_id}",
    response_model=PersonProfileResponse,
    summary="Update profile",
)
async def update_profile(
    profile_id: str,
    profile_data: PersonProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Update a person profile.

    **Note:** Changing birth details will invalidate cached charts.
    New charts will be computed on the next guidance request.
    """
    service = PersonProfileService(db)
    profile = await service.update_profile(profile_id, current_user.id, profile_data)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return await service.get_profile_with_stats(profile.id, current_user.id)


@router.delete(
    "/{profile_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete profile",
)
async def delete_profile(
    profile_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Delete a person profile.

    **Warning:** This will also delete all conversations associated with this profile.

    **Note:** You cannot delete your only profile.
    """
    service = PersonProfileService(db)

    try:
        deleted = await service.delete_profile(profile_id, current_user.id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found",
            )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post(
    "/{profile_id}/set-primary",
    response_model=PersonProfileResponse,
    summary="Set as primary profile",
)
async def set_primary_profile(
    profile_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Set a profile as the primary (default) profile."""
    service = PersonProfileService(db)

    from app.schemas.person_profile import PersonProfileUpdate
    profile = await service.update_profile(
        profile_id,
        current_user.id,
        PersonProfileUpdate(is_primary=True),
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return await service.get_profile_with_stats(profile.id, current_user.id)


@router.get(
    "/{profile_id}/context",
    response_model=ProfileContextSummary,
    summary="Get profile context",
)
async def get_profile_context(
    profile_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get conversation context summary for a profile.

    Returns recent topics, key insights from past conversations,
    and other context useful for providing continuity in guidance.
    """
    service = PersonProfileService(db)
    context = await service.get_profile_context(profile_id, current_user.id)

    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return context


@router.get(
    "/{profile_id}/history",
    response_model=List[dict],
    summary="Get conversation history",
)
async def get_conversation_history(
    profile_id: str,
    max_messages: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get recent conversation history for a profile.

    This is useful for reviewing past guidance or for context in new sessions.
    """
    service = PersonProfileService(db)

    # Verify profile exists
    profile = await service.get_profile(profile_id, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return await service.get_conversation_history_for_context(
        profile_id,
        current_user.id,
        max_messages=min(max_messages, 50),  # Cap at 50
    )
