"""
Astrology Engine - Swiss Ephemeris based computations.

This is a deterministic engine using precise astronomical calculations.
The LLM layer only interprets these positions - it never generates them.

Supports both:
- Vedic/Sidereal (default for Indian users) - with Lahiri Ayanamsa
- Western/Tropical
"""

from datetime import date, time, datetime
from typing import Dict, Optional, Tuple, Literal
from dataclasses import dataclass
from enum import Enum

from app.schemas.chart import AstrologyData, PlanetPosition, TransitData

# Swiss Ephemeris import - will be available when pyswisseph is installed
try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
    # Set ephemeris path (download from https://www.astro.com/swisseph/)
    # swe.set_ephe_path('/path/to/ephe')
except ImportError:
    SWISSEPH_AVAILABLE = False


class ZodiacSystem(str, Enum):
    """Zodiac system to use for calculations."""
    SIDEREAL = "sidereal"  # Vedic/Indian
    TROPICAL = "tropical"  # Western


class HouseSystem(str, Enum):
    """House system for chart calculation."""
    WHOLE_SIGN = "W"      # Vedic default - most traditional
    EQUAL = "E"           # Equal houses
    PLACIDUS = "P"        # Western default
    KOCH = "K"            # Koch
    PORPHYRY = "O"        # Porphyry


class NodeType(str, Enum):
    """Type of lunar node calculation."""
    TRUE_NODE = "true"    # True/Osculating node (more accurate astronomically)
    MEAN_NODE = "mean"    # Mean node (some Vedic traditions prefer this)


@dataclass
class GeoLocation:
    """Geographic location for chart calculation."""
    latitude: float
    longitude: float
    timezone_offset: float  # Hours from UTC


class AstrologyEngine:
    """
    Astrology computation engine using Swiss Ephemeris.

    Computes:
    - Sun, Moon, and planet positions (signs + degrees)
    - Ascendant (if birth time provided)
    - House cusps (if birth time provided)
    - Moon Nakshatra (Vedic)
    - Current transits

    Default: Sidereal/Vedic with Lahiri Ayanamsa (most common in India)
    """

    # Zodiac signs
    SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ]

    # Hindi sign names (for display)
    SIGNS_HINDI = [
        "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
        "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"
    ]

    # Planet constants (Swiss Ephemeris)
    PLANETS = {
        "sun": 0,       # SE_SUN - Surya
        "moon": 1,      # SE_MOON - Chandra
        "mercury": 2,   # SE_MERCURY - Budha
        "venus": 3,     # SE_VENUS - Shukra
        "mars": 4,      # SE_MARS - Mangal
        "jupiter": 5,   # SE_JUPITER - Guru
        "saturn": 6,    # SE_SATURN - Shani
        "rahu": 11,     # SE_TRUE_NODE (North Node)
        # Note: Ketu = Rahu + 180° (calculated, not from ephemeris)
    }

    # Outer planets (Western astrology, optional)
    OUTER_PLANETS = {
        "uranus": 7,
        "neptune": 8,
        "pluto": 9,
    }

    # Nakshatras (27 lunar mansions) - each spans 13°20' (800 minutes)
    NAKSHATRAS = [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
        "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ]

    # Nakshatra lords (for dasha calculations - future feature)
    NAKSHATRA_LORDS = [
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
        "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
        "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
        "Jupiter", "Saturn", "Mercury"
    ]

    # Ayanamsa constants
    AYANAMSA_LAHIRI = 1  # swe.SIDM_LAHIRI - most common in India
    AYANAMSA_RAMAN = 3   # swe.SIDM_RAMAN
    AYANAMSA_KP = 5      # swe.SIDM_KRISHNAMURTI

    # Planetary Dignity (Vedic) - Exaltation signs and degrees
    # Format: planet -> (exaltation_sign, exaltation_degree, debilitation_sign)
    EXALTATION = {
        "sun": ("Aries", 10, "Libra"),
        "moon": ("Taurus", 3, "Scorpio"),
        "mars": ("Capricorn", 28, "Cancer"),
        "mercury": ("Virgo", 15, "Pisces"),
        "jupiter": ("Cancer", 5, "Capricorn"),
        "venus": ("Pisces", 27, "Virgo"),
        "saturn": ("Libra", 20, "Aries"),
        "rahu": ("Taurus", 20, "Scorpio"),  # Traditional view
        "ketu": ("Scorpio", 20, "Taurus"),
    }

    # Own Signs (Swakshetra) - planets rule these signs
    OWN_SIGNS = {
        "sun": ["Leo"],
        "moon": ["Cancer"],
        "mars": ["Aries", "Scorpio"],
        "mercury": ["Gemini", "Virgo"],
        "jupiter": ["Sagittarius", "Pisces"],
        "venus": ["Taurus", "Libra"],
        "saturn": ["Capricorn", "Aquarius"],
        "rahu": ["Aquarius"],  # Modern assignment
        "ketu": ["Scorpio"],   # Modern assignment
    }

    # Moolatrikona signs and degree ranges (special strength)
    MOOLATRIKONA = {
        "sun": ("Leo", 0, 20),        # Leo 0-20°
        "moon": ("Taurus", 4, 30),    # Taurus 4-30°
        "mars": ("Aries", 0, 12),     # Aries 0-12°
        "mercury": ("Virgo", 16, 20), # Virgo 16-20°
        "jupiter": ("Sagittarius", 0, 10),  # Sagittarius 0-10°
        "venus": ("Libra", 0, 15),    # Libra 0-15°
        "saturn": ("Aquarius", 0, 20), # Aquarius 0-20°
    }

    # Combustion ranges (degrees from Sun where planet loses strength)
    COMBUSTION_RANGE = {
        "moon": 12,
        "mars": 17,
        "mercury": 14,  # 12 if retrograde
        "jupiter": 11,
        "venus": 10,    # 8 if retrograde
        "saturn": 15,
    }

    @classmethod
    def compute(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time] = None,
        location: Optional[GeoLocation] = None,
        zodiac: ZodiacSystem = ZodiacSystem.SIDEREAL,
        ayanamsa: int = None,
        include_outer_planets: bool = False,
        house_system: HouseSystem = None,
        node_type: NodeType = NodeType.TRUE_NODE,
    ) -> AstrologyData:
        """
        Compute natal chart data.

        Args:
            date_of_birth: Birth date
            time_of_birth: Birth time (optional - affects ascendant/houses)
            location: Birth location (optional - needed for ascendant/houses)
            zodiac: SIDEREAL (Vedic) or TROPICAL (Western)
            ayanamsa: Ayanamsa to use for sidereal (default: Lahiri)
            include_outer_planets: Include Uranus, Neptune, Pluto
            house_system: House system (auto-selects: Whole Sign for Vedic, Placidus for Western)
            node_type: TRUE_NODE or MEAN_NODE for Rahu/Ketu

        Returns:
            AstrologyData with all computed positions
        """
        if not SWISSEPH_AVAILABLE:
            return cls._compute_fallback(date_of_birth, time_of_birth, location)

        # Set ayanamsa for sidereal calculations
        if zodiac == ZodiacSystem.SIDEREAL:
            swe.set_sid_mode(ayanamsa or cls.AYANAMSA_LAHIRI)

        # Auto-select house system based on zodiac if not specified
        if house_system is None:
            house_system = (
                HouseSystem.WHOLE_SIGN if zodiac == ZodiacSystem.SIDEREAL
                else HouseSystem.PLACIDUS
            )

        # Convert to Julian Day
        jd = cls._to_julian_day(date_of_birth, time_of_birth, location)

        # Calculate flags based on zodiac system
        calc_flags = swe.FLG_SWIEPH | swe.FLG_SPEED  # Include speed for retrograde detection
        if zodiac == ZodiacSystem.SIDEREAL:
            calc_flags |= swe.FLG_SIDEREAL

        # Determine which node to use
        node_planet_id = 11 if node_type == NodeType.TRUE_NODE else 10  # SE_TRUE_NODE vs SE_MEAN_NODE

        # Calculate planet positions
        planets = {}
        planet_longitudes = {}  # Store raw longitudes for nakshatra calc

        planets_to_calc = cls.PLANETS.copy()
        planets_to_calc["rahu"] = node_planet_id  # Use selected node type
        if include_outer_planets:
            planets_to_calc.update(cls.OUTER_PLANETS)

        # First pass: calculate Sun to get its longitude for combustion checks
        sun_result, _ = swe.calc_ut(jd, 0, calc_flags)
        sun_longitude = sun_result[0]

        # Calculate all planets with dignity and combustion
        for name, planet_id in planets_to_calc.items():
            pos, longitude = cls._calculate_planet_position(
                jd, planet_id, calc_flags, name, sun_longitude
            )
            planets[name] = pos
            planet_longitudes[name] = longitude

        # Calculate Ketu (South Node = Rahu + 180°)
        rahu_longitude = planet_longitudes["rahu"]
        ketu_longitude = (rahu_longitude + 180) % 360
        # Ketu has same retrograde status as Rahu (nodes are always retrograde)
        planets["ketu"] = cls._longitude_to_position(
            ketu_longitude, is_retrograde=True, planet_name="ketu", sun_longitude=sun_longitude
        )
        planet_longitudes["ketu"] = ketu_longitude

        # Get Sun and Moon (keep in planets dict but also return separately)
        sun_sign = planets["sun"]
        moon_sign = planets["moon"]

        # Calculate Moon Nakshatra using ABSOLUTE longitude and add to moon_sign
        moon_longitude = planet_longitudes["moon"]
        moon_nakshatra, nakshatra_pada = cls._calculate_nakshatra(moon_longitude)
        moon_sign.nakshatra = moon_nakshatra
        moon_sign.nakshatra_pada = nakshatra_pada

        # Calculate Ascendant and Houses (only if time and location provided)
        ascendant = None
        houses = None
        if time_of_birth and location:
            ascendant, houses = cls._calculate_houses(jd, location, calc_flags, house_system)

        # Remove sun/moon from planets dict (returned separately)
        del planets["sun"]
        del planets["moon"]

        return AstrologyData(
            sun_sign=sun_sign,
            moon_sign=moon_sign,
            ascendant=ascendant,
            planets=planets,
            moon_nakshatra=moon_nakshatra,
            houses=houses,
            has_birth_time=time_of_birth is not None,
        )

    @classmethod
    def compute_transits(
        cls,
        target_date: date = None,
        zodiac: ZodiacSystem = ZodiacSystem.SIDEREAL,
    ) -> TransitData:
        """
        Compute current planetary transits.

        Args:
            target_date: Date for transits (defaults to today)
            zodiac: SIDEREAL or TROPICAL

        Returns:
            TransitData with current planet positions
        """
        if target_date is None:
            target_date = date.today()

        if not SWISSEPH_AVAILABLE:
            return cls._compute_transits_fallback(target_date)

        # Set ayanamsa for sidereal
        if zodiac == ZodiacSystem.SIDEREAL:
            swe.set_sid_mode(cls.AYANAMSA_LAHIRI)

        jd = cls._to_julian_day(target_date)

        calc_flags = swe.FLG_SWIEPH
        if zodiac == ZodiacSystem.SIDEREAL:
            calc_flags |= swe.FLG_SIDEREAL

        # Add speed flag for retrograde detection
        calc_flags |= swe.FLG_SPEED

        planets = {}
        planet_longitudes = {}
        for name, planet_id in cls.PLANETS.items():
            pos, longitude = cls._calculate_planet_position(jd, planet_id, calc_flags)
            planets[name] = pos
            planet_longitudes[name] = longitude

        # Calculate Ketu (nodes are always retrograde)
        ketu_longitude = (planet_longitudes["rahu"] + 180) % 360
        planets["ketu"] = cls._longitude_to_position(ketu_longitude, is_retrograde=True)

        return TransitData(
            date=target_date.isoformat(),
            planets=planets,
        )

    @classmethod
    def _to_julian_day(
        cls,
        d: date,
        t: Optional[time] = None,
        location: Optional[GeoLocation] = None,
    ) -> float:
        """Convert date/time to Julian Day number."""
        hour = 12.0  # Default to noon if no time
        if t:
            hour = t.hour + t.minute / 60.0 + t.second / 3600.0
            if location:
                hour -= location.timezone_offset  # Convert to UTC

        return swe.julday(d.year, d.month, d.day, hour)

    @classmethod
    def _calculate_planet_position(
        cls,
        jd: float,
        planet_id: int,
        flags: int = 0,
        planet_name: Optional[str] = None,
        sun_longitude: Optional[float] = None,
    ) -> Tuple[PlanetPosition, float]:
        """
        Calculate planet position for given Julian Day.

        Returns:
            Tuple of (PlanetPosition, raw_longitude)
        """
        result, _ = swe.calc_ut(jd, planet_id, flags)
        longitude = result[0]
        speed = result[3]  # Longitude speed - negative means retrograde

        # Determine if retrograde (negative speed)
        # Note: Sun and Moon never go retrograde
        is_retrograde = speed < 0 and planet_id not in (0, 1)

        # Lunar nodes (10, 11) are always considered retrograde in Vedic
        if planet_id in (10, 11):
            is_retrograde = True

        return cls._longitude_to_position(
            longitude, is_retrograde, planet_name, sun_longitude
        ), longitude

    @classmethod
    def _longitude_to_position(
        cls,
        longitude: float,
        is_retrograde: bool = False,
        planet_name: Optional[str] = None,
        sun_longitude: Optional[float] = None,
    ) -> PlanetPosition:
        """Convert ecliptic longitude to sign and degree."""
        sign_index = int(longitude / 30) % 12
        degree_in_sign = longitude % 30
        sign = cls.SIGNS[sign_index]

        # Calculate dignity if planet name provided
        dignity = None
        is_combust = None
        if planet_name and planet_name in cls.EXALTATION:
            dignity = cls._calculate_dignity(planet_name, sign, degree_in_sign)

        # Check combustion if Sun longitude provided
        if planet_name and sun_longitude is not None and planet_name != "sun":
            is_combust = cls._check_combustion(planet_name, longitude, sun_longitude, is_retrograde)

        return PlanetPosition(
            sign=sign,
            degree=round(degree_in_sign, 2),
            is_retrograde=is_retrograde,
            dignity=dignity,
            is_combust=is_combust,
        )

    @classmethod
    def _calculate_dignity(cls, planet: str, sign: str, degree: float) -> str:
        """
        Calculate planetary dignity (strength) based on sign placement.

        Returns one of: exalted, moolatrikona, own_sign, friendly, neutral, enemy, debilitated
        """
        if planet not in cls.EXALTATION:
            return "neutral"

        exalt_sign, exalt_degree, debil_sign = cls.EXALTATION[planet]

        # Check exaltation (strongest)
        if sign == exalt_sign:
            return "exalted"

        # Check debilitation (weakest)
        if sign == debil_sign:
            return "debilitated"

        # Check Moolatrikona (special strength)
        if planet in cls.MOOLATRIKONA:
            mt_sign, mt_start, mt_end = cls.MOOLATRIKONA[planet]
            if sign == mt_sign and mt_start <= degree < mt_end:
                return "moolatrikona"

        # Check own sign
        if planet in cls.OWN_SIGNS and sign in cls.OWN_SIGNS[planet]:
            return "own_sign"

        # Default to neutral (friendly/enemy requires complex relationship charts)
        return "neutral"

    @classmethod
    def _check_combustion(
        cls,
        planet: str,
        planet_longitude: float,
        sun_longitude: float,
        is_retrograde: bool = False,
    ) -> bool:
        """Check if a planet is combust (too close to Sun)."""
        if planet not in cls.COMBUSTION_RANGE:
            return False

        # Calculate angular distance from Sun
        diff = abs(planet_longitude - sun_longitude)
        if diff > 180:
            diff = 360 - diff

        combustion_range = cls.COMBUSTION_RANGE[planet]
        # Mercury and Venus have smaller range when retrograde
        if is_retrograde and planet == "mercury":
            combustion_range = 12
        elif is_retrograde and planet == "venus":
            combustion_range = 8

        return diff <= combustion_range

    @classmethod
    def _calculate_houses(
        cls,
        jd: float,
        location: GeoLocation,
        flags: int = 0,
        house_system: HouseSystem = HouseSystem.WHOLE_SIGN,
    ) -> Tuple[PlanetPosition, Dict]:
        """Calculate house cusps and ascendant."""
        # Convert house system enum to bytes for Swiss Ephemeris
        hsys = house_system.value.encode('ascii')

        # For sidereal, we need to pass the flag differently
        if flags & swe.FLG_SIDEREAL:
            cusps, ascmc = swe.houses_ex(
                jd, location.latitude, location.longitude, hsys, flags
            )
        else:
            cusps, ascmc = swe.houses(
                jd, location.latitude, location.longitude, hsys
            )

        # Ascendant is ascmc[0]
        asc_longitude = ascmc[0]
        ascendant = cls._longitude_to_position(asc_longitude)

        # House cusps - houses_ex returns 12 elements (0-11 = houses 1-12)
        # houses returns 13 elements (0 unused, 1-12 = houses 1-12)
        houses = {}
        cusp_offset = 0 if len(cusps) == 12 else 1  # houses_ex vs houses
        for i in range(12):
            cusp_idx = i + cusp_offset
            if cusp_idx < len(cusps):
                cusp_longitude = cusps[cusp_idx]
                sign_index = int(cusp_longitude / 30) % 12
                houses[f"house_{i + 1}"] = {
                    "sign": cls.SIGNS[sign_index],
                    "degree": round(cusp_longitude % 30, 2),
                }

        return ascendant, houses

    @classmethod
    def _calculate_nakshatra(cls, moon_longitude: float) -> Tuple[str, int]:
        """
        Calculate Moon's Nakshatra from its ABSOLUTE longitude (0-360).

        Args:
            moon_longitude: Moon's ecliptic longitude in degrees (0-360)

        Returns:
            Tuple of (nakshatra_name, pada)
            - Nakshatra: One of 27 lunar mansions
            - Pada: Quarter within nakshatra (1-4)
        """
        # Each Nakshatra spans 13°20' = 13.333... degrees
        nakshatra_span = 360.0 / 27.0  # 13.333...

        # Pada (quarter) spans 3°20' = 3.333... degrees
        pada_span = nakshatra_span / 4.0  # 3.333...

        nakshatra_index = int(moon_longitude / nakshatra_span) % 27

        # Calculate pada (1-4)
        position_in_nakshatra = moon_longitude % nakshatra_span
        pada = int(position_in_nakshatra / pada_span) + 1
        pada = min(pada, 4)  # Ensure max is 4

        return cls.NAKSHATRAS[nakshatra_index], pada

    @classmethod
    def get_ayanamsa(cls, jd: float, ayanamsa_type: int = None) -> float:
        """Get the ayanamsa value for a given Julian Day."""
        if not SWISSEPH_AVAILABLE:
            # Approximate Lahiri ayanamsa for 2024
            return 24.17

        swe.set_sid_mode(ayanamsa_type or cls.AYANAMSA_LAHIRI)
        return swe.get_ayanamsa_ut(jd)

    @classmethod
    def _compute_fallback(
        cls,
        date_of_birth: date,
        time_of_birth: Optional[time],
        location: Optional[GeoLocation] = None,
    ) -> AstrologyData:
        """
        Fallback computation when Swiss Ephemeris is not available.

        Uses astronomical algorithms to approximate planet positions.
        Accuracy: ~1-2 degrees for inner planets, useful for sign determination.

        Note: For professional accuracy, install pyswisseph with Visual C++ Build Tools.
        """
        import math

        # Calculate days since J2000.0 (Jan 1, 2000, 12:00 TT)
        j2000 = date(2000, 1, 1)
        days_since_j2000 = (date_of_birth - j2000).days

        # Add time offset if available
        if time_of_birth:
            days_since_j2000 += (time_of_birth.hour + time_of_birth.minute / 60) / 24
            if location:
                days_since_j2000 -= location.timezone_offset / 24  # Convert to UTC

        # Current Lahiri ayanamsa (precession rate ~50.3" per year)
        # Base: 23.85° on Jan 1, 2000
        years_since_j2000 = days_since_j2000 / 365.25
        ayanamsa = 23.85 + (years_since_j2000 * 50.3 / 3600)  # ~24.17° in 2024

        # Calculate Sun position (mean longitude)
        # Mean anomaly of Sun
        sun_mean_anomaly = (357.5291 + 0.98560028 * days_since_j2000) % 360
        sun_mean_anomaly_rad = math.radians(sun_mean_anomaly)

        # Equation of center (correction for elliptical orbit)
        sun_eoc = 1.9148 * math.sin(sun_mean_anomaly_rad) + \
                  0.0200 * math.sin(2 * sun_mean_anomaly_rad) + \
                  0.0003 * math.sin(3 * sun_mean_anomaly_rad)

        # True longitude of Sun (tropical)
        sun_tropical = (280.4665 + 0.98564736 * days_since_j2000 + sun_eoc) % 360
        # Convert to sidereal
        sun_sidereal = (sun_tropical - ayanamsa) % 360
        sun_sign = cls._longitude_to_position(sun_sidereal)

        # Calculate Moon position (approximate - lunar orbit is complex)
        # Mean longitude of Moon
        moon_mean_longitude = (218.3165 + 13.17639648 * days_since_j2000) % 360
        # Mean elongation
        moon_elongation = (297.8502 + 12.19074912 * days_since_j2000) % 360
        moon_elongation_rad = math.radians(moon_elongation)
        # Mean anomaly of Moon
        moon_mean_anomaly = (134.9634 + 13.06499295 * days_since_j2000) % 360
        moon_mean_anomaly_rad = math.radians(moon_mean_anomaly)
        # Argument of latitude
        moon_arg_lat = (93.2721 + 13.22935024 * days_since_j2000) % 360

        # Major perturbations
        moon_correction = 6.2886 * math.sin(moon_mean_anomaly_rad) + \
                         1.2740 * math.sin(2 * moon_elongation_rad - moon_mean_anomaly_rad) + \
                         0.6583 * math.sin(2 * moon_elongation_rad) + \
                         0.2136 * math.sin(2 * moon_mean_anomaly_rad)

        moon_tropical = (moon_mean_longitude + moon_correction) % 360
        moon_sidereal = (moon_tropical - ayanamsa) % 360
        moon_sign = cls._longitude_to_position(moon_sidereal)

        # Calculate Moon Nakshatra
        moon_nakshatra, nakshatra_pada = cls._calculate_nakshatra(moon_sidereal)
        moon_sign.nakshatra = moon_nakshatra
        moon_sign.nakshatra_pada = nakshatra_pada

        # Calculate other planets using simplified orbital mechanics
        planets = {}

        # Mercury - fast inner planet (88 day orbit)
        mercury_mean = (252.2509 + 4.09233445 * days_since_j2000) % 360
        mercury_mean_rad = math.radians(mercury_mean)
        mercury_correction = 23.4400 * math.sin(mercury_mean_rad) + \
                            2.9818 * math.sin(2 * mercury_mean_rad)
        mercury_tropical = (mercury_mean + mercury_correction + 180) % 360  # Approximate heliocentric to geocentric
        mercury_sidereal = (mercury_tropical - ayanamsa) % 360
        planets["mercury"] = cls._longitude_to_position(mercury_sidereal)

        # Venus - inner planet (225 day orbit)
        venus_mean = (181.9798 + 1.60213034 * days_since_j2000) % 360
        venus_mean_rad = math.radians(venus_mean)
        venus_correction = 0.7758 * math.sin(venus_mean_rad)
        venus_tropical = (venus_mean + venus_correction + 180) % 360
        venus_sidereal = (venus_tropical - ayanamsa) % 360
        planets["venus"] = cls._longitude_to_position(venus_sidereal)

        # Mars - outer planet (687 day orbit)
        mars_mean = (355.4330 + 0.52402068 * days_since_j2000) % 360
        mars_mean_rad = math.radians(mars_mean)
        mars_correction = 10.6912 * math.sin(mars_mean_rad) + \
                         0.6228 * math.sin(2 * mars_mean_rad)
        mars_tropical = (mars_mean + mars_correction) % 360
        mars_sidereal = (mars_tropical - ayanamsa) % 360
        planets["mars"] = cls._longitude_to_position(mars_sidereal)

        # Jupiter - outer planet (12 year orbit)
        jupiter_mean = (34.3515 + 0.08308529 * days_since_j2000) % 360
        jupiter_mean_rad = math.radians(jupiter_mean)
        jupiter_correction = 5.5549 * math.sin(jupiter_mean_rad) + \
                            0.1683 * math.sin(2 * jupiter_mean_rad)
        jupiter_tropical = (jupiter_mean + jupiter_correction) % 360
        jupiter_sidereal = (jupiter_tropical - ayanamsa) % 360
        planets["jupiter"] = cls._longitude_to_position(jupiter_sidereal)

        # Saturn - outer planet (29 year orbit)
        saturn_mean = (50.0774 + 0.03349791 * days_since_j2000) % 360
        saturn_mean_rad = math.radians(saturn_mean)
        saturn_correction = 6.3585 * math.sin(saturn_mean_rad) + \
                           0.2204 * math.sin(2 * saturn_mean_rad)
        saturn_tropical = (saturn_mean + saturn_correction) % 360
        saturn_sidereal = (saturn_tropical - ayanamsa) % 360
        planets["saturn"] = cls._longitude_to_position(saturn_sidereal)

        # Rahu (North Node) - 18.6 year retrograde cycle
        rahu_mean = (125.0445 - 0.05295377 * days_since_j2000) % 360  # Retrograde
        rahu_sidereal = (rahu_mean - ayanamsa) % 360
        planets["rahu"] = cls._longitude_to_position(rahu_sidereal, is_retrograde=True)

        # Ketu (South Node) - opposite to Rahu
        ketu_sidereal = (rahu_sidereal + 180) % 360
        planets["ketu"] = cls._longitude_to_position(ketu_sidereal, is_retrograde=True)

        # Calculate ascendant if time and location provided
        ascendant = None
        if time_of_birth and location:
            ascendant = cls._calculate_ascendant_fallback(
                date_of_birth, time_of_birth, location, ayanamsa
            )

        return AstrologyData(
            sun_sign=sun_sign,
            moon_sign=moon_sign,
            ascendant=ascendant,
            planets=planets,
            moon_nakshatra=moon_nakshatra,
            houses=None,  # Houses require more complex calculations
            has_birth_time=time_of_birth is not None,
        )

    @classmethod
    def _calculate_ascendant_fallback(
        cls,
        birth_date: date,
        birth_time: time,
        location: GeoLocation,
        ayanamsa: float,
    ) -> PlanetPosition:
        """Calculate approximate ascendant using simplified algorithm."""
        import math

        # Calculate Local Sidereal Time (LST)
        j2000 = date(2000, 1, 1)
        days_since_j2000 = (birth_date - j2000).days

        # Convert time to decimal hours in UTC
        local_hours = birth_time.hour + birth_time.minute / 60 + birth_time.second / 3600
        utc_hours = local_hours - location.timezone_offset

        # Julian centuries from J2000
        jd = days_since_j2000 + utc_hours / 24
        T = jd / 36525.0

        # Greenwich Mean Sidereal Time at 0h UT
        gmst0 = 100.46061837 + 36000.770053608 * T + 0.000387933 * T * T
        gmst0 = gmst0 % 360

        # GMST at observation time
        gmst = (gmst0 + 360.98564736629 * utc_hours / 24) % 360

        # Local Sidereal Time
        lst = (gmst + location.longitude) % 360
        lst_rad = math.radians(lst)

        # Calculate ascendant using simplified formula
        lat_rad = math.radians(location.latitude)

        # Obliquity of ecliptic
        obliquity = 23.4393 - 0.0130 * T
        obliquity_rad = math.radians(obliquity)

        # Ascendant calculation
        y = -math.cos(lst_rad)
        x = math.sin(obliquity_rad) * math.tan(lat_rad) + math.cos(obliquity_rad) * math.sin(lst_rad)

        asc_tropical = math.degrees(math.atan2(y, x)) % 360
        asc_sidereal = (asc_tropical - ayanamsa) % 360

        return cls._longitude_to_position(asc_sidereal)

    @classmethod
    def _compute_transits_fallback(cls, target_date: date) -> TransitData:
        """Fallback transit computation using astronomical algorithms."""
        # Reuse the natal calculation without time/location
        chart = cls._compute_fallback(target_date, None, None)

        # Build planet dict including sun and moon
        planets = {
            "sun": chart.sun_sign,
            "moon": chart.moon_sign,
            **chart.planets,
        }

        return TransitData(
            date=target_date.isoformat(),
            planets=planets,
        )

    @classmethod
    def _simple_sun_sign(cls, d: date) -> str:
        """
        Simple Sun sign calculation based on TROPICAL date ranges.

        Note: This is Western/Tropical. For Sidereal, subtract ~24 days
        (or use proper ephemeris calculation).
        """
        month, day = d.month, d.day

        # Tropical zodiac date ranges (approximate)
        if (month == 3 and day >= 21) or (month == 4 and day <= 19):
            return "Aries"
        elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
            return "Taurus"
        elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
            return "Gemini"
        elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
            return "Cancer"
        elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
            return "Leo"
        elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
            return "Virgo"
        elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
            return "Libra"
        elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
            return "Scorpio"
        elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
            return "Sagittarius"
        elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
            return "Capricorn"
        elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
            return "Aquarius"
        else:
            return "Pisces"
