"""
Guidance Response Validator - The hallucination prevention layer.

This is CRITICAL for AstraVaani's integrity.
The validator ensures LLM responses only reference computed data.
"""

import re
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

from app.schemas.guidance import ValidationResult
from app.schemas.chart import NumerologyData, AstrologyData


@dataclass
class ValidationContext:
    """Context for validation - what data the LLM was given."""
    numerology_data: Optional[NumerologyData]
    astrology_data: Optional[AstrologyData]
    user_question: str


class GuidanceValidator:
    """
    Validates LLM responses against computed chart data.

    Blocks:
    - Invented signs / degrees
    - Guarantees and certainty statements
    - Medical / legal advice
    - Emotional dependency language
    - Predictions (future certainty)
    """

    # Signs that can be mentioned (only if in chart)
    VALID_SIGNS = {
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    }

    # Patterns that indicate hallucination or violation
    FORBIDDEN_PATTERNS = [
        # Predictions / Certainty
        (r'\bwill definitely\b', "prediction"),
        (r'\bwill certainly\b', "prediction"),
        (r'\bis guaranteed\b', "prediction"),
        (r'\byou will\b(?!.*consider|\s*find|\s*discover|\s*notice)', "prediction"),
        (r'\bthis will happen\b', "prediction"),
        (r'\byour future (is|will be)\b', "prediction"),
        (r'\bI predict\b', "prediction"),
        (r'\bI foresee\b', "prediction"),

        # Medical / Legal certainty
        (r'\byou (have|suffer from|are diagnosed)\b.*\b(disease|illness|condition)\b', "medical"),
        (r'\byou (have|suffer from)\b.*\b(anxiety|depression|bipolar|schizophrenia|disorder|adhd|ptsd|ocd)\b', "medical"),
        (r'\byou should (stop|start) (taking|medication)\b', "medical"),
        (r'\blegally you (must|should|can)\b', "legal"),
        (r'\bthis is (illegal|legal)\b', "legal"),

        # Fear-based language
        (r'\byou are in danger\b', "fear"),
        (r'\bterrible things\b', "fear"),
        (r'\bdoom\b', "fear"),
        (r'\bcursed\b', "fear"),
        (r'\bbad luck will\b', "fear"),

        # Emotional dependency
        (r'\byou need me\b', "dependency"),
        (r'\bonly I can\b', "dependency"),
        (r'\bwithout guidance you\b', "dependency"),
        (r'\bcome back (daily|every day|regularly)\b', "dependency"),

        # Over-specific degree claims (unless matched to chart)
        (r'\b\d+(\.\d+)?\s*degrees?\s*(in|of)\b', "specific_degree"),
    ]

    # Patterns that suggest guidance (GOOD)
    GUIDANCE_PATTERNS = [
        r'\bconsider\b',
        r'\bmay\b',
        r'\bcould\b',
        r'\bsuggests?\b',
        r'\bindicates?\b',
        r'\btend(s)? to\b',
        r'\binclined\b',
        r'\bpatterns? (show|suggest|indicate)\b',
    ]

    @classmethod
    def validate(
        cls,
        response_text: str,
        context: ValidationContext,
    ) -> ValidationResult:
        """
        Validate an LLM response against the chart data and rules.

        Args:
            response_text: The LLM's generated response
            context: The chart data that was provided to the LLM

        Returns:
            ValidationResult indicating if response is valid
        """
        issues = []

        # Check for forbidden patterns
        pattern_issues = cls._check_forbidden_patterns(response_text)
        issues.extend(pattern_issues)

        # Check for invented astrological data
        astro_issues = cls._check_astrology_claims(response_text, context.astrology_data)
        issues.extend(astro_issues)

        # Check for invented numerology data
        num_issues = cls._check_numerology_claims(response_text, context.numerology_data)
        issues.extend(num_issues)

        # Check for guidance language (should have some)
        if not cls._has_guidance_language(response_text):
            issues.append("Response lacks tentative/guidance language")

        return ValidationResult(
            passed=len(issues) == 0,
            issues=issues,
            was_regenerated=False,
        )

    @classmethod
    def _check_forbidden_patterns(cls, text: str) -> List[str]:
        """Check for forbidden patterns in response."""
        issues = []
        text_lower = text.lower()

        for pattern, violation_type in cls.FORBIDDEN_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                issues.append(f"Contains {violation_type} language: pattern '{pattern}'")

        return issues

    @classmethod
    def _check_astrology_claims(
        cls,
        text: str,
        astrology_data: Optional[AstrologyData],
    ) -> List[str]:
        """Check that astrological claims match the chart data."""
        issues = []

        if astrology_data is None:
            # If no astrology data, shouldn't mention specific signs
            for sign in cls.VALID_SIGNS:
                # Allow generic mentions, block specific claims
                pattern = rf'\byour\b.*\b{sign}\b'
                if re.search(pattern, text, re.IGNORECASE):
                    issues.append(f"Claims '{sign}' without astrology data")
            return issues

        # Extract signs mentioned in response
        mentioned_signs = cls._extract_mentioned_signs(text)

        # Get valid signs from chart
        valid_signs_in_chart = set()
        valid_signs_in_chart.add(astrology_data.sun_sign.sign)
        valid_signs_in_chart.add(astrology_data.moon_sign.sign)
        if astrology_data.ascendant:
            valid_signs_in_chart.add(astrology_data.ascendant.sign)
        for planet_pos in astrology_data.planets.values():
            valid_signs_in_chart.add(planet_pos.sign)

        # Check for invented signs (claimed but not in chart)
        for sign, claim_context in mentioned_signs:
            if sign not in valid_signs_in_chart:
                # Allow if it's clearly about transits or general info
                if "transit" not in claim_context.lower() and "general" not in claim_context.lower():
                    issues.append(f"Mentions '{sign}' which is not in user's chart")

        return issues

    @classmethod
    def _check_numerology_claims(
        cls,
        text: str,
        numerology_data: Optional[NumerologyData],
    ) -> List[str]:
        """Check that numerology claims match the data."""
        issues = []

        if numerology_data is None:
            # Check if specific numbers are claimed
            patterns = [
                r'\blife path\s*(\d+)\b',
                r'\bdestiny number\s*(\d+)\b',
                r'\bsoul urge\s*(\d+)\b',
            ]
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    issues.append("Claims numerology numbers without data")
            return issues

        # Verify specific number claims
        life_path_match = re.search(r'\blife path\s*(\d+)\b', text, re.IGNORECASE)
        if life_path_match:
            claimed = int(life_path_match.group(1))
            if claimed != numerology_data.life_path:
                issues.append(
                    f"Claims Life Path {claimed}, actual is {numerology_data.life_path}"
                )

        destiny_match = re.search(r'\bdestiny\s*(?:number)?\s*(\d+)\b', text, re.IGNORECASE)
        if destiny_match:
            claimed = int(destiny_match.group(1))
            if claimed != numerology_data.destiny_number:
                issues.append(
                    f"Claims Destiny {claimed}, actual is {numerology_data.destiny_number}"
                )

        return issues

    @classmethod
    def _extract_mentioned_signs(cls, text: str) -> List[Tuple[str, str]]:
        """Extract zodiac signs mentioned in text with context."""
        mentioned = []
        for sign in cls.VALID_SIGNS:
            pattern = rf'(.{{0,50}}\b{sign}\b.{{0,50}})'
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                mentioned.append((sign, match))
        return mentioned

    @classmethod
    def _has_guidance_language(cls, text: str) -> bool:
        """Check if response uses appropriate guidance language."""
        for pattern in cls.GUIDANCE_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False

    @classmethod
    def get_safe_fallback(cls, issue_type: str) -> str:
        """Get a safe fallback response when validation fails."""
        fallbacks = {
            "prediction": (
                "Based on your chart patterns, there are tendencies that may "
                "be worth exploring. Would you like me to share what the patterns "
                "suggest about possibilities and potentials?"
            ),
            "medical": (
                "I'm not able to provide medical guidance. For health-related "
                "questions, please consult a qualified healthcare professional. "
                "I can share what your chart patterns suggest about general "
                "well-being tendencies."
            ),
            "legal": (
                "I'm not able to provide legal advice. Please consult a qualified "
                "legal professional for such matters."
            ),
            "fear": (
                "Your chart shows certain patterns that are worth being mindful of. "
                "Remember that awareness leads to better choices. Would you like "
                "practical guidance on navigating these patterns?"
            ),
            "default": (
                "Let me rephrase my guidance to focus on what your chart patterns "
                "suggest, while remembering that you have the agency to shape "
                "your path forward."
            ),
        }
        return fallbacks.get(issue_type, fallbacks["default"])
