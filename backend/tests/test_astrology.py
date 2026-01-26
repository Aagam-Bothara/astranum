"""Tests for Astrology Engine - Sidereal/Vedic calculations."""

from datetime import date, time
import pytest

from app.engines.astrology import AstrologyEngine, GeoLocation, ZodiacSystem


class TestNakshatraCalculation:
    """Test Moon Nakshatra calculations."""

    def test_nakshatra_ashwini(self):
        """0-13.33 degrees should be Ashwini."""
        nakshatra, pada = AstrologyEngine._calculate_nakshatra(0.0)
        assert nakshatra == "Ashwini"
        assert pada == 1

    def test_nakshatra_bharani(self):
        """13.33-26.66 degrees should be Bharani."""
        nakshatra, pada = AstrologyEngine._calculate_nakshatra(15.0)
        assert nakshatra == "Bharani"

    def test_nakshatra_revati(self):
        """Last nakshatra (346.67-360 degrees)."""
        nakshatra, pada = AstrologyEngine._calculate_nakshatra(355.0)
        assert nakshatra == "Revati"

    def test_nakshatra_pada_calculation(self):
        """Test pada (quarter) calculation."""
        # Each nakshatra = 13.33 degrees
        # Each pada = 3.33 degrees

        # First pada (0-3.33 degrees of nakshatra)
        _, pada = AstrologyEngine._calculate_nakshatra(1.0)
        assert pada == 1

        # Second pada (3.33-6.66 degrees)
        _, pada = AstrologyEngine._calculate_nakshatra(5.0)
        assert pada == 2

        # Third pada (6.66-10 degrees)
        _, pada = AstrologyEngine._calculate_nakshatra(8.0)
        assert pada == 3

        # Fourth pada (10-13.33 degrees)
        _, pada = AstrologyEngine._calculate_nakshatra(12.0)
        assert pada == 4

    def test_nakshatra_uses_absolute_longitude(self):
        """Nakshatra calculation needs full 0-360 longitude, not sign degree."""
        # Moon at 45 degrees absolute (15 degrees Taurus)
        # Should be in 4th nakshatra (Rohini starts at 40 degrees)
        nakshatra, _ = AstrologyEngine._calculate_nakshatra(45.0)
        assert nakshatra == "Rohini"

    def test_all_27_nakshatras_accessible(self):
        """Verify all 27 nakshatras can be computed."""
        nakshatras_found = set()
        for i in range(27):
            # Test middle of each nakshatra
            degree = (i * (360/27)) + 5
            nakshatra, _ = AstrologyEngine._calculate_nakshatra(degree)
            nakshatras_found.add(nakshatra)

        assert len(nakshatras_found) == 27
        assert nakshatras_found == set(AstrologyEngine.NAKSHATRAS)


class TestLongitudeToPosition:
    """Test conversion from longitude to sign/degree."""

    def test_aries(self):
        """0-30 degrees = Aries."""
        pos = AstrologyEngine._longitude_to_position(15.0)
        assert pos.sign == "Aries"
        assert pos.degree == 15.0

    def test_taurus(self):
        """30-60 degrees = Taurus."""
        pos = AstrologyEngine._longitude_to_position(45.0)
        assert pos.sign == "Taurus"
        assert pos.degree == 15.0

    def test_pisces(self):
        """330-360 degrees = Pisces."""
        pos = AstrologyEngine._longitude_to_position(345.0)
        assert pos.sign == "Pisces"
        assert pos.degree == 15.0

    def test_degree_wrapping(self):
        """Degree should be 0-30 within sign."""
        pos = AstrologyEngine._longitude_to_position(61.5)
        assert pos.sign == "Gemini"  # 60-90
        assert pos.degree == 1.5  # 61.5 - 60

    def test_boundary_cases(self):
        """Test sign boundaries."""
        # Exactly at boundary
        pos = AstrologyEngine._longitude_to_position(30.0)
        assert pos.sign == "Taurus"  # 30 is start of Taurus
        assert pos.degree == 0.0

        # Just before boundary
        pos = AstrologyEngine._longitude_to_position(29.99)
        assert pos.sign == "Aries"


class TestZodiacConstants:
    """Test zodiac sign constants."""

    def test_12_signs(self):
        """Should have exactly 12 signs."""
        assert len(AstrologyEngine.SIGNS) == 12

    def test_signs_order(self):
        """Signs should be in correct order."""
        assert AstrologyEngine.SIGNS[0] == "Aries"
        assert AstrologyEngine.SIGNS[6] == "Libra"
        assert AstrologyEngine.SIGNS[11] == "Pisces"

    def test_hindi_signs_match(self):
        """Hindi sign names should match English order."""
        assert len(AstrologyEngine.SIGNS_HINDI) == 12
        assert AstrologyEngine.SIGNS_HINDI[0] == "Mesha"  # Aries


class TestPlanetConstants:
    """Test planet configuration."""

    def test_vedic_planets(self):
        """Should have all 7 traditional Vedic planets + Rahu."""
        required = {"sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "rahu"}
        assert required.issubset(set(AstrologyEngine.PLANETS.keys()))

    def test_ketu_calculated(self):
        """Ketu is calculated as Rahu + 180, not from ephemeris."""
        assert "ketu" not in AstrologyEngine.PLANETS
        # Ketu should be in fallback results
        result = AstrologyEngine._compute_fallback(date(2000, 1, 1), None)
        assert "ketu" in result.planets


class TestFallbackCalculations:
    """Test fallback when Swiss Ephemeris not available."""

    def test_fallback_returns_sun_sign(self):
        """Fallback should at least return approximate sun sign."""
        # April 15 = Aries (Tropical)
        result = AstrologyEngine._compute_fallback(date(2000, 4, 15), None)
        assert result.sun_sign.sign == "Aries"

    def test_fallback_computes_approximate_moon(self):
        """Fallback should compute an approximate moon sign using astronomical algorithms."""
        result = AstrologyEngine._compute_fallback(date(2000, 1, 1), None)
        # Moon sign should be a valid zodiac sign (computed via algorithms)
        assert result.moon_sign.sign in [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]

    def test_fallback_no_houses_without_time(self):
        """Fallback without time should have no houses."""
        result = AstrologyEngine._compute_fallback(date(2000, 1, 1), None)
        assert result.houses is None
        assert result.ascendant is None

    def test_fallback_tracks_birth_time(self):
        """Fallback should track whether birth time was provided."""
        without_time = AstrologyEngine._compute_fallback(date(2000, 1, 1), None)
        with_time = AstrologyEngine._compute_fallback(date(2000, 1, 1), time(12, 0))

        assert without_time.has_birth_time is False
        assert with_time.has_birth_time is True


class TestSimpleSunSign:
    """Test tropical sun sign calculation (fallback)."""

    @pytest.mark.parametrize("month,day,expected", [
        (3, 21, "Aries"),      # Aries starts ~March 21
        (4, 15, "Aries"),
        (4, 20, "Taurus"),     # Taurus starts ~April 20
        (6, 21, "Cancer"),     # Cancer starts ~June 21
        (12, 25, "Capricorn"), # Capricorn
        (1, 15, "Capricorn"),
        (2, 20, "Pisces"),     # Pisces
    ])
    def test_tropical_sun_signs(self, month, day, expected):
        """Verify tropical sun sign date ranges."""
        result = AstrologyEngine._simple_sun_sign(date(2000, month, day))
        assert result == expected


class TestGeoLocation:
    """Test GeoLocation handling."""

    def test_geolocation_creation(self):
        """GeoLocation should store lat/long/timezone."""
        # New Delhi
        loc = GeoLocation(latitude=28.6139, longitude=77.2090, timezone_offset=5.5)
        assert loc.latitude == 28.6139
        assert loc.longitude == 77.2090
        assert loc.timezone_offset == 5.5


class TestZodiacSystem:
    """Test zodiac system enum."""

    def test_sidereal_default(self):
        """Sidereal should be available."""
        assert ZodiacSystem.SIDEREAL == "sidereal"

    def test_tropical_available(self):
        """Tropical should be available."""
        assert ZodiacSystem.TROPICAL == "tropical"


class TestAyanamsaConstants:
    """Test Ayanamsa constants for sidereal calculation."""

    def test_lahiri_available(self):
        """Lahiri ayanamsa (most common in India) should be available."""
        assert hasattr(AstrologyEngine, 'AYANAMSA_LAHIRI')
        assert AstrologyEngine.AYANAMSA_LAHIRI == 1

    def test_kp_available(self):
        """KP (Krishnamurti) ayanamsa should be available."""
        assert hasattr(AstrologyEngine, 'AYANAMSA_KP')


class TestNakshatraLords:
    """Test Nakshatra lord mapping (for future Dasha feature)."""

    def test_27_nakshatra_lords(self):
        """Should have 27 nakshatra lords."""
        assert len(AstrologyEngine.NAKSHATRA_LORDS) == 27

    def test_vimshottari_order(self):
        """Nakshatra lords should follow Vimshottari Dasha order."""
        # Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury (repeating)
        assert AstrologyEngine.NAKSHATRA_LORDS[0] == "Ketu"   # Ashwini
        assert AstrologyEngine.NAKSHATRA_LORDS[1] == "Venus"  # Bharani
        assert AstrologyEngine.NAKSHATRA_LORDS[2] == "Sun"    # Krittika
