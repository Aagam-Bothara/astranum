"""Guidance routes - the core /ask endpoint."""

import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.guidance import GuidanceRequest, GuidanceResponse
from app.schemas.subscription import UsageCheckResponse
from app.api.deps import get_db, get_current_user
from app.services.credits_service import CreditsService
from app.services.guidance_service import GuidanceService, is_greeting, get_greeting_response
from app.services.chart_filter_service import compute_chart_for_tier
from app.services.person_profile_service import PersonProfileService
from app.models.user import Language, ResponseStyle

router = APIRouter()


@router.post("/ask", response_model=GuidanceResponse)
async def ask_guidance(
    request: GuidanceRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Ask for guidance based on astrological/numerological patterns.

    **Profile Support:**
    - Pass `profile_id` to get guidance for a specific person (self, family, friend)
    - If not specified, uses the primary profile
    - Each profile maintains its own conversation history for context continuity

    **Flow:**
    1. Resolve profile (specified or primary)
    2. Check usage limits (daily/monthly/lifetime based on tier)
    3. Get user's tier to determine features (validation, chart depth)
    4. Compute chart for the profile with tier-appropriate depth
    5. Include conversation context from profile's history (Pro tier)
    6. Get LLM response with tier-specific prompt restrictions
    7. Validate response (Pro tier only - Generator + Validator pipeline)
    8. Deduct credit and save to profile's conversation history
    9. Return structured response

    **Cost per chat:**
    - Free: ~₹0.80 (Haiku)
    - Starter (₹99): ~₹2.50 (Sonnet)
    - Pro (₹699): ~₹7.00 (Sonnet + Opus validator)
    """
    # Early greeting detection - no credits, no chart needed
    if is_greeting(request.question):
        return get_greeting_response()

    credits_service = CreditsService(db)
    profile_service = PersonProfileService(db)

    # Step 1: Resolve profile
    if request.profile_id:
        profile = await profile_service.get_profile(request.profile_id, current_user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found",
            )
    else:
        # Use primary profile
        profile = await profile_service.get_primary_profile(current_user.id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No profile found. Please create a profile first.",
            )

    # Step 2: Check usage limits
    usage_status = await credits_service.check_can_ask(current_user.id)

    if not usage_status.can_ask_question:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=usage_status.limit_message or "Usage limit reached",
        )

    # Step 3: Get tier config for determining features
    tier_config = await credits_service.get_tier_config(current_user.id)

    # Step 4: Compute chart for the profile with tier-appropriate depth and mode focus
    # Only compute what's needed based on selected mode (astrology, numerology, or both)
    chart = compute_chart_for_tier(profile, tier_config.tier, mode=request.mode)

    # Step 5: Get conversation context for profile (Pro tier with memory enabled)
    conversation_context = None
    if request.include_context and tier_config.response.use_memory:
        context_data = await profile_service.get_profile_context(
            profile.id, current_user.id
        )
        if context_data and context_data.total_conversations > 0:
            conversation_context = {
                "profile_name": context_data.profile_name,
                "relationship": context_data.relationship.value,
                "recent_topics": context_data.recent_topics,
                "key_insights": context_data.key_insights,
            }

    # Step 6-7: Get guidance with tier-based filtering, context, and optional validation
    guidance_service = GuidanceService()

    language = request.language or Language.ENGLISH

    # Get response style from profile (defaults to BALANCED if not set)
    response_style = getattr(profile, 'response_style', ResponseStyle.BALANCED) or ResponseStyle.BALANCED

    response = await guidance_service.get_guidance(
        request=request,
        chart=chart,
        language=language,
        tier=tier_config.tier,
        conversation_context=conversation_context,
        response_style=response_style,
    )

    # Step 8: Deduct usage
    message_id = str(uuid.uuid4())
    await credits_service.deduct_usage(current_user.id, message_id)

    # TODO: Save to conversation history for this profile
    # This enables context continuity for future guidance sessions

    return response


@router.get("/check-usage", response_model=UsageCheckResponse)
async def check_usage(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Check if user can ask a question (pre-flight check).

    Returns current usage status and whether a question is allowed.
    Useful for frontend to show remaining questions and daily cap.
    """
    credits_service = CreditsService(db)
    usage = await credits_service.check_can_ask(current_user.id)

    return UsageCheckResponse(
        allowed=usage.can_ask_question,
        usage=usage,
        message=usage.limit_message,
    )


@router.get("/history")
async def get_guidance_history(
    limit: int = 20,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get user's guidance conversation history."""
    # TODO: Implement history retrieval
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="History not yet implemented",
    )
