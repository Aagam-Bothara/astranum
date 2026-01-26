"""
Chart Filter Service - Filters chart data based on subscription tier.

This ensures users only see chart elements they have access to based on their plan.
The LLM also only receives the filtered data, so it can't reference premium features.
"""

from typing import Optional, Dict, Any
from copy import deepcopy

from app.core.tier_config import TierConfig, get_tier_config
from app.models.subscription import SubscriptionTier
from app.schemas.chart import (
    ChartSnapshotResponse,
    AstrologyData,
    NumerologyData,
    PlanetPosition,
)


class ChartFilterService:
    """
    Filters chart data based on subscription tier.

    This is critical for:
    1. Ensuring LLM only references allowed data points
    2. Preventing feature leakage in responses
    3. Making tier upgrades feel meaningful
    """

    # Planets allowed at each level
    BASIC_PLANETS = {"sun", "moon"}
    LIMITED_PLANETS = {"sun", "moon", "mercury", "venus", "mars"}
    ALL_PLANETS = {
        "sun", "moon", "mercury", "venus", "mars",
        "jupiter", "saturn", "rahu", "ketu"
    }

    @classmethod
    def filter_chart_for_tier(
        cls,
        chart: ChartSnapshotResponse,
        tier: SubscriptionTier,
    ) -> ChartSnapshotResponse:
        """
        Filter a chart snapshot to only include tier-allowed features.

        Args:
            chart: The full computed chart
            tier: User's subscription tier

        Returns:
            Filtered chart with only allowed features
        """
        config = get_tier_config(tier)

        # Deep copy to avoid modifying original
        filtered = deepcopy(chart)

        # Filter astrology data
        if filtered.astrology_data:
            filtered.astrology_data = cls._filter_astrology(
                filtered.astrology_data, config
            )

        # Filter numerology data
        if filtered.numerology_data:
            filtered.numerology_data = cls._filter_numerology(
                filtered.numerology_data, config
            )

        # Filter transit data (Pro only)
        if not config.astrology.transits:
            filtered.transit_data = None

        return filtered

    @classmethod
    def _filter_astrology(
        cls,
        data: AstrologyData,
        config: TierConfig,
    ) -> AstrologyData:
        """Filter astrology data based on tier config."""
        filtered = deepcopy(data)

        # Sun sign - always allowed
        # Moon sign - always allowed

        # Ascendant - Starter+ only
        if not config.astrology.ascendant:
            filtered.ascendant = None

        # Houses - Pro only
        if not config.astrology.houses:
            filtered.houses = None

        # Nakshatra - Starter+ only
        if not config.astrology.nakshatra:
            filtered.moon_nakshatra = None
            if filtered.moon_sign:
                filtered.moon_sign.nakshatra = None
                filtered.moon_sign.nakshatra_pada = None

        # Filter planets
        if config.astrology.all_planets:
            allowed_planets = cls.ALL_PLANETS
        elif config.astrology.limited_planets:
            allowed_planets = cls.LIMITED_PLANETS
        else:
            allowed_planets = cls.BASIC_PLANETS

        # Remove disallowed planets
        if filtered.planets:
            filtered.planets = {
                name: pos for name, pos in filtered.planets.items()
                if name in allowed_planets
            }

        # Birth time indicator
        if not config.astrology.use_birth_time:
            filtered.has_birth_time = False
            # If birth time not allowed, remove ascendant even if computed
            filtered.ascendant = None

        return filtered

    @classmethod
    def _filter_numerology(
        cls,
        data: NumerologyData,
        config: TierConfig,
    ) -> NumerologyData:
        """Filter numerology data based on tier config."""
        filtered = deepcopy(data)

        # Zero out disallowed numbers (they still exist but show as 0)
        # This prevents confusion vs. "not computed"

        # Core numbers
        if not config.numerology.life_path:
            filtered.life_path = 0

        if not config.numerology.destiny_number:
            filtered.destiny_number = 0

        if not config.numerology.soul_urge:
            filtered.soul_urge = 0

        if not config.numerology.personality:
            filtered.personality = 0

        # Extended numbers
        if not config.numerology.maturity_number:
            filtered.maturity_number = None

        if not config.numerology.personal_year:
            filtered.personal_year = None

        if not config.numerology.birthday_number:
            filtered.birthday_number = None

        # Advanced features
        if not config.numerology.karmic_debt:
            filtered.karmic_debt = None

        if not config.numerology.pinnacles_challenges:
            filtered.current_pinnacle = None
            filtered.current_pinnacle_period = None
            filtered.current_challenge = None
            filtered.current_challenge_period = None

        return filtered

    @classmethod
    def get_allowed_data_points(cls, tier: SubscriptionTier) -> Dict[str, list]:
        """
        Get list of data points the LLM is allowed to reference.

        Used in system prompt to restrict LLM responses.
        """
        config = get_tier_config(tier)

        allowed = {
            "astrology": [],
            "numerology": [],
        }

        # Astrology
        allowed["astrology"].append("sun_sign")
        allowed["astrology"].append("moon_sign")

        if config.astrology.ascendant:
            allowed["astrology"].append("ascendant")

        if config.astrology.nakshatra:
            allowed["astrology"].append("moon_nakshatra")

        if config.astrology.houses:
            allowed["astrology"].extend([f"house_{i}" for i in range(1, 13)])

        # Planets
        if config.astrology.all_planets:
            allowed["astrology"].extend(list(cls.ALL_PLANETS))
        elif config.astrology.limited_planets:
            allowed["astrology"].extend(list(cls.LIMITED_PLANETS))

        if config.astrology.transits:
            allowed["astrology"].append("transits")

        # Numerology
        if config.numerology.life_path:
            allowed["numerology"].append("life_path")
        if config.numerology.destiny_number:
            allowed["numerology"].append("destiny_number")
        if config.numerology.soul_urge:
            allowed["numerology"].append("soul_urge")
        if config.numerology.personality:
            allowed["numerology"].append("personality")

        # Always include birth_day
        allowed["numerology"].append("birth_day")

        return allowed

    @classmethod
    def get_tier_prompt_restrictions(cls, tier: SubscriptionTier) -> str:
        """
        Generate prompt text that instructs LLM on tier restrictions.

        This is added to the system prompt to prevent feature leakage.
        """
        config = get_tier_config(tier)
        allowed = cls.get_allowed_data_points(tier)

        restrictions = []

        if tier == SubscriptionTier.FREE:
            restrictions.append(
                "RESTRICTION: Only reference Sun sign, Moon sign, and Life Path number. "
                "Do not mention ascendant, houses, other planets, or other numerology numbers."
            )

        elif tier == SubscriptionTier.STARTER:
            restrictions.append(
                "RESTRICTION: You may reference Sun, Moon, Ascendant, Mercury, Venus, Mars, "
                "Moon nakshatra, Life Path, and Destiny number. "
                "Do NOT mention houses, Jupiter, Saturn, Rahu, Ketu, transits, "
                "Soul Urge, or Personality numbers."
            )

        elif tier == SubscriptionTier.PRO:
            restrictions.append(
                "You have access to all chart data including houses, all planets, "
                "transits, and all numerology numbers."
            )

        elif tier == SubscriptionTier.MAX:
            restrictions.append(
                "You have full access to all chart data including houses, all planets, "
                "transits, and all numerology numbers. Provide the most detailed analysis possible."
            )

        # Response length restriction - only for free tier
        if config.response.max_characters > 0:
            restrictions.append(
                f"Keep your response under {config.response.max_characters} characters."
            )

        # Explanation restriction
        if config.response.include_explanation:
            restrictions.append(
                f"Include an explanation section with {config.response.explanation_bullets} "
                "bullet points explaining the reasoning."
            )
        else:
            restrictions.append(
                "Do not include detailed explanations. Keep response concise."
            )

        return "\n".join(restrictions)


def compute_chart_for_tier(
    user_profile,
    tier: SubscriptionTier,
    mode=None,
) -> ChartSnapshotResponse:
    """
    Compute chart with tier-appropriate depth, only for selected mode.

    Mode-focused computation:
    - ASTROLOGY: Only compute astrology data
    - NUMEROLOGY: Only compute numerology data
    - BOTH: Compute both (requires tier access)

    For Free tier: Don't even compute houses/full planets (saves compute)
    For Starter: Compute ascendant but skip houses
    For Pro/MAX: Compute everything

    Note: We always compute both astrology and numerology data if the user has
    the required profile info, even for tiers that can't use "combined mode".
    The "can_use_both" restriction only affects whether the LLM can reference
    both in the same response, not whether the data is computed. This ensures
    the user can ask about either topic and get a proper response.
    """
    from app.engines.astrology import AstrologyEngine, GeoLocation, ZodiacSystem
    from app.engines.numerology import NumerologyEngine
    from app.models.user import GuidanceMode

    config = get_tier_config(tier)

    # Determine the mode to use
    if mode is None:
        mode = getattr(user_profile, 'guidance_mode', None) or GuidanceMode.BOTH

    # For tiers that can't use combined mode, we still compute both data sets
    # but the mode will affect what the LLM is instructed to reference.
    # This allows users to ask about either astrology or numerology.
    effective_mode_for_compute = mode

    # Mode-focused computation - only compute what's needed
    numerology_data = None
    astrology_data = None

    # Always compute numerology if user has the required data and mode allows it
    # For BOTH mode on restricted tiers, still compute numerology so user can ask about it
    if effective_mode_for_compute in (GuidanceMode.NUMEROLOGY, GuidanceMode.BOTH):
        if user_profile.full_name and user_profile.date_of_birth:
            numerology_data = NumerologyEngine.compute(
                user_profile.full_name,
                user_profile.date_of_birth,
            )

    # Compute astrology only if mode is ASTROLOGY or BOTH
    if mode in (GuidanceMode.ASTROLOGY, GuidanceMode.BOTH):
        location = None

        if user_profile.latitude and user_profile.longitude:
            # Get timezone offset from profile or use IST as default
            from app.services.geocoding_service import get_timezone_offset
            timezone_offset = 5.5  # Default to IST
            if user_profile.timezone:
                timezone_offset = get_timezone_offset(user_profile.timezone)

            location = GeoLocation(
                latitude=user_profile.latitude,
                longitude=user_profile.longitude,
                timezone_offset=timezone_offset,
            )

        # Determine if we should use birth time
        time_of_birth = None
        if config.astrology.use_birth_time and user_profile.time_of_birth:
            time_of_birth = user_profile.time_of_birth

        if user_profile.date_of_birth:
            astrology_data = AstrologyEngine.compute(
                date_of_birth=user_profile.date_of_birth,
                time_of_birth=time_of_birth,
                location=location,
                zodiac=ZodiacSystem.SIDEREAL,
                include_outer_planets=False,  # Vedic doesn't use outer planets
            )

    # Compute transits for PRO/MAX tiers
    transit_data = None
    if config.astrology.transits and mode in (GuidanceMode.ASTROLOGY, GuidanceMode.BOTH):
        from datetime import date as date_type
        transit_data = AstrologyEngine.compute_transits(
            target_date=date_type.today(),
            zodiac=ZodiacSystem.SIDEREAL,
        )

    # Build response
    from app.schemas.chart import ChartSnapshotResponse
    import uuid
    from datetime import datetime

    chart = ChartSnapshotResponse(
        id=str(uuid.uuid4()),
        mode=mode,
        version=1,
        numerology_data=numerology_data.model_dump() if numerology_data else None,
        astrology_data=astrology_data.model_dump() if astrology_data else None,
        transit_data=transit_data.model_dump() if transit_data else None,
        created_at=datetime.utcnow().isoformat(),
    )

    # Filter based on tier
    return ChartFilterService.filter_chart_for_tier(chart, tier)
