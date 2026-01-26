"""Person Profile Service - CRUD operations and context management."""

from typing import Optional, List
from datetime import datetime

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.person_profile import PersonProfile, Relationship
from app.models.conversation import Conversation, Message, MessageRole
from app.models.subscription import SubscriptionTier
from app.schemas.person_profile import (
    PersonProfileCreate,
    PersonProfileUpdate,
    PersonProfileResponse,
    PersonProfileSummary,
    ProfileContextSummary,
)
from app.core.tier_config import get_tier_config


class PersonProfileService:
    """Service for managing person profiles and their context."""

    # Profile limits per tier
    PROFILE_LIMITS = {
        SubscriptionTier.FREE: 1,      # Only self
        SubscriptionTier.STARTER: 3,   # Self + 2 others
        SubscriptionTier.PRO: 10,      # Self + 9 others
    }

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile_count(self, user_id: str) -> int:
        """Get the number of active profiles for a user."""
        result = await self.db.execute(
            select(func.count(PersonProfile.id))
            .where(PersonProfile.user_id == user_id)
            .where(PersonProfile.is_active == True)
        )
        return result.scalar() or 0

    async def can_create_profile(self, user_id: str, tier: SubscriptionTier) -> tuple[bool, int]:
        """
        Check if user can create a new profile based on tier limits.

        Returns:
            Tuple of (can_create, max_allowed)
        """
        tier_config = get_tier_config(tier)
        max_profiles = tier_config.max_profiles
        current_count = await self.get_profile_count(user_id)
        return current_count < max_profiles, max_profiles

    async def create_profile(
        self,
        user_id: str,
        data: PersonProfileCreate,
        tier: SubscriptionTier = SubscriptionTier.FREE,
    ) -> PersonProfile:
        """
        Create a new person profile.

        Args:
            user_id: The user creating the profile
            data: Profile data
            tier: User's subscription tier (for limit checking)

        Returns:
            Created profile (or existing "self" profile if one exists)

        Raises:
            ValueError: If profile limit reached (and not a duplicate self profile)
        """
        # For "self" profiles, check if one already exists and return it
        # This makes the endpoint idempotent for onboarding retries
        if data.relation_type == "self":
            existing_self = await self.get_primary_profile(user_id)
            if existing_self and existing_self.relation_type == "self":
                return existing_self

        can_create, max_profiles = await self.can_create_profile(user_id, tier)
        if not can_create:
            raise ValueError(f"Profile limit reached. Your tier allows {max_profiles} profile(s).")

        # If this is the first profile or marked as primary, ensure it's the only primary
        if data.is_primary:
            await self._clear_primary_flag(user_id)

        # If this is the first profile, automatically make it primary
        existing_count = await self.get_profile_count(user_id)
        is_primary = data.is_primary or existing_count == 0

        # Geocode place_of_birth if lat/long not provided
        latitude = data.latitude
        longitude = data.longitude
        timezone = data.timezone

        if data.place_of_birth and (latitude is None or longitude is None):
            from app.services.geocoding_service import GeocodingService, get_timezone_offset
            geo_result = await GeocodingService.geocode(data.place_of_birth)
            if geo_result:
                latitude, longitude, timezone = geo_result

        profile = PersonProfile(
            user_id=user_id,
            name=data.name,
            nickname=data.nickname,
            relation_type=data.relation_type,
            is_primary=is_primary,
            date_of_birth=data.date_of_birth,
            time_of_birth=data.time_of_birth,
            place_of_birth=data.place_of_birth,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            notes=data.notes,
            avatar_color=data.avatar_color or self._generate_avatar_color(data.name),
        )

        self.db.add(profile)
        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def get_profile(self, profile_id: str, user_id: str) -> Optional[PersonProfile]:
        """Get a profile by ID, ensuring it belongs to the user."""
        result = await self.db.execute(
            select(PersonProfile)
            .where(PersonProfile.id == profile_id)
            .where(PersonProfile.user_id == user_id)
            .where(PersonProfile.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_primary_profile(self, user_id: str) -> Optional[PersonProfile]:
        """Get the user's primary profile."""
        result = await self.db.execute(
            select(PersonProfile)
            .where(PersonProfile.user_id == user_id)
            .where(PersonProfile.is_primary == True)
            .where(PersonProfile.is_active == True)
        )
        return result.scalar_one_or_none()

    async def list_profiles(self, user_id: str) -> List[PersonProfile]:
        """List all active profiles for a user."""
        result = await self.db.execute(
            select(PersonProfile)
            .where(PersonProfile.user_id == user_id)
            .where(PersonProfile.is_active == True)
            .order_by(PersonProfile.is_primary.desc(), PersonProfile.created_at)
        )
        return list(result.scalars().all())

    async def update_profile(
        self,
        profile_id: str,
        user_id: str,
        data: PersonProfileUpdate,
    ) -> Optional[PersonProfile]:
        """Update a profile."""
        profile = await self.get_profile(profile_id, user_id)
        if not profile:
            return None

        # Handle primary flag
        if data.is_primary is True:
            await self._clear_primary_flag(user_id)

        # Update fields (map schema field names to model field names)
        update_data = data.model_dump(exclude_unset=True)
        field_mapping = {"relationship": "relation_type"}  # Schema -> Model mapping
        for field, value in update_data.items():
            model_field = field_mapping.get(field, field)
            setattr(profile, model_field, value)

        await self.db.commit()
        await self.db.refresh(profile)
        return profile

    async def delete_profile(self, profile_id: str, user_id: str) -> bool:
        """
        Soft delete a profile.

        Note: Cannot delete the primary profile if it's the only one.
        """
        profile = await self.get_profile(profile_id, user_id)
        if not profile:
            return False

        # Check if this is the only profile
        profile_count = await self.get_profile_count(user_id)
        if profile_count == 1:
            raise ValueError("Cannot delete your only profile")

        # If deleting primary, assign another as primary
        if profile.is_primary:
            await self._assign_new_primary(user_id, exclude_id=profile_id)

        profile.is_active = False
        await self.db.commit()
        return True

    async def get_profile_with_stats(
        self,
        profile_id: str,
        user_id: str,
    ) -> Optional[PersonProfileResponse]:
        """Get a profile with conversation statistics."""
        profile = await self.get_profile(profile_id, user_id)
        if not profile:
            return None

        # Get conversation stats
        stats = await self._get_profile_stats(profile_id)

        return PersonProfileResponse(
            id=profile.id,
            name=profile.name,
            nickname=profile.nickname,
            relation_type=profile.relation_type,
            is_primary=profile.is_primary,
            date_of_birth=profile.date_of_birth,
            time_of_birth=profile.time_of_birth,
            place_of_birth=profile.place_of_birth,
            latitude=profile.latitude,
            longitude=profile.longitude,
            timezone=profile.timezone,
            has_birth_time=profile.has_birth_time,
            notes=profile.notes,
            avatar_color=profile.avatar_color,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
            conversation_count=stats["conversation_count"],
            last_conversation_at=stats["last_conversation_at"],
        )

    async def get_profile_context(
        self,
        profile_id: str,
        user_id: str,
        max_conversations: int = 10,
    ) -> Optional[ProfileContextSummary]:
        """
        Get context summary from past conversations for a profile.

        This is used to provide continuity in guidance sessions.
        """
        profile = await self.get_profile(profile_id, user_id)
        if not profile:
            return None

        # Get recent conversations with messages
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.person_profile_id == profile_id)
            .order_by(Conversation.created_at.desc())
            .limit(max_conversations)
        )
        conversations = list(result.scalars().all())

        # Extract topics and insights from conversations
        recent_topics = []
        key_insights = []

        for conv in conversations:
            if conv.title:
                recent_topics.append(conv.title)

            # Extract key points from assistant messages
            for msg in conv.messages:
                if msg.role == MessageRole.ASSISTANT and msg.response_metadata:
                    metadata = msg.response_metadata
                    if "direction" in metadata and metadata["direction"]:
                        key_insights.append(metadata["direction"][:200])  # Limit length

        # Deduplicate and limit
        recent_topics = list(dict.fromkeys(recent_topics))[:5]
        key_insights = list(dict.fromkeys(key_insights))[:5]

        stats = await self._get_profile_stats(profile_id)

        return ProfileContextSummary(
            profile_id=profile_id,
            profile_name=profile.display_name,
            relation_type=profile.relation_type,
            recent_topics=recent_topics,
            key_insights=key_insights,
            last_guidance_date=stats["last_conversation_at"],
            total_conversations=stats["conversation_count"],
        )

    async def get_conversation_history_for_context(
        self,
        profile_id: str,
        user_id: str,
        max_messages: int = 20,
    ) -> List[dict]:
        """
        Get recent conversation history for LLM context.

        Returns messages in a format suitable for LLM context injection.
        """
        # Verify profile belongs to user
        profile = await self.get_profile(profile_id, user_id)
        if not profile:
            return []

        # Get recent messages across conversations for this profile
        result = await self.db.execute(
            select(Message)
            .join(Conversation)
            .where(Conversation.person_profile_id == profile_id)
            .order_by(Message.created_at.desc())
            .limit(max_messages)
        )
        messages = list(result.scalars().all())

        # Reverse to chronological order and format
        history = []
        for msg in reversed(messages):
            history.append({
                "role": msg.role.value,
                "content": msg.content[:500],  # Limit for context window
                "timestamp": msg.created_at.isoformat(),
            })

        return history

    async def _get_profile_stats(self, profile_id: str) -> dict:
        """Get statistics for a profile."""
        # Conversation count
        count_result = await self.db.execute(
            select(func.count(Conversation.id))
            .where(Conversation.person_profile_id == profile_id)
        )
        conversation_count = count_result.scalar() or 0

        # Last conversation
        last_result = await self.db.execute(
            select(func.max(Conversation.created_at))
            .where(Conversation.person_profile_id == profile_id)
        )
        last_conversation_at = last_result.scalar()

        return {
            "conversation_count": conversation_count,
            "last_conversation_at": last_conversation_at,
        }

    async def _clear_primary_flag(self, user_id: str) -> None:
        """Clear primary flag from all user's profiles."""
        result = await self.db.execute(
            select(PersonProfile)
            .where(PersonProfile.user_id == user_id)
            .where(PersonProfile.is_primary == True)
        )
        for profile in result.scalars():
            profile.is_primary = False

    async def _assign_new_primary(self, user_id: str, exclude_id: str) -> None:
        """Assign a new primary profile after deletion."""
        result = await self.db.execute(
            select(PersonProfile)
            .where(PersonProfile.user_id == user_id)
            .where(PersonProfile.id != exclude_id)
            .where(PersonProfile.is_active == True)
            .order_by(PersonProfile.created_at)
            .limit(1)
        )
        profile = result.scalar_one_or_none()
        if profile:
            profile.is_primary = True

    def _generate_avatar_color(self, name: str) -> str:
        """Generate a consistent avatar color based on name."""
        colors = [
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
            "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
            "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1",
        ]
        # Simple hash based on name
        hash_val = sum(ord(c) for c in name)
        return colors[hash_val % len(colors)]
