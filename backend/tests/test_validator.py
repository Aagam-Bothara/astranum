"""Tests for Guidance Validator - ensuring no hallucinations."""

import pytest

from app.validators.guidance_validator import GuidanceValidator, ValidationContext
from app.schemas.chart import NumerologyData, AstrologyData, PlanetPosition


@pytest.fixture
def sample_numerology():
    """Sample numerology data for testing."""
    return NumerologyData(
        life_path=7,
        destiny_number=3,
        soul_urge=5,
        personality=8,
        birth_day=15,
        name_used="Test User",
    )


@pytest.fixture
def sample_astrology():
    """Sample astrology data for testing."""
    return AstrologyData(
        sun_sign=PlanetPosition(sign="Aries", degree=15.5),
        moon_sign=PlanetPosition(sign="Cancer", degree=22.3),
        ascendant=PlanetPosition(sign="Leo", degree=5.2),
        planets={
            "mercury": PlanetPosition(sign="Pisces", degree=28.1),
            "venus": PlanetPosition(sign="Taurus", degree=10.0),
            "mars": PlanetPosition(sign="Gemini", degree=18.5),
        },
        moon_nakshatra="Pushya",
        houses=None,
        has_birth_time=True,
    )


@pytest.fixture
def validation_context(sample_numerology, sample_astrology):
    """Full validation context."""
    return ValidationContext(
        numerology_data=sample_numerology,
        astrology_data=sample_astrology,
        user_question="What does my chart say about my career?",
    )


class TestPredictionBlocking:
    """Test that predictions are blocked."""

    def test_blocks_will_definitely(self, validation_context):
        """'will definitely' should be blocked."""
        response = "Your career will definitely improve next month."
        result = GuidanceValidator.validate(response, validation_context)
        assert not result.passed
        assert any("prediction" in issue.lower() for issue in result.issues)

    def test_blocks_guaranteed(self, validation_context):
        """'guaranteed' should be blocked."""
        response = "Success is guaranteed based on your chart."
        result = GuidanceValidator.validate(response, validation_context)
        assert not result.passed

    def test_allows_suggests(self, validation_context):
        """'suggests' language should be allowed."""
        response = "Your Aries Sun suggests a tendency towards leadership roles. Consider exploring this."
        result = GuidanceValidator.validate(response, validation_context)
        assert result.passed or "prediction" not in str(result.issues)

    def test_allows_may(self, validation_context):
        """'may' language should be allowed."""
        response = "You may find that your life path 7 indicates a natural curiosity. Consider exploring."
        result = GuidanceValidator.validate(response, validation_context)
        # Should pass or at least not fail on prediction
        assert "prediction" not in str(result.issues).lower()


class TestInventedDataBlocking:
    """Test that invented astrological/numerological data is blocked."""

    def test_blocks_wrong_sign(self, validation_context):
        """Mentioning a sign not in the chart should be flagged."""
        # User has Aries Sun, but response claims Scorpio
        response = "Your Scorpio energy drives your ambitions. Consider this tendency."
        result = GuidanceValidator.validate(response, validation_context)
        # Should flag Scorpio as not in chart
        assert not result.passed or "Scorpio" in str(result.issues)

    def test_allows_correct_sign(self, validation_context):
        """Mentioning the user's actual sign should be allowed."""
        response = "Your Aries Sun suggests natural leadership tendencies. Consider how this may manifest."
        result = GuidanceValidator.validate(response, validation_context)
        # Should not flag Aries
        assert "Aries" not in str(result.issues)

    def test_blocks_wrong_life_path(self, validation_context):
        """Claiming wrong life path number should be blocked."""
        # User has life path 7, but response claims 9
        response = "Your life path 9 indicates humanitarian tendencies. Consider this."
        result = GuidanceValidator.validate(response, validation_context)
        assert not result.passed
        assert any("life path" in issue.lower() for issue in result.issues)

    def test_allows_correct_life_path(self, validation_context):
        """Correct life path reference should be allowed."""
        response = "Your life path 7 suggests a contemplative nature. Consider exploring this."
        result = GuidanceValidator.validate(response, validation_context)
        # Should not flag life path
        assert not any("life path" in issue.lower() for issue in result.issues)


class TestMedicalLegalBlocking:
    """Test that medical/legal advice is blocked."""

    def test_blocks_medical_diagnosis(self, validation_context):
        """Medical diagnoses should be blocked."""
        response = "You have anxiety based on your Moon placement. Consider meditation."
        result = GuidanceValidator.validate(response, validation_context)
        # Should flag medical language
        assert not result.passed or "medical" in str(result.issues).lower()

    def test_blocks_medication_advice(self, validation_context):
        """Medication advice should be blocked."""
        response = "You should stop taking your medication based on the stars. Consider this."
        result = GuidanceValidator.validate(response, validation_context)
        assert not result.passed

    def test_blocks_legal_advice(self, validation_context):
        """Legal advice should be blocked."""
        response = "This is legal based on your chart. Consider proceeding."
        result = GuidanceValidator.validate(response, validation_context)
        # Should flag legal language
        assert not result.passed or "legal" in str(result.issues).lower()


class TestFearLanguageBlocking:
    """Test that fear-based language is blocked."""

    def test_blocks_doom(self, validation_context):
        """'doom' language should be blocked."""
        response = "Your chart shows doom approaching. Consider being careful."
        result = GuidanceValidator.validate(response, validation_context)
        assert not result.passed

    def test_blocks_cursed(self, validation_context):
        """'cursed' language should be blocked."""
        response = "You may be cursed based on your chart. Consider a remedy."
        result = GuidanceValidator.validate(response, validation_context)
        assert not result.passed

    def test_allows_mindful_caution(self, validation_context):
        """Gentle caution should be allowed."""
        response = "Your Aries Sun suggests being mindful of impulsiveness. Consider pausing before decisions."
        result = GuidanceValidator.validate(response, validation_context)
        # Should pass - this is appropriate guidance
        assert "fear" not in str(result.issues).lower()


class TestGuidanceLanguageRequirement:
    """Test that responses must use guidance language."""

    def test_requires_guidance_language(self, validation_context):
        """Response should have tentative/guidance language."""
        # Response without any guidance words
        response = "Aries Sun. Cancer Moon. Life path 7."
        result = GuidanceValidator.validate(response, validation_context)
        assert any("guidance language" in issue.lower() for issue in result.issues)

    def test_passes_with_guidance_language(self, validation_context):
        """Response with guidance language should pass this check."""
        response = "Your chart suggests certain tendencies that may be worth exploring."
        result = GuidanceValidator.validate(response, validation_context)
        assert not any("guidance language" in issue.lower() for issue in result.issues)


class TestNoAstrologyData:
    """Test validation when no astrology data is provided (numerology only)."""

    def test_blocks_sign_claims_without_data(self, sample_numerology):
        """Should block sign claims when no astrology data."""
        context = ValidationContext(
            numerology_data=sample_numerology,
            astrology_data=None,
            user_question="Tell me about my career",
        )
        response = "Your Aries Sun suggests leadership. Consider this path."
        result = GuidanceValidator.validate(response, context)
        assert not result.passed
        assert any("Aries" in issue for issue in result.issues)


class TestSafeFallback:
    """Test safe fallback responses."""

    def test_prediction_fallback(self):
        """Test fallback for prediction violations."""
        fallback = GuidanceValidator.get_safe_fallback("prediction")
        assert "patterns" in fallback.lower()
        assert "predict" not in fallback.lower()

    def test_medical_fallback(self):
        """Test fallback for medical violations."""
        fallback = GuidanceValidator.get_safe_fallback("medical")
        assert "healthcare professional" in fallback.lower()

    def test_default_fallback(self):
        """Test default fallback."""
        fallback = GuidanceValidator.get_safe_fallback("unknown")
        assert len(fallback) > 0
        assert "agency" in fallback.lower() or "rephrase" in fallback.lower()
