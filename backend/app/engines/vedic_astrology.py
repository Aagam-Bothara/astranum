"""
Vedic Astrology Engine - Advanced calculations for Jyotish.

This module provides:
- Vimshottari Dasha (planetary period) calculations
- Vedic aspect calculations (Drishti)
- Yoga combinations detection
- Transit-to-natal aspect analysis
"""

from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum

from app.schemas.chart import PlanetPosition


# =============================================================================
# DATA CLASSES
# =============================================================================

@dataclass
class DashaPeriod:
    """Represents a Dasha (planetary period)."""
    planet: str
    start_date: date
    end_date: date
    duration_years: float
    level: int = 1  # 1=Mahadasha, 2=Antardasha, 3=Pratyantardasha
    sub_periods: List['DashaPeriod'] = field(default_factory=list)


@dataclass
class Aspect:
    """Represents a planetary aspect."""
    aspecting_planet: str
    aspected_planet: str
    aspect_type: str  # "conjunction", "opposition", "trine", "square", "sextile", "special"
    orb: float  # Degree difference from exact aspect
    strength: str  # "full", "three_quarter", "half", "quarter"
    is_benefic: bool
    description: str


@dataclass
class Yoga:
    """Represents a Vedic yoga combination."""
    name: str
    name_sanskrit: str
    yoga_type: str  # "raja", "dhana", "arishta", "mahapurusha", etc.
    planets_involved: List[str]
    houses_involved: List[int]
    is_benefic: bool
    strength: str  # "strong", "moderate", "weak"
    description: str
    effects: str


@dataclass
class TransitAspect:
    """Represents a transit aspect to natal planet."""
    transit_planet: str
    natal_planet: str
    aspect_type: str
    transit_sign: str
    natal_sign: str
    orb: float
    is_applying: bool  # True if aspect is forming, False if separating
    significance: str  # "major", "moderate", "minor"
    interpretation: str


# =============================================================================
# VIMSHOTTARI DASHA SYSTEM
# =============================================================================

class VimshottariDasha:
    """
    Vimshottari Dasha - The 120-year planetary period system.

    Based on the Moon's nakshatra at birth, this system divides life
    into major periods ruled by different planets.
    """

    # Dasha periods in years (total = 120 years)
    DASHA_YEARS = {
        "Ketu": 7,
        "Venus": 20,
        "Sun": 6,
        "Moon": 10,
        "Mars": 7,
        "Rahu": 18,
        "Jupiter": 16,
        "Saturn": 19,
        "Mercury": 17,
    }

    # Dasha sequence (Vimshottari order)
    DASHA_SEQUENCE = [
        "Ketu", "Venus", "Sun", "Moon", "Mars",
        "Rahu", "Jupiter", "Saturn", "Mercury"
    ]

    # Nakshatra to starting Dasha lord mapping
    NAKSHATRA_LORDS = [
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
        "Jupiter", "Saturn", "Mercury", "Ketu", "Venus", "Sun",
        "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
        "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu",
        "Jupiter", "Saturn", "Mercury"
    ]

    @classmethod
    def calculate_dasha(
        cls,
        moon_longitude: float,
        date_of_birth: date,
        years_to_calculate: int = 100,
    ) -> List[DashaPeriod]:
        """
        Calculate Vimshottari Dasha periods from birth.

        Args:
            moon_longitude: Absolute Moon longitude (0-360)
            date_of_birth: Birth date
            years_to_calculate: How many years of dashas to calculate

        Returns:
            List of DashaPeriod objects for Mahadashas
        """
        # Calculate nakshatra index and position within nakshatra
        nakshatra_span = 360.0 / 27.0  # 13.333... degrees
        nakshatra_index = int(moon_longitude / nakshatra_span)
        position_in_nakshatra = (moon_longitude % nakshatra_span) / nakshatra_span

        # Get starting dasha lord
        starting_lord = cls.NAKSHATRA_LORDS[nakshatra_index]
        lord_index = cls.DASHA_SEQUENCE.index(starting_lord)

        # Calculate remaining portion of first dasha
        total_dasha_years = cls.DASHA_YEARS[starting_lord]
        elapsed_portion = position_in_nakshatra
        remaining_years = total_dasha_years * (1 - elapsed_portion)

        # Build dasha periods
        dashas = []
        current_date = date_of_birth
        end_date = date_of_birth + timedelta(days=years_to_calculate * 365.25)

        # First (partial) dasha
        first_end = current_date + timedelta(days=remaining_years * 365.25)
        if first_end <= end_date:
            dashas.append(DashaPeriod(
                planet=starting_lord,
                start_date=current_date,
                end_date=first_end,
                duration_years=remaining_years,
                level=1,
            ))
            current_date = first_end
            lord_index = (lord_index + 1) % 9

        # Full dashas
        while current_date < end_date:
            planet = cls.DASHA_SEQUENCE[lord_index]
            years = cls.DASHA_YEARS[planet]
            period_end = current_date + timedelta(days=years * 365.25)

            if period_end > end_date:
                period_end = end_date
                years = (period_end - current_date).days / 365.25

            dasha = DashaPeriod(
                planet=planet,
                start_date=current_date,
                end_date=period_end,
                duration_years=years,
                level=1,
            )

            # Calculate Antardashas (sub-periods)
            dasha.sub_periods = cls._calculate_antardashas(
                planet, current_date, period_end
            )

            dashas.append(dasha)
            current_date = period_end
            lord_index = (lord_index + 1) % 9

        return dashas

    @classmethod
    def _calculate_antardashas(
        cls,
        mahadasha_lord: str,
        start_date: date,
        end_date: date,
    ) -> List[DashaPeriod]:
        """Calculate Antardasha (sub-periods) within a Mahadasha."""
        antardashas = []
        mahadasha_years = (end_date - start_date).days / 365.25

        # Start from Mahadasha lord
        lord_index = cls.DASHA_SEQUENCE.index(mahadasha_lord)
        current_date = start_date

        for i in range(9):
            planet = cls.DASHA_SEQUENCE[(lord_index + i) % 9]
            # Antardasha duration is proportional to its Mahadasha years
            proportion = cls.DASHA_YEARS[planet] / 120.0
            antardasha_years = mahadasha_years * proportion
            period_end = current_date + timedelta(days=antardasha_years * 365.25)

            if period_end > end_date:
                period_end = end_date
                antardasha_years = (period_end - current_date).days / 365.25

            antardashas.append(DashaPeriod(
                planet=planet,
                start_date=current_date,
                end_date=period_end,
                duration_years=antardasha_years,
                level=2,
            ))

            current_date = period_end
            if current_date >= end_date:
                break

        return antardashas

    @classmethod
    def get_current_dasha(
        cls,
        dashas: List[DashaPeriod],
        current_date: date = None,
    ) -> Dict[str, Any]:
        """
        Get the current Mahadasha and Antardasha for a given date.

        Returns dict with:
        - mahadasha: Current Mahadasha planet
        - antardasha: Current Antardasha planet
        - mahadasha_remaining: Days remaining in Mahadasha
        - antardasha_remaining: Days remaining in Antardasha
        """
        if current_date is None:
            current_date = date.today()

        for dasha in dashas:
            if dasha.start_date <= current_date <= dasha.end_date:
                mahadasha_remaining = (dasha.end_date - current_date).days

                # Find current Antardasha
                antardasha_planet = None
                antardasha_remaining = 0
                for antardasha in dasha.sub_periods:
                    if antardasha.start_date <= current_date <= antardasha.end_date:
                        antardasha_planet = antardasha.planet
                        antardasha_remaining = (antardasha.end_date - current_date).days
                        break

                return {
                    "mahadasha": dasha.planet,
                    "mahadasha_start": dasha.start_date.isoformat(),
                    "mahadasha_end": dasha.end_date.isoformat(),
                    "mahadasha_remaining_days": mahadasha_remaining,
                    "antardasha": antardasha_planet,
                    "antardasha_remaining_days": antardasha_remaining,
                }

        return {"mahadasha": None, "antardasha": None}


# =============================================================================
# VEDIC ASPECTS (DRISHTI)
# =============================================================================

class VedicAspects:
    """
    Vedic planetary aspects (Drishti).

    In Vedic astrology:
    - All planets aspect the 7th house from their position (full aspect)
    - Mars additionally aspects 4th and 8th houses
    - Jupiter additionally aspects 5th and 9th houses
    - Saturn additionally aspects 3rd and 10th houses
    - Rahu/Ketu aspect 5th and 9th houses (like Jupiter)
    """

    # Special aspects (in addition to 7th house aspect)
    SPECIAL_ASPECTS = {
        "mars": [4, 8],      # 4th and 8th from position
        "jupiter": [5, 9],   # 5th and 9th from position
        "saturn": [3, 10],   # 3rd and 10th from position
        "rahu": [5, 9],      # Like Jupiter
        "ketu": [5, 9],      # Like Jupiter
    }

    # Aspect strength by house distance
    ASPECT_STRENGTH = {
        7: "full",           # Opposition - full aspect
        5: "three_quarter",  # Trine (special)
        9: "three_quarter",  # Trine (special)
        4: "three_quarter",  # Square (Mars special)
        8: "three_quarter",  # (Mars special)
        3: "half",           # (Saturn special)
        10: "half",          # (Saturn special)
    }

    # Benefic planets
    BENEFICS = {"jupiter", "venus", "moon", "mercury"}  # Mercury when unafflicted
    MALEFICS = {"saturn", "mars", "sun", "rahu", "ketu"}

    @classmethod
    def calculate_aspects(
        cls,
        planets: Dict[str, PlanetPosition],
        signs: List[str],
    ) -> List[Aspect]:
        """
        Calculate all planetary aspects in a chart.

        Args:
            planets: Dict of planet name to PlanetPosition
            signs: List of zodiac signs (for sign-based aspects)

        Returns:
            List of Aspect objects
        """
        aspects = []
        planet_signs = {}

        # Map planets to their sign indices
        for planet, pos in planets.items():
            sign_idx = signs.index(pos.sign) if pos.sign in signs else 0
            planet_signs[planet] = (sign_idx, pos.degree)

        # Check aspects between all planet pairs
        for planet1, (sign1, deg1) in planet_signs.items():
            for planet2, (sign2, deg2) in planet_signs.items():
                if planet1 == planet2:
                    continue

                # Calculate house distance (1-12)
                house_distance = ((sign2 - sign1) % 12) + 1

                # Check if aspect exists
                aspect = cls._check_aspect(planet1, planet2, house_distance, deg1, deg2)
                if aspect:
                    aspects.append(aspect)

        return aspects

    @classmethod
    def _check_aspect(
        cls,
        planet1: str,
        planet2: str,
        house_distance: int,
        deg1: float,
        deg2: float,
    ) -> Optional[Aspect]:
        """Check if planet1 aspects planet2 and return Aspect if so."""
        is_aspecting = False
        aspect_type = ""
        strength = "full"

        # All planets have 7th house aspect (opposition)
        if house_distance == 7:
            is_aspecting = True
            aspect_type = "opposition"
            strength = "full"

        # Check special aspects
        elif planet1 in cls.SPECIAL_ASPECTS:
            if house_distance in cls.SPECIAL_ASPECTS[planet1]:
                is_aspecting = True
                aspect_type = "special"
                strength = cls.ASPECT_STRENGTH.get(house_distance, "half")

        # Conjunction (same sign)
        if house_distance == 1:
            orb = abs(deg1 - deg2)
            if orb <= 10:  # Within 10 degree orb
                is_aspecting = True
                aspect_type = "conjunction"
                strength = "full" if orb <= 5 else "three_quarter"

        if not is_aspecting:
            return None

        # Calculate orb
        long1 = (house_distance - 1) * 30 + deg1
        long2 = deg2
        orb = abs(long1 - long2) if aspect_type != "conjunction" else abs(deg1 - deg2)

        is_benefic = planet1 in cls.BENEFICS

        return Aspect(
            aspecting_planet=planet1,
            aspected_planet=planet2,
            aspect_type=aspect_type,
            orb=round(orb, 2),
            strength=strength,
            is_benefic=is_benefic,
            description=cls._get_aspect_description(planet1, planet2, aspect_type, is_benefic),
        )

    @classmethod
    def _get_aspect_description(
        cls,
        planet1: str,
        planet2: str,
        aspect_type: str,
        is_benefic: bool,
    ) -> str:
        """Generate a description for an aspect."""
        p1 = planet1.title()
        p2 = planet2.title()

        if aspect_type == "conjunction":
            return f"{p1} conjunct {p2}: Energies merge and intensify each other"
        elif aspect_type == "opposition":
            return f"{p1} aspects {p2} (7th house): Creates awareness and balance between energies"
        else:
            nature = "supportive" if is_benefic else "challenging"
            return f"{p1} special aspect on {p2}: {nature.title()} influence from {p1}"


# =============================================================================
# YOGA COMBINATIONS
# =============================================================================

class YogaDetector:
    """
    Detects Vedic yoga combinations in a chart.

    Yogas are specific planetary combinations that indicate
    particular life patterns, talents, or challenges.
    """

    # House lordships for each sign (0-based index)
    SIGN_LORDS = {
        0: "mars",      # Aries
        1: "venus",     # Taurus
        2: "mercury",   # Gemini
        3: "moon",      # Cancer
        4: "sun",       # Leo
        5: "mercury",   # Virgo
        6: "venus",     # Libra
        7: "mars",      # Scorpio (traditional)
        8: "jupiter",   # Sagittarius
        9: "saturn",    # Capricorn
        10: "saturn",   # Aquarius
        11: "jupiter",  # Pisces
    }

    # Kendra houses (angular)
    KENDRAS = [1, 4, 7, 10]

    # Trikona houses (trinal)
    TRIKONAS = [1, 5, 9]

    # Dusthana houses (difficult)
    DUSTHANAS = [6, 8, 12]

    @classmethod
    def detect_yogas(
        cls,
        planets: Dict[str, PlanetPosition],
        ascendant_sign: str,
        signs: List[str],
        houses: Optional[Dict[str, Any]] = None,
    ) -> List[Yoga]:
        """
        Detect all yogas in a chart.

        Args:
            planets: Dict of planet positions
            ascendant_sign: The ascendant (Lagna) sign
            signs: List of zodiac signs
            houses: House cusps if available

        Returns:
            List of detected Yoga objects
        """
        yogas = []
        asc_index = signs.index(ascendant_sign) if ascendant_sign in signs else 0

        # Map planets to houses
        planet_houses = {}
        for planet, pos in planets.items():
            sign_idx = signs.index(pos.sign) if pos.sign in signs else 0
            house = ((sign_idx - asc_index) % 12) + 1
            planet_houses[planet] = house

        # Detect various yogas
        yogas.extend(cls._detect_mahapurusha_yogas(planets, planet_houses, signs))
        yogas.extend(cls._detect_raja_yogas(planet_houses, asc_index, signs))
        yogas.extend(cls._detect_dhana_yogas(planet_houses, asc_index, signs))
        yogas.extend(cls._detect_neecha_bhanga(planets, signs))
        yogas.extend(cls._detect_gajakesari(planet_houses))
        yogas.extend(cls._detect_budhaditya(planet_houses, planets))

        return yogas

    @classmethod
    def _detect_mahapurusha_yogas(
        cls,
        planets: Dict[str, PlanetPosition],
        planet_houses: Dict[str, int],
        signs: List[str],
    ) -> List[Yoga]:
        """
        Detect Pancha Mahapurusha Yogas.

        These occur when Mars, Mercury, Jupiter, Venus, or Saturn
        are in their own or exaltation sign AND in a Kendra house.
        """
        yogas = []

        mahapurusha_config = {
            "mars": ("Ruchaka", "Courage, leadership, military prowess"),
            "mercury": ("Bhadra", "Intelligence, eloquence, business acumen"),
            "jupiter": ("Hamsa", "Wisdom, spirituality, good fortune"),
            "venus": ("Malavya", "Beauty, luxury, artistic talents"),
            "saturn": ("Shasha", "Authority, discipline, longevity"),
        }

        own_signs = {
            "mars": ["Aries", "Scorpio"],
            "mercury": ["Gemini", "Virgo"],
            "jupiter": ["Sagittarius", "Pisces"],
            "venus": ["Taurus", "Libra"],
            "saturn": ["Capricorn", "Aquarius"],
        }

        exaltation_signs = {
            "mars": "Capricorn",
            "mercury": "Virgo",
            "jupiter": "Cancer",
            "venus": "Pisces",
            "saturn": "Libra",
        }

        for planet, (yoga_name, effects) in mahapurusha_config.items():
            if planet not in planets:
                continue

            pos = planets[planet]
            house = planet_houses.get(planet, 0)

            # Check if in own or exaltation sign
            in_own = pos.sign in own_signs.get(planet, [])
            in_exalt = pos.sign == exaltation_signs.get(planet)

            # Check if in Kendra
            in_kendra = house in cls.KENDRAS

            if (in_own or in_exalt) and in_kendra:
                strength = "strong" if in_exalt else "moderate"
                yogas.append(Yoga(
                    name=yoga_name + " Yoga",
                    name_sanskrit=yoga_name,
                    yoga_type="mahapurusha",
                    planets_involved=[planet],
                    houses_involved=[house],
                    is_benefic=True,
                    strength=strength,
                    description=f"{planet.title()} in {pos.sign} (house {house}) forms {yoga_name} Yoga",
                    effects=effects,
                ))

        return yogas

    @classmethod
    def _detect_raja_yogas(
        cls,
        planet_houses: Dict[str, int],
        asc_index: int,
        signs: List[str],
    ) -> List[Yoga]:
        """
        Detect Raja Yogas (combinations for power and authority).

        Raja Yoga forms when lords of Kendra and Trikona houses
        are conjunct or in mutual aspect.
        """
        yogas = []

        # Get lords of Kendra and Trikona houses
        kendra_lords = set()
        trikona_lords = set()

        for house in cls.KENDRAS:
            sign_idx = (asc_index + house - 1) % 12
            lord = cls.SIGN_LORDS[sign_idx]
            kendra_lords.add(lord)

        for house in cls.TRIKONAS:
            sign_idx = (asc_index + house - 1) % 12
            lord = cls.SIGN_LORDS[sign_idx]
            trikona_lords.add(lord)

        # Check for conjunctions between Kendra and Trikona lords
        for kendra_lord in kendra_lords:
            for trikona_lord in trikona_lords:
                if kendra_lord == trikona_lord:
                    continue

                kl_house = planet_houses.get(kendra_lord, 0)
                tl_house = planet_houses.get(trikona_lord, 0)

                # Conjunction (same house)
                if kl_house == tl_house and kl_house > 0:
                    yogas.append(Yoga(
                        name="Raja Yoga",
                        name_sanskrit="Raja Yoga",
                        yoga_type="raja",
                        planets_involved=[kendra_lord, trikona_lord],
                        houses_involved=[kl_house],
                        is_benefic=True,
                        strength="strong",
                        description=f"{kendra_lord.title()} (Kendra lord) conjunct {trikona_lord.title()} (Trikona lord) in house {kl_house}",
                        effects="Success, recognition, authority, and rise in life",
                    ))

        return yogas

    @classmethod
    def _detect_dhana_yogas(
        cls,
        planet_houses: Dict[str, int],
        asc_index: int,
        signs: List[str],
    ) -> List[Yoga]:
        """
        Detect Dhana Yogas (wealth combinations).

        Forms when lords of 2nd, 5th, 9th, and 11th houses
        are well placed and connected.
        """
        yogas = []
        wealth_houses = [2, 5, 9, 11]

        # Get lords of wealth houses
        wealth_lords = {}
        for house in wealth_houses:
            sign_idx = (asc_index + house - 1) % 12
            lord = cls.SIGN_LORDS[sign_idx]
            wealth_lords[house] = lord

        # Check if 2nd and 11th lords are together
        lord_2 = wealth_lords.get(2)
        lord_11 = wealth_lords.get(11)

        if lord_2 and lord_11:
            house_2 = planet_houses.get(lord_2, 0)
            house_11 = planet_houses.get(lord_11, 0)

            if house_2 == house_11 and house_2 > 0:
                yogas.append(Yoga(
                    name="Dhana Yoga",
                    name_sanskrit="Dhana Yoga",
                    yoga_type="dhana",
                    planets_involved=[lord_2, lord_11],
                    houses_involved=[house_2],
                    is_benefic=True,
                    strength="strong",
                    description=f"2nd lord ({lord_2.title()}) and 11th lord ({lord_11.title()}) together in house {house_2}",
                    effects="Wealth accumulation, financial gains, prosperity",
                ))

        return yogas

    @classmethod
    def _detect_neecha_bhanga(
        cls,
        planets: Dict[str, PlanetPosition],
        signs: List[str],
    ) -> List[Yoga]:
        """
        Detect Neecha Bhanga Raja Yoga (cancellation of debilitation).

        When a debilitated planet has its debilitation cancelled through
        specific conditions, it can give powerful results.
        """
        yogas = []

        debilitation_signs = {
            "sun": "Libra",
            "moon": "Scorpio",
            "mars": "Cancer",
            "mercury": "Pisces",
            "jupiter": "Capricorn",
            "venus": "Virgo",
            "saturn": "Aries",
        }

        cancellation_lords = {
            "sun": "venus",      # Libra lord
            "moon": "mars",      # Scorpio lord
            "mars": "moon",      # Cancer lord
            "mercury": "jupiter", # Pisces lord
            "jupiter": "saturn", # Capricorn lord
            "venus": "mercury",  # Virgo lord
            "saturn": "mars",    # Aries lord
        }

        for planet, debil_sign in debilitation_signs.items():
            if planet not in planets:
                continue

            pos = planets[planet]
            if pos.sign != debil_sign:
                continue

            # Planet is debilitated - check for cancellation
            cancel_lord = cancellation_lords[planet]
            if cancel_lord not in planets:
                continue

            cancel_pos = planets[cancel_lord]
            cancel_sign_idx = signs.index(cancel_pos.sign) if cancel_pos.sign in signs else 0

            # Cancellation if lord of debilitation sign is in Kendra from Lagna or Moon
            # Simplified: just check if cancellation lord is strong
            if cancel_pos.dignity in ["exalted", "own_sign", "moolatrikona"]:
                yogas.append(Yoga(
                    name="Neecha Bhanga Raja Yoga",
                    name_sanskrit="Neecha Bhanga Raja Yoga",
                    yoga_type="raja",
                    planets_involved=[planet, cancel_lord],
                    houses_involved=[],
                    is_benefic=True,
                    strength="moderate",
                    description=f"{planet.title()} debilitated in {debil_sign}, cancelled by strong {cancel_lord.title()}",
                    effects="Rise after initial struggles, transformation of weakness into strength",
                ))

        return yogas

    @classmethod
    def _detect_gajakesari(cls, planet_houses: Dict[str, int]) -> List[Yoga]:
        """
        Detect Gaja Kesari Yoga.

        Forms when Jupiter is in Kendra from Moon.
        """
        yogas = []

        moon_house = planet_houses.get("moon", 0)
        jupiter_house = planet_houses.get("jupiter", 0)

        if moon_house == 0 or jupiter_house == 0:
            return yogas

        # Calculate Jupiter's house from Moon
        jup_from_moon = ((jupiter_house - moon_house) % 12) + 1

        if jup_from_moon in cls.KENDRAS:
            yogas.append(Yoga(
                name="Gaja Kesari Yoga",
                name_sanskrit="Gaja Kesari",
                yoga_type="raja",
                planets_involved=["moon", "jupiter"],
                houses_involved=[moon_house, jupiter_house],
                is_benefic=True,
                strength="strong",
                description=f"Jupiter in {jup_from_moon}th house from Moon",
                effects="Fame, wisdom, respected position, good fortune and long life",
            ))

        return yogas

    @classmethod
    def _detect_budhaditya(
        cls,
        planet_houses: Dict[str, int],
        planets: Dict[str, PlanetPosition],
    ) -> List[Yoga]:
        """
        Detect Budhaditya Yoga.

        Forms when Sun and Mercury are conjunct (same house).
        """
        yogas = []

        sun_house = planet_houses.get("sun", 0)
        mercury_house = planet_houses.get("mercury", 0)

        if sun_house == mercury_house and sun_house > 0:
            # Check Mercury is not combust (too close to Sun)
            mercury_pos = planets.get("mercury")
            is_combust = mercury_pos and mercury_pos.is_combust

            strength = "weak" if is_combust else "strong"

            yogas.append(Yoga(
                name="Budhaditya Yoga",
                name_sanskrit="Budhaditya",
                yoga_type="raja",
                planets_involved=["sun", "mercury"],
                houses_involved=[sun_house],
                is_benefic=True,
                strength=strength,
                description=f"Sun and Mercury together in house {sun_house}",
                effects="Intelligence, analytical ability, success in education and communication",
            ))

        return yogas


# =============================================================================
# TRANSIT ASPECTS
# =============================================================================

class TransitAnalyzer:
    """
    Analyzes transit aspects to natal planets.

    Provides insights on how current planetary positions
    are affecting the natal chart.
    """

    # Major transit planets (slower moving = more significant)
    MAJOR_TRANSITS = ["saturn", "jupiter", "rahu", "ketu"]
    MODERATE_TRANSITS = ["mars", "sun"]
    MINOR_TRANSITS = ["venus", "mercury", "moon"]

    # Significant aspect orbs for transits
    TRANSIT_ORBS = {
        "conjunction": 8,
        "opposition": 8,
        "trine": 6,
        "square": 6,
        "sextile": 4,
    }

    @classmethod
    def analyze_transits(
        cls,
        natal_planets: Dict[str, PlanetPosition],
        transit_planets: Dict[str, PlanetPosition],
        signs: List[str],
    ) -> List[TransitAspect]:
        """
        Analyze current transits aspecting natal planets.

        Args:
            natal_planets: Birth chart planet positions
            transit_planets: Current transit positions
            signs: List of zodiac signs

        Returns:
            List of TransitAspect objects
        """
        aspects = []

        # Calculate longitudes
        def get_longitude(pos: PlanetPosition) -> float:
            sign_idx = signs.index(pos.sign) if pos.sign in signs else 0
            return sign_idx * 30 + pos.degree

        natal_longs = {p: get_longitude(pos) for p, pos in natal_planets.items()}
        transit_longs = {p: get_longitude(pos) for p, pos in transit_planets.items()}

        for transit_planet, transit_long in transit_longs.items():
            transit_pos = transit_planets[transit_planet]

            for natal_planet, natal_long in natal_longs.items():
                natal_pos = natal_planets[natal_planet]

                aspect = cls._check_transit_aspect(
                    transit_planet, transit_pos, transit_long,
                    natal_planet, natal_pos, natal_long,
                )

                if aspect:
                    aspects.append(aspect)

        # Sort by significance
        significance_order = {"major": 0, "moderate": 1, "minor": 2}
        aspects.sort(key=lambda a: significance_order.get(a.significance, 3))

        return aspects

    @classmethod
    def _check_transit_aspect(
        cls,
        transit_planet: str,
        transit_pos: PlanetPosition,
        transit_long: float,
        natal_planet: str,
        natal_pos: PlanetPosition,
        natal_long: float,
    ) -> Optional[TransitAspect]:
        """Check if transit planet aspects natal planet."""
        diff = abs(transit_long - natal_long)
        if diff > 180:
            diff = 360 - diff

        aspect_type = None
        orb = 0

        # Check each aspect type
        if diff <= cls.TRANSIT_ORBS["conjunction"]:
            aspect_type = "conjunction"
            orb = diff
        elif abs(diff - 180) <= cls.TRANSIT_ORBS["opposition"]:
            aspect_type = "opposition"
            orb = abs(diff - 180)
        elif abs(diff - 120) <= cls.TRANSIT_ORBS["trine"]:
            aspect_type = "trine"
            orb = abs(diff - 120)
        elif abs(diff - 90) <= cls.TRANSIT_ORBS["square"]:
            aspect_type = "square"
            orb = abs(diff - 90)
        elif abs(diff - 60) <= cls.TRANSIT_ORBS["sextile"]:
            aspect_type = "sextile"
            orb = abs(diff - 60)

        if not aspect_type:
            return None

        # Determine significance
        if transit_planet in cls.MAJOR_TRANSITS:
            significance = "major"
        elif transit_planet in cls.MODERATE_TRANSITS:
            significance = "moderate"
        else:
            significance = "minor"

        # Is aspect applying or separating?
        is_applying = orb < 2  # Simplified: close orb = applying

        return TransitAspect(
            transit_planet=transit_planet,
            natal_planet=natal_planet,
            aspect_type=aspect_type,
            transit_sign=transit_pos.sign,
            natal_sign=natal_pos.sign,
            orb=round(orb, 2),
            is_applying=is_applying,
            significance=significance,
            interpretation=cls._get_transit_interpretation(
                transit_planet, natal_planet, aspect_type, significance
            ),
        )

    @classmethod
    def _get_transit_interpretation(
        cls,
        transit_planet: str,
        natal_planet: str,
        aspect_type: str,
        significance: str,
    ) -> str:
        """Generate interpretation for a transit aspect."""
        tp = transit_planet.title()
        np = natal_planet.title()

        aspect_meanings = {
            "conjunction": "merging with",
            "opposition": "opposing",
            "trine": "harmoniously supporting",
            "square": "challenging",
            "sextile": "mildly supporting",
        }

        action = aspect_meanings.get(aspect_type, "aspecting")

        planet_themes = {
            "saturn": "discipline, responsibility, and karmic lessons",
            "jupiter": "expansion, opportunities, and growth",
            "mars": "energy, action, and drive",
            "sun": "identity, vitality, and purpose",
            "moon": "emotions, intuition, and habits",
            "mercury": "communication, thinking, and learning",
            "venus": "relationships, values, and pleasure",
            "rahu": "worldly desires and unconventional paths",
            "ketu": "spirituality and letting go",
        }

        theme = planet_themes.get(transit_planet, "cosmic energy")

        if significance == "major":
            prefix = "Significant transit: "
        elif significance == "moderate":
            prefix = "Notable transit: "
        else:
            prefix = "Transit: "

        return f"{prefix}{tp} {action} your natal {np}, bringing themes of {theme}"
