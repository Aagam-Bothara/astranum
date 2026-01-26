"""Guidance request/response schemas."""

from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.user import GuidanceMode, Language


class GuidanceRequest(BaseModel):
    """Request for guidance (the /ask endpoint)."""

    question: str = Field(min_length=1, max_length=1000)  # Allow short greetings like "hi"
    profile_id: Optional[str] = Field(
        None,
        description="Profile ID to get guidance for. Uses primary profile if not specified."
    )
    mode: Optional[GuidanceMode] = None  # Override user's default mode
    language: Optional[Language] = None  # Override user's default language
    include_context: bool = Field(
        default=True,
        description="Include previous conversation context for continuity (Pro tier only)"
    )


class ValidationResult(BaseModel):
    """Result of response validation."""

    passed: bool
    issues: List[str] = []
    was_regenerated: bool = False


class GuidanceResponse(BaseModel):
    """
    Structured guidance response.

    This follows the AstraVaani output schema:
    - Empathy line
    - Reasons (only from chart data)
    - Direction (actions)
    - Caution (if applicable)
    """

    empathy_line: str = Field(description="Empathetic acknowledgment of the question")
    reasons: List[str] = Field(
        description="Explanations based ONLY on computed chart data"
    )
    direction: str = Field(description="Actionable guidance")
    caution: Optional[str] = Field(
        None, description="Caution or warning if applicable"
    )

    # Metadata
    data_points_used: List[str] = Field(
        description="Which chart data points were referenced"
    )
    validation: Optional[ValidationResult] = Field(
        None, description="Validation result (Pro tier only - Generator + Validator pipeline)"
    )

    # Full response text (combined)
    full_response: str = Field(description="Complete formatted response for display")

    class Config:
        json_schema_extra = {
            "example": {
                "empathy_line": "I understand you're seeking clarity about your career path.",
                "reasons": [
                    "Your Sun in Capricorn suggests a natural inclination towards structured growth.",
                    "With a Life Path 7, you tend to seek deeper meaning in your work.",
                ],
                "direction": "Consider exploring roles that combine analytical thinking with meaningful impact.",
                "caution": "Be mindful of overworking yourself in pursuit of perfection.",
                "data_points_used": ["sun_sign", "life_path"],
                "validation": {"passed": True, "issues": [], "was_regenerated": False},
                "full_response": "I understand you're seeking clarity...",
            }
        }
