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
        # Estimate timezone from longitude (rough approximation)
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
    numerology_data = NumerologyEngine.compute_all(
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
