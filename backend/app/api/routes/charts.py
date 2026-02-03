"""Chart routes - for viewing/regenerating chart data."""

from datetime import date, time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.schemas.chart import (
    ChartSnapshotResponse,
    TransitData,
    AstrologyData,
    NumerologyData,
)
from app.models.user import GuidanceMode
from app.models.person_profile import PersonProfile
from app.api.deps import get_db, get_current_user
from app.engines.astrology import AstrologyEngine, GeoLocation
from app.engines.numerology import NumerologyEngine
from app.engines.vedic_astrology import (
    VimshottariDasha,
    VedicAspects,
    YogaDetector,
    TransitAnalyzer,
)

router = APIRouter()


@router.get("/transits")
async def get_current_transits():
    """
    Get current planetary positions (transits).

    This endpoint is public - anyone can view current planetary positions.
    Returns real-time positions of all planets in the zodiac.
    """
    transit_data = AstrologyEngine.compute_transits()

    # Convert to a more detailed format with absolute longitudes for visualization
    planets_with_longitude = {}
    for name, pos in transit_data.planets.items():
        # Calculate absolute longitude from sign + degree
        sign_index = AstrologyEngine.SIGNS.index(pos.sign)
        absolute_longitude = sign_index * 30 + pos.degree

        planets_with_longitude[name] = {
            "sign": pos.sign,
            "sign_hindi": AstrologyEngine.SIGNS_HINDI[sign_index],
            "degree": pos.degree,
            "absolute_longitude": round(absolute_longitude, 2),
            "is_retrograde": pos.is_retrograde,
        }

    return {
        "date": transit_data.date,
        "planets": planets_with_longitude,
    }


@router.get("/daily-energy")
async def get_daily_energy():
    """
    Get today's cosmic energy summary.

    This is a FREE public endpoint that provides a brief daily insight
    based on current planetary positions. No authentication required.
    Does not count as a question.
    """
    transit_data = AstrologyEngine.compute_transits()

    # Determine key aspects of today's energy
    insights = []
    moon_sign = None
    retrograde_planets = []

    for name, pos in transit_data.planets.items():
        if name == "Moon":
            moon_sign = pos.sign
        if pos.is_retrograde and name not in ["Rahu", "Ketu"]:  # Rahu/Ketu are always retrograde
            retrograde_planets.append(name)

    # Moon sign insight
    moon_insights = {
        "Aries": {"emoji": "🔥", "energy": "Bold", "tip": "Take initiative on new projects"},
        "Taurus": {"emoji": "🌿", "energy": "Grounded", "tip": "Focus on comfort and stability"},
        "Gemini": {"emoji": "💬", "energy": "Communicative", "tip": "Great day for conversations and learning"},
        "Cancer": {"emoji": "🏠", "energy": "Nurturing", "tip": "Connect with family and loved ones"},
        "Leo": {"emoji": "🌟", "energy": "Creative", "tip": "Express yourself and shine bright"},
        "Virgo": {"emoji": "📋", "energy": "Analytical", "tip": "Perfect for detailed work and organization"},
        "Libra": {"emoji": "⚖️", "energy": "Harmonious", "tip": "Seek balance in relationships"},
        "Scorpio": {"emoji": "🔮", "energy": "Intense", "tip": "Deep reflection and transformation"},
        "Sagittarius": {"emoji": "🏹", "energy": "Adventurous", "tip": "Explore new ideas and possibilities"},
        "Capricorn": {"emoji": "🏔️", "energy": "Ambitious", "tip": "Focus on long-term goals"},
        "Aquarius": {"emoji": "💡", "energy": "Innovative", "tip": "Think outside the box"},
        "Pisces": {"emoji": "🌊", "energy": "Intuitive", "tip": "Trust your inner guidance"},
    }

    moon_info = moon_insights.get(moon_sign, {"emoji": "🌙", "energy": "Reflective", "tip": "Take time to observe"})

    # Build summary
    summary = f"Moon in {moon_sign} brings {moon_info['energy'].lower()} energy today."

    # Add retrograde warning if any
    retrograde_warning = None
    if retrograde_planets:
        if "Mercury" in retrograde_planets:
            retrograde_warning = "Mercury retrograde: Double-check communications and travel plans."
        elif "Venus" in retrograde_planets:
            retrograde_warning = "Venus retrograde: Reflect on relationships and values."
        elif "Mars" in retrograde_planets:
            retrograde_warning = "Mars retrograde: Patience with actions and decisions."
        else:
            retrograde_warning = f"{', '.join(retrograde_planets)} retrograde: Some areas may need review."

    return {
        "date": transit_data.date,
        "moon_sign": moon_sign,
        "emoji": moon_info["emoji"],
        "energy": moon_info["energy"],
        "summary": summary,
        "tip": moon_info["tip"],
        "retrograde_planets": retrograde_planets,
        "retrograde_warning": retrograde_warning,
    }


@router.get("/birth-chart")
async def get_birth_chart(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    profile_id: Optional[str] = Query(None, description="Profile ID (defaults to primary)"),
):
    """
    Get user's birth chart (Kundli).

    Returns complete astrology and numerology data for the user's profile.
    Paid feature - requires active subscription.
    """
    # Check subscription tier
    tier = current_user.subscription_tier if hasattr(current_user, 'subscription_tier') else 'free'
    if tier == 'free':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Birth chart access requires a paid subscription. Please upgrade to view your Kundli.",
        )

    # Get the profile
    if profile_id:
        result = await db.execute(
            select(PersonProfile).where(
                PersonProfile.id == profile_id,
                PersonProfile.user_id == current_user.id,
            )
        )
        profile = result.scalar_one_or_none()
    else:
        # Get primary profile
        result = await db.execute(
            select(PersonProfile).where(
                PersonProfile.user_id == current_user.id,
                PersonProfile.is_primary == True,
            )
        )
        profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete your birth details in onboarding.",
        )

    # Compute astrology data
    location = None
    if profile.latitude and profile.longitude:
        # Get timezone offset from profile or use proper lookup
        from app.services.geocoding_service import get_timezone_offset
        timezone_offset = 5.5  # Default to IST for Indian users
        if profile.timezone:
            timezone_offset = get_timezone_offset(profile.timezone)
        elif profile.longitude:
            # Fallback: estimate from longitude (rough approximation)
            timezone_offset = profile.longitude / 15.0
        location = GeoLocation(
            latitude=profile.latitude,
            longitude=profile.longitude,
            timezone_offset=timezone_offset,
        )

    birth_time = None
    if profile.time_of_birth:
        if isinstance(profile.time_of_birth, str):
            parts = profile.time_of_birth.split(':')
            birth_time = time(int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)
        else:
            birth_time = profile.time_of_birth

    astrology_data = AstrologyEngine.compute(
        date_of_birth=profile.date_of_birth,
        time_of_birth=birth_time,
        location=location,
    )

    # Compute numerology data
    numerology_data = NumerologyEngine.compute(
        full_name=profile.name,
        date_of_birth=profile.date_of_birth,
    )

    # Get current transits
    transit_data = AstrologyEngine.compute_transits()

    # Build response with visualization-friendly data
    response = {
        "profile": {
            "id": str(profile.id),
            "name": profile.name,
            "date_of_birth": profile.date_of_birth.isoformat(),
            "time_of_birth": profile.time_of_birth.isoformat() if profile.time_of_birth and hasattr(profile.time_of_birth, 'isoformat') else str(profile.time_of_birth) if profile.time_of_birth else None,
            "place_of_birth": profile.place_of_birth,
            "has_birth_time": birth_time is not None,
        },
        "astrology": {
            "sun_sign": {
                "sign": astrology_data.sun_sign.sign,
                "sign_hindi": AstrologyEngine.SIGNS_HINDI[AstrologyEngine.SIGNS.index(astrology_data.sun_sign.sign)],
                "degree": astrology_data.sun_sign.degree,
                "absolute_longitude": AstrologyEngine.SIGNS.index(astrology_data.sun_sign.sign) * 30 + astrology_data.sun_sign.degree,
            },
            "moon_sign": {
                "sign": astrology_data.moon_sign.sign,
                "sign_hindi": AstrologyEngine.SIGNS_HINDI[AstrologyEngine.SIGNS.index(astrology_data.moon_sign.sign)],
                "degree": astrology_data.moon_sign.degree,
                "absolute_longitude": AstrologyEngine.SIGNS.index(astrology_data.moon_sign.sign) * 30 + astrology_data.moon_sign.degree,
                "nakshatra": astrology_data.moon_sign.nakshatra,
                "nakshatra_pada": astrology_data.moon_sign.nakshatra_pada,
            },
            "ascendant": None,
            "planets": {},
            "moon_nakshatra": astrology_data.moon_nakshatra,
            "houses": astrology_data.houses,
            "has_birth_time": astrology_data.has_birth_time,
        },
        "numerology": {
            "life_path": numerology_data.life_path,
            "destiny_number": numerology_data.destiny_number,
            "soul_urge": numerology_data.soul_urge,
            "personality": numerology_data.personality,
            "birth_day": numerology_data.birth_day,
            "maturity_number": numerology_data.maturity_number,
            "personal_year": numerology_data.personal_year,
            "birthday_number": numerology_data.birthday_number,
            "karmic_debt": numerology_data.karmic_debt,
            "current_pinnacle": numerology_data.current_pinnacle,
            "current_challenge": numerology_data.current_challenge,
        },
        "transits": {
            "date": transit_data.date,
            "planets": {},
        },
    }

    # Add ascendant if available
    if astrology_data.ascendant:
        asc_sign_idx = AstrologyEngine.SIGNS.index(astrology_data.ascendant.sign)
        response["astrology"]["ascendant"] = {
            "sign": astrology_data.ascendant.sign,
            "sign_hindi": AstrologyEngine.SIGNS_HINDI[asc_sign_idx],
            "degree": astrology_data.ascendant.degree,
            "absolute_longitude": asc_sign_idx * 30 + astrology_data.ascendant.degree,
        }

    # Add planets with absolute longitudes
    for name, pos in astrology_data.planets.items():
        sign_idx = AstrologyEngine.SIGNS.index(pos.sign)
        response["astrology"]["planets"][name] = {
            "sign": pos.sign,
            "sign_hindi": AstrologyEngine.SIGNS_HINDI[sign_idx],
            "degree": pos.degree,
            "absolute_longitude": sign_idx * 30 + pos.degree,
            "is_retrograde": pos.is_retrograde,
        }

    # Add transit planets
    for name, pos in transit_data.planets.items():
        sign_idx = AstrologyEngine.SIGNS.index(pos.sign)
        response["transits"]["planets"][name] = {
            "sign": pos.sign,
            "sign_hindi": AstrologyEngine.SIGNS_HINDI[sign_idx],
            "degree": pos.degree,
            "absolute_longitude": sign_idx * 30 + pos.degree,
            "is_retrograde": pos.is_retrograde,
        }

    # Calculate advanced Vedic features
    vedic_features = {}

    # Calculate Moon longitude for Dasha calculation
    moon_sign_idx = AstrologyEngine.SIGNS.index(astrology_data.moon_sign.sign)
    moon_longitude = moon_sign_idx * 30 + astrology_data.moon_sign.degree

    # Vimshottari Dasha
    try:
        dasha_periods = VimshottariDasha.calculate_dasha(
            moon_longitude=moon_longitude,
            date_of_birth=profile.date_of_birth,
            years_to_calculate=80,
        )
        current_dasha = VimshottariDasha.get_current_dasha(dasha_periods)
        vedic_features["current_dasha"] = current_dasha
        vedic_features["dasha_periods"] = [
            {
                "planet": d.planet,
                "start_date": d.start_date.isoformat(),
                "end_date": d.end_date.isoformat(),
                "duration_years": round(d.duration_years, 2),
                "level": d.level,
            }
            for d in dasha_periods[:10]  # First 10 periods
        ]
    except Exception:
        pass

    # Vedic Aspects
    try:
        all_planets = {"sun": astrology_data.sun_sign, "moon": astrology_data.moon_sign}
        all_planets.update(astrology_data.planets)
        aspects = VedicAspects.calculate_aspects(all_planets, AstrologyEngine.SIGNS)
        vedic_features["aspects"] = [
            {
                "aspecting_planet": a.aspecting_planet,
                "aspected_planet": a.aspected_planet,
                "aspect_type": a.aspect_type,
                "orb": a.orb,
                "strength": a.strength,
                "is_benefic": a.is_benefic,
                "description": a.description,
            }
            for a in aspects[:15]  # Top 15 aspects
        ]
    except Exception:
        pass

    # Yoga Detection
    try:
        ascendant_sign = astrology_data.ascendant.sign if astrology_data.ascendant else astrology_data.sun_sign.sign
        yogas = YogaDetector.detect_yogas(
            planets=all_planets,
            ascendant_sign=ascendant_sign,
            signs=AstrologyEngine.SIGNS,
            houses=astrology_data.houses,
        )
        vedic_features["yogas"] = [
            {
                "name": y.name,
                "name_sanskrit": y.name_sanskrit,
                "yoga_type": y.yoga_type,
                "planets_involved": y.planets_involved,
                "houses_involved": y.houses_involved,
                "is_benefic": y.is_benefic,
                "strength": y.strength,
                "description": y.description,
                "effects": y.effects,
            }
            for y in yogas
        ]
    except Exception:
        pass

    # Transit Aspects to Natal
    try:
        transit_aspects = TransitAnalyzer.analyze_transits(
            natal_planets=all_planets,
            transit_planets=transit_data.planets,
            signs=AstrologyEngine.SIGNS,
        )
        vedic_features["transit_aspects"] = [
            {
                "transit_planet": ta.transit_planet,
                "natal_planet": ta.natal_planet,
                "aspect_type": ta.aspect_type,
                "transit_sign": ta.transit_sign,
                "natal_sign": ta.natal_sign,
                "orb": ta.orb,
                "is_applying": ta.is_applying,
                "significance": ta.significance,
                "interpretation": ta.interpretation,
            }
            for ta in transit_aspects[:10]  # Top 10 transit aspects
        ]
    except Exception:
        pass

    response["vedic_features"] = vedic_features

    return response


@router.get("/current", response_model=ChartSnapshotResponse)
async def get_current_chart(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get the user's current chart snapshot.

    This is the computed data that LLM uses for guidance.
    """
    # TODO: Implement chart retrieval
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Chart retrieval not yet implemented",
    )


@router.post("/recompute", response_model=ChartSnapshotResponse)
async def recompute_chart(
    mode: GuidanceMode = GuidanceMode.BOTH,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Recompute the user's chart.

    This should be called when:
    - User updates birth details
    - User wants fresh transit data
    - Initial profile creation
    """
    # TODO: Implement chart recomputation
    # 1. Get user profile (birth details)
    # 2. Run numerology engine (if mode includes numerology)
    # 3. Run astrology engine (if mode includes astrology)
    # 4. Compute current transits
    # 5. Store new chart snapshot
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Chart recomputation not yet implemented",
    )


@router.get("/explain/{data_point}")
async def explain_data_point(
    data_point: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get explanation for a specific chart data point.

    e.g., /explain/sun_sign or /explain/life_path

    This is the "Explain-why dropdown" feature.
    """
    # TODO: Implement data point explanation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Explanation not yet implemented",
    )


@router.get("/dasha")
async def get_dasha_periods(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    profile_id: Optional[str] = Query(None, description="Profile ID (defaults to primary)"),
    years: int = Query(80, ge=10, le=120, description="Years of dasha to calculate"),
):
    """
    Get Vimshottari Dasha periods for a profile.

    Returns:
    - Current Mahadasha and Antardasha
    - Full dasha timeline
    - Remaining days in current periods
    """
    # Get the profile
    if profile_id:
        result = await db.execute(
            select(PersonProfile).where(
                PersonProfile.id == profile_id,
                PersonProfile.user_id == current_user.id,
            )
        )
        profile = result.scalar_one_or_none()
    else:
        result = await db.execute(
            select(PersonProfile).where(
                PersonProfile.user_id == current_user.id,
                PersonProfile.is_primary == True,
            )
        )
        profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    # Compute astrology to get Moon position
    location = None
    if profile.latitude and profile.longitude:
        from app.services.geocoding_service import get_timezone_offset
        timezone_offset = 5.5
        if profile.timezone:
            timezone_offset = get_timezone_offset(profile.timezone)
        elif profile.longitude:
            timezone_offset = profile.longitude / 15.0
        location = GeoLocation(
            latitude=profile.latitude,
            longitude=profile.longitude,
            timezone_offset=timezone_offset,
        )

    birth_time = None
    if profile.time_of_birth:
        if isinstance(profile.time_of_birth, str):
            parts = profile.time_of_birth.split(':')
            birth_time = time(int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)
        else:
            birth_time = profile.time_of_birth

    astrology_data = AstrologyEngine.compute(
        date_of_birth=profile.date_of_birth,
        time_of_birth=birth_time,
        location=location,
    )

    # Calculate Moon longitude
    moon_sign_idx = AstrologyEngine.SIGNS.index(astrology_data.moon_sign.sign)
    moon_longitude = moon_sign_idx * 30 + astrology_data.moon_sign.degree

    # Calculate Dasha periods
    dasha_periods = VimshottariDasha.calculate_dasha(
        moon_longitude=moon_longitude,
        date_of_birth=profile.date_of_birth,
        years_to_calculate=years,
    )

    # Get current dasha
    current_dasha = VimshottariDasha.get_current_dasha(dasha_periods)

    # Format response
    return {
        "profile_name": profile.name,
        "moon_nakshatra": astrology_data.moon_nakshatra,
        "moon_sign": astrology_data.moon_sign.sign,
        "current_dasha": current_dasha,
        "dasha_periods": [
            {
                "planet": d.planet,
                "start_date": d.start_date.isoformat(),
                "end_date": d.end_date.isoformat(),
                "duration_years": round(d.duration_years, 2),
                "level": d.level,
                "sub_periods": [
                    {
                        "planet": sp.planet,
                        "start_date": sp.start_date.isoformat(),
                        "end_date": sp.end_date.isoformat(),
                        "duration_years": round(sp.duration_years, 2),
                    }
                    for sp in d.sub_periods
                ] if d.sub_periods else [],
            }
            for d in dasha_periods
        ],
    }


@router.get("/yogas")
async def get_yogas(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    profile_id: Optional[str] = Query(None, description="Profile ID (defaults to primary)"),
):
    """
    Get detected Vedic yogas for a profile.

    Returns all yoga combinations found in the birth chart.
    """
    # Get the profile (similar to dasha endpoint)
    if profile_id:
        result = await db.execute(
            select(PersonProfile).where(
                PersonProfile.id == profile_id,
                PersonProfile.user_id == current_user.id,
            )
        )
        profile = result.scalar_one_or_none()
    else:
        result = await db.execute(
            select(PersonProfile).where(
                PersonProfile.user_id == current_user.id,
                PersonProfile.is_primary == True,
            )
        )
        profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    # Compute astrology
    location = None
    if profile.latitude and profile.longitude:
        from app.services.geocoding_service import get_timezone_offset
        timezone_offset = 5.5
        if profile.timezone:
            timezone_offset = get_timezone_offset(profile.timezone)
        location = GeoLocation(
            latitude=profile.latitude,
            longitude=profile.longitude,
            timezone_offset=timezone_offset,
        )

    birth_time = None
    if profile.time_of_birth:
        if isinstance(profile.time_of_birth, str):
            parts = profile.time_of_birth.split(':')
            birth_time = time(int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)
        else:
            birth_time = profile.time_of_birth

    astrology_data = AstrologyEngine.compute(
        date_of_birth=profile.date_of_birth,
        time_of_birth=birth_time,
        location=location,
    )

    # Get all planets
    all_planets = {"sun": astrology_data.sun_sign, "moon": astrology_data.moon_sign}
    all_planets.update(astrology_data.planets)

    # Detect yogas
    ascendant_sign = astrology_data.ascendant.sign if astrology_data.ascendant else astrology_data.sun_sign.sign
    yogas = YogaDetector.detect_yogas(
        planets=all_planets,
        ascendant_sign=ascendant_sign,
        signs=AstrologyEngine.SIGNS,
        houses=astrology_data.houses,
    )

    return {
        "profile_name": profile.name,
        "ascendant": ascendant_sign,
        "yogas": [
            {
                "name": y.name,
                "name_sanskrit": y.name_sanskrit,
                "yoga_type": y.yoga_type,
                "planets_involved": y.planets_involved,
                "houses_involved": y.houses_involved,
                "is_benefic": y.is_benefic,
                "strength": y.strength,
                "description": y.description,
                "effects": y.effects,
            }
            for y in yogas
        ],
        "total_yogas": len(yogas),
        "benefic_yogas": len([y for y in yogas if y.is_benefic]),
    }


# Planet information for the visualization
PLANET_INFO = {
    "sun": {
        "name": "Sun",
        "name_hindi": "Surya",
        "symbol": "☉",
        "color": "#FFD700",
        "description": "The Sun represents your core identity, ego, and vitality. It shows your conscious self and life purpose.",
        "orbital_period": "1 year",
    },
    "moon": {
        "name": "Moon",
        "name_hindi": "Chandra",
        "symbol": "☽",
        "color": "#C0C0C0",
        "description": "The Moon represents your emotions, instincts, and subconscious mind. It reveals your inner emotional world.",
        "orbital_period": "27.3 days",
    },
    "mercury": {
        "name": "Mercury",
        "name_hindi": "Budha",
        "symbol": "☿",
        "color": "#90EE90",
        "description": "Mercury governs communication, intellect, and learning. It influences how you think and express ideas.",
        "orbital_period": "88 days",
    },
    "venus": {
        "name": "Venus",
        "name_hindi": "Shukra",
        "symbol": "♀",
        "color": "#FFB6C1",
        "description": "Venus rules love, beauty, and relationships. It shows what you value and how you express affection.",
        "orbital_period": "225 days",
    },
    "mars": {
        "name": "Mars",
        "name_hindi": "Mangal",
        "symbol": "♂",
        "color": "#FF6347",
        "description": "Mars represents energy, action, and desire. It shows how you assert yourself and pursue goals.",
        "orbital_period": "687 days",
    },
    "jupiter": {
        "name": "Jupiter",
        "name_hindi": "Guru",
        "symbol": "♃",
        "color": "#FFA500",
        "description": "Jupiter signifies wisdom, expansion, and good fortune. It shows where you seek growth and meaning.",
        "orbital_period": "12 years",
    },
    "saturn": {
        "name": "Saturn",
        "name_hindi": "Shani",
        "symbol": "♄",
        "color": "#4169E1",
        "description": "Saturn represents discipline, responsibility, and karma. It teaches life lessons through challenges.",
        "orbital_period": "29 years",
    },
    "rahu": {
        "name": "Rahu",
        "name_hindi": "Rahu",
        "symbol": "☊",
        "color": "#483D8B",
        "description": "Rahu (North Node) represents worldly desires and material ambitions. It shows areas of karmic growth.",
        "orbital_period": "18.6 years",
    },
    "ketu": {
        "name": "Ketu",
        "name_hindi": "Ketu",
        "symbol": "☋",
        "color": "#8B4513",
        "description": "Ketu (South Node) represents spirituality and past life karma. It shows areas of natural talent and detachment.",
        "orbital_period": "18.6 years",
    },
}


@router.get("/planet-info/{planet_name}")
async def get_planet_info(planet_name: str):
    """
    Get detailed information about a specific planet.

    Used when user clicks on a planet in the visualization.
    """
    planet_name = planet_name.lower()
    if planet_name not in PLANET_INFO:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Planet '{planet_name}' not found. Valid planets: {', '.join(PLANET_INFO.keys())}",
        )

    info = PLANET_INFO[planet_name]

    # Get current position
    transits = AstrologyEngine.compute_transits()
    if planet_name in transits.planets:
        pos = transits.planets[planet_name]
        sign_idx = AstrologyEngine.SIGNS.index(pos.sign)
        info["current_position"] = {
            "sign": pos.sign,
            "sign_hindi": AstrologyEngine.SIGNS_HINDI[sign_idx],
            "degree": pos.degree,
            "absolute_longitude": sign_idx * 30 + pos.degree,
            "is_retrograde": pos.is_retrograde,
        }

    return info
