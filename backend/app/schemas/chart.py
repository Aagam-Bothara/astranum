"""Chart and computed data schemas."""

from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field

from app.models.user import GuidanceMode


class PlanetPosition(BaseModel):
    """Position of a planet in the zodiac."""

    sign: str
    degree: float = Field(ge=0, lt=30, description="Degree within sign (0-30)")
    is_retrograde: bool = False
    nakshatra: Optional[str] = None  # For Moon and optionally other planets
    nakshatra_pada: Optional[int] = Field(None, ge=1, le=4)
    # Planetary dignity/strength (Vedic)
    dignity: Optional[str] = Field(None, description="Planetary dignity: exalted, own_sign, moolatrikona, friendly, neutral, enemy, debilitated")
    is_combust: Optional[bool] = Field(None, description="True if planet is within combustion range of Sun")


class NumerologyData(BaseModel):
    """Computed numerology data."""

    # Core Numbers (Master numbers 11, 22, 33 are valid)
    life_path: int = Field(ge=1, le=33, description="Life Path number - your life's purpose")
    destiny_number: int = Field(ge=1, le=33, description="Destiny/Expression - your talents")
    soul_urge: int = Field(ge=0, le=33, description="Soul Urge/Heart's Desire - inner motivation")
    personality: int = Field(ge=0, le=33, description="Personality number - how others see you")
    birth_day: int = Field(ge=1, le=31, description="Birth day number")
    name_used: str

    # Extended Numbers (optional - for enhanced readings)
    maturity_number: Optional[int] = Field(None, ge=1, le=33, description="Maturity number - goals for later life")
    personal_year: Optional[int] = Field(None, ge=1, le=9, description="Personal year - current year's theme")
    birthday_number: Optional[int] = Field(None, ge=1, le=33, description="Birthday number - special talents")

    # Karmic Debt (if any detected)
    karmic_debt: Optional[List[int]] = Field(None, description="Karmic debt numbers (13, 14, 16, 19)")

    # Current Cycles
    current_pinnacle: Optional[int] = Field(None, ge=1, le=33, description="Current pinnacle number")
    current_pinnacle_period: Optional[int] = Field(None, ge=1, le=4, description="Current pinnacle period (1-4)")
    current_challenge: Optional[int] = Field(None, ge=0, le=9, description="Current challenge number")
    current_challenge_period: Optional[int] = Field(None, ge=1, le=4, description="Current challenge period (1-4)")


class DashaPeriodSchema(BaseModel):
    """Vimshottari Dasha period."""
    planet: str
    start_date: str
    end_date: str
    duration_years: float
    level: int = Field(ge=1, le=3, description="1=Mahadasha, 2=Antardasha, 3=Pratyantardasha")


class CurrentDashaSchema(BaseModel):
    """Current Dasha information."""
    mahadasha: str
    mahadasha_start: str
    mahadasha_end: str
    mahadasha_remaining_days: int
    antardasha: Optional[str] = None
    antardasha_remaining_days: Optional[int] = None


class AspectSchema(BaseModel):
    """Planetary aspect."""
    aspecting_planet: str
    aspected_planet: str
    aspect_type: str  # conjunction, opposition, trine, square, sextile, special
    orb: float
    strength: str  # full, three_quarter, half, quarter
    is_benefic: bool
    description: str


class YogaSchema(BaseModel):
    """Vedic yoga combination."""
    name: str
    name_sanskrit: str
    yoga_type: str  # raja, dhana, mahapurusha, etc.
    planets_involved: List[str]
    houses_involved: List[int]
    is_benefic: bool
    strength: str  # strong, moderate, weak
    description: str
    effects: str


class TransitAspectSchema(BaseModel):
    """Transit aspect to natal planet."""
    transit_planet: str
    natal_planet: str
    aspect_type: str
    transit_sign: str
    natal_sign: str
    orb: float
    is_applying: bool
    significance: str  # major, moderate, minor
    interpretation: str


class VedicFeaturesSchema(BaseModel):
    """Advanced Vedic astrology features."""
    current_dasha: Optional[CurrentDashaSchema] = None
    dasha_periods: Optional[List[DashaPeriodSchema]] = None
    aspects: Optional[List[AspectSchema]] = None
    yogas: Optional[List[YogaSchema]] = None
    transit_aspects: Optional[List[TransitAspectSchema]] = None


class AstrologyData(BaseModel):
    """Computed astrology data from Swiss Ephemeris."""

    sun_sign: PlanetPosition
    moon_sign: PlanetPosition
    ascendant: Optional[PlanetPosition] = None  # Only if birth time provided
    planets: Dict[str, PlanetPosition]
    moon_nakshatra: Optional[str] = None
    houses: Optional[Dict[str, Any]] = None  # Only if birth time provided
    has_birth_time: bool
    # Advanced Vedic features (Pro tier)
    vedic_features: Optional[VedicFeaturesSchema] = None


class TransitData(BaseModel):
    """Current planetary transit positions."""

    date: str
    planets: Dict[str, PlanetPosition]


class ChartSnapshotResponse(BaseModel):
    """Full chart snapshot response."""

    id: str
    mode: GuidanceMode
    version: int
    numerology_data: Optional[NumerologyData] = None
    astrology_data: Optional[AstrologyData] = None
    transit_data: Optional[TransitData] = None
    created_at: str

    class Config:
        from_attributes = True
