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


class AstrologyData(BaseModel):
    """Computed astrology data from Swiss Ephemeris."""

    sun_sign: PlanetPosition
    moon_sign: PlanetPosition
    ascendant: Optional[PlanetPosition] = None  # Only if birth time provided
    planets: Dict[str, PlanetPosition]
    moon_nakshatra: Optional[str] = None
    houses: Optional[Dict[str, Any]] = None  # Only if birth time provided
    has_birth_time: bool


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
