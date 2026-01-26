"""
Tier Configuration - Feature access and limits per subscription tier.

This is the source of truth for what each tier can access.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Set
from enum import Enum

from app.models.subscription import SubscriptionTier


@dataclass
class AstrologyFeatures:
    """Astrology features available per tier."""
    sun_sign: bool = True
    moon_sign: bool = True
    ascendant: bool = False
    houses: bool = False
    all_planets: bool = False  # If False, only Sun/Moon
    limited_planets: bool = False  # Mercury, Venus, Mars only
    transits: bool = False
    nakshatra: bool = False
    use_birth_time: bool = False


@dataclass
class NumerologyFeatures:
    """Numerology features available per tier."""
    # Core numbers
    life_path: bool = True
    destiny_number: bool = False
    soul_urge: bool = False
    personality: bool = False
    # Extended numbers (Starter+)
    maturity_number: bool = False
    personal_year: bool = False
    birthday_number: bool = False
    # Advanced features (Pro only)
    karmic_debt: bool = False
    pinnacles_challenges: bool = False


@dataclass
class ResponseFeatures:
    """Response generation features per tier."""
    max_characters: int = 400
    include_explanation: bool = False  # "Why" section
    explanation_bullets: int = 0
    use_validator: bool = False  # Generator + Validator pipeline
    use_memory: bool = False  # Cross-chat consistency
    priority_response: bool = False

    # LLM Model configuration
    # Model names: "haiku", "sonnet", "opus" (resolved to full names at runtime)
    generator_model: str = "haiku"  # Model for generating responses
    validator_model: Optional[str] = None  # Model for validation (Pro only)


@dataclass
class TierConfig:
    """Complete configuration for a subscription tier."""
    tier: SubscriptionTier

    # Usage limits
    questions_lifetime: Optional[int] = None  # Only for free
    questions_monthly: Optional[int] = None
    questions_daily: Optional[int] = None

    # Profile limits
    max_profiles: int = 1  # Number of person profiles allowed

    # Mode access
    can_use_astrology: bool = True
    can_use_numerology: bool = True
    can_use_both: bool = False  # Combined mode

    # Feature sets
    astrology: AstrologyFeatures = field(default_factory=AstrologyFeatures)
    numerology: NumerologyFeatures = field(default_factory=NumerologyFeatures)
    response: ResponseFeatures = field(default_factory=ResponseFeatures)

    # History
    history_days: Optional[int] = None  # None = no history, 0 = unlimited

    # Extras
    weekly_summary: bool = False

    # Price (paise)
    price_paise: int = 0


# ============================================================================
# TIER DEFINITIONS
# ============================================================================

FREE_TIER = TierConfig(
    tier=SubscriptionTier.FREE,

    # Limits
    questions_lifetime=2,
    questions_monthly=None,
    questions_daily=None,

    # Profiles: Self only
    max_profiles=1,

    # Mode
    can_use_astrology=True,
    can_use_numerology=True,
    can_use_both=False,

    # Astrology: Sun + Moon only, no birth time
    astrology=AstrologyFeatures(
        sun_sign=True,
        moon_sign=True,
        ascendant=False,
        houses=False,
        all_planets=False,
        limited_planets=False,
        transits=False,
        nakshatra=False,
        use_birth_time=False,
    ),

    # Numerology: Life Path only
    numerology=NumerologyFeatures(
        life_path=True,
        destiny_number=False,
        soul_urge=False,
        personality=False,
        maturity_number=False,
        personal_year=False,
        birthday_number=False,
        karmic_debt=False,
        pinnacles_challenges=False,
    ),

    # Response: Short, no explanation, Haiku model (~₹0.80/chat)
    response=ResponseFeatures(
        max_characters=400,
        include_explanation=False,
        explanation_bullets=0,
        use_validator=False,
        use_memory=False,
        priority_response=False,
        generator_model="haiku",
        validator_model=None,
    ),

    # No history
    history_days=None,
    weekly_summary=False,
    price_paise=0,
)


STARTER_TIER = TierConfig(
    tier=SubscriptionTier.STARTER,

    # Limits: 15/month, 3/day
    questions_lifetime=None,
    questions_monthly=15,
    questions_daily=3,

    # Profiles: Self + 2 others (family/friends)
    max_profiles=3,

    # Mode: Astrology OR Numerology, not both
    can_use_astrology=True,
    can_use_numerology=True,
    can_use_both=False,

    # Astrology: Ascendant calculated, no houses, limited planets
    astrology=AstrologyFeatures(
        sun_sign=True,
        moon_sign=True,
        ascendant=True,  # ✅ Birth time used for ascendant
        houses=False,    # ❌ No house interpretation
        all_planets=False,
        limited_planets=True,  # Mercury, Venus, Mars
        transits=False,
        nakshatra=True,  # Moon nakshatra included
        use_birth_time=True,
    ),

    # Numerology: Life Path + Destiny + Extended
    numerology=NumerologyFeatures(
        life_path=True,
        destiny_number=True,
        soul_urge=False,
        personality=False,
        # Extended numbers for Starter
        maturity_number=True,
        personal_year=True,
        birthday_number=True,
        karmic_debt=False,
        pinnacles_challenges=False,
    ),

    # Response: Unlimited length, short explanation, Sonnet model (~₹2.50/chat)
    response=ResponseFeatures(
        max_characters=0,  # 0 = unlimited for paid tiers
        include_explanation=True,
        explanation_bullets=2,  # 1-2 bullets
        use_validator=False,    # ❌ No validator
        use_memory=False,       # ❌ No cross-chat memory
        priority_response=False,
        generator_model="sonnet",
        validator_model=None,
    ),

    # 30-day history
    history_days=30,
    weekly_summary=False,
    price_paise=9900,  # ₹99
)


PRO_TIER = TierConfig(
    tier=SubscriptionTier.PRO,

    # Limits: 80/month, 4/day
    questions_lifetime=None,
    questions_monthly=80,
    questions_daily=4,

    # Profiles: Self + 9 others (family/friends)
    max_profiles=10,

    # Mode: All modes including combined
    can_use_astrology=True,
    can_use_numerology=True,
    can_use_both=True,  # ✅ Combined Astro + Numero

    # Astrology: Full access
    astrology=AstrologyFeatures(
        sun_sign=True,
        moon_sign=True,
        ascendant=True,
        houses=True,       # ✅ Full house analysis
        all_planets=True,  # ✅ All 9 planets + Rahu/Ketu
        limited_planets=False,
        transits=True,     # ✅ Transit context
        nakshatra=True,
        use_birth_time=True,
    ),

    # Numerology: All numbers including advanced
    numerology=NumerologyFeatures(
        life_path=True,
        destiny_number=True,
        soul_urge=True,
        personality=True,
        # Extended numbers
        maturity_number=True,
        personal_year=True,
        birthday_number=True,
        # Advanced features
        karmic_debt=True,
        pinnacles_challenges=True,
    ),

    # Response: Unlimited length, Sonnet 4 generator + Opus 4.5 validator (~₹7/chat, ₹699/month)
    response=ResponseFeatures(
        max_characters=0,  # 0 = unlimited for paid tiers
        include_explanation=True,
        explanation_bullets=5,  # Detailed explanation
        use_validator=True,     # ✅ Generator + Validator pipeline
        use_memory=True,        # ✅ Cross-chat consistency
        priority_response=True,
        generator_model="sonnet",
        validator_model="opus",  # Opus 4.5 for validation
    ),

    # Unlimited history
    history_days=0,  # 0 = unlimited
    weekly_summary=True,
    price_paise=69900,  # ₹699
)


MAX_TIER = TierConfig(
    tier=SubscriptionTier.MAX,

    # Limits: Unlimited (200/month, 10/day practical cap)
    questions_lifetime=None,
    questions_monthly=200,
    questions_daily=10,

    # Profiles: Self + unlimited family/friends
    max_profiles=25,

    # Mode: All modes including combined
    can_use_astrology=True,
    can_use_numerology=True,
    can_use_both=True,  # ✅ Combined Astro + Numero

    # Astrology: Full access
    astrology=AstrologyFeatures(
        sun_sign=True,
        moon_sign=True,
        ascendant=True,
        houses=True,       # ✅ Full house analysis
        all_planets=True,  # ✅ All 9 planets + Rahu/Ketu
        limited_planets=False,
        transits=True,     # ✅ Transit context
        nakshatra=True,
        use_birth_time=True,
    ),

    # Numerology: All numbers including advanced
    numerology=NumerologyFeatures(
        life_path=True,
        destiny_number=True,
        soul_urge=True,
        personality=True,
        # Extended numbers
        maturity_number=True,
        personal_year=True,
        birthday_number=True,
        # Advanced features
        karmic_debt=True,
        pinnacles_challenges=True,
    ),

    # Response: Unlimited, Opus 4.5 generator + Opus 4.5 validator (Premium quality)
    response=ResponseFeatures(
        max_characters=0,  # 0 = unlimited
        include_explanation=True,
        explanation_bullets=10,  # Full detailed explanation
        use_validator=True,      # ✅ Generator + Validator pipeline
        use_memory=True,         # ✅ Cross-chat consistency
        priority_response=True,
        generator_model="opus",  # Opus 4.5 for premium generation
        validator_model="opus",  # Opus 4.5 for validation
    ),

    # Unlimited history
    history_days=0,  # 0 = unlimited
    weekly_summary=True,
    price_paise=199900,  # ₹1999
)


# ============================================================================
# TIER LOOKUP
# ============================================================================

TIER_CONFIGS = {
    SubscriptionTier.FREE: FREE_TIER,
    SubscriptionTier.STARTER: STARTER_TIER,
    SubscriptionTier.PRO: PRO_TIER,
    SubscriptionTier.MAX: MAX_TIER,
}


def get_tier_config(tier: SubscriptionTier) -> TierConfig:
    """Get configuration for a subscription tier."""
    return TIER_CONFIGS.get(tier, FREE_TIER)


def get_tier_display_info(tier: SubscriptionTier) -> dict:
    """Get display information for pricing page."""
    config = get_tier_config(tier)

    return {
        "tier": tier.value,
        "name": tier.value.title(),
        "price_paise": config.price_paise,
        "price_display": (
            "Free" if config.price_paise == 0
            else f"₹{config.price_paise // 100}/month"
        ),
        "limits": {
            "lifetime_questions": config.questions_lifetime,
            "monthly_questions": config.questions_monthly,
            "daily_limit": config.questions_daily,
            "max_chars": config.response.max_characters,
        },
        "features": _get_feature_list(config),
        "restrictions": _get_restriction_list(config),
    }


def _get_feature_list(config: TierConfig) -> List[str]:
    """Generate feature list for display."""
    features = []

    # Limits
    if config.questions_lifetime:
        features.append(f"{config.questions_lifetime} questions (lifetime)")
    if config.questions_monthly:
        features.append(f"{config.questions_monthly} questions/month")
    if config.questions_daily:
        features.append(f"Max {config.questions_daily}/day")

    # Profiles
    if config.max_profiles == 1:
        features.append("1 profile (self)")
    else:
        features.append(f"{config.max_profiles} profiles (self + family/friends)")

    # Modes
    if config.can_use_both:
        features.append("Astrology + Numerology combined")
    else:
        features.append("Astrology OR Numerology")

    # Astrology
    if config.astrology.use_birth_time:
        features.append("Birth time precision")
    if config.astrology.ascendant:
        features.append("Ascendant calculation")
    if config.astrology.houses:
        features.append("Full house analysis")
    if config.astrology.all_planets:
        features.append("All planetary positions")
    if config.astrology.transits:
        features.append("Transit context")

    # Numerology
    nums = []
    if config.numerology.life_path:
        nums.append("Life Path")
    if config.numerology.destiny_number:
        nums.append("Destiny")
    if config.numerology.soul_urge:
        nums.append("Soul Urge")
    if config.numerology.personality:
        nums.append("Personality")
    if nums:
        features.append(f"Numbers: {', '.join(nums)}")

    # Response
    if config.response.include_explanation:
        features.append("Explanation section")
    if config.response.use_validator:
        features.append("Validated responses (higher confidence)")
    if config.response.use_memory:
        features.append("Consistency memory")
    if config.response.priority_response:
        features.append("Priority responses")

    # History
    if config.history_days == 0:
        features.append("Unlimited history")
    elif config.history_days:
        features.append(f"{config.history_days}-day history")

    # Extras
    if config.weekly_summary:
        features.append("Weekly guidance summary")

    return features


def _get_restriction_list(config: TierConfig) -> List[str]:
    """Generate restriction list for display."""
    restrictions = []

    if not config.astrology.houses:
        restrictions.append("No house analysis")
    if not config.astrology.transits:
        restrictions.append("No transit insights")
    if not config.can_use_both:
        restrictions.append("Single mode only (Astrology OR Numerology)")
    if not config.response.use_validator:
        restrictions.append("Standard AI responses")
    if not config.response.use_memory:
        restrictions.append("No cross-chat memory")
    if config.history_days is None:
        restrictions.append("No saved history")
    if not config.weekly_summary:
        restrictions.append("No weekly summaries")

    return restrictions
