"""
Guidance Service - LLM integration with validation.

The LLM is ONLY for explanation and guidance.
It reads computed data, it does not generate astrological/numerological facts.

Tier-specific model configuration:
- Free: Haiku only (~₹0.80/chat)
- Starter (₹99): Sonnet only (~₹2.50/chat)
- Pro (₹699): Sonnet generator + Opus validator (~₹7/chat)

Profile-based context:
- Each profile maintains separate conversation history
- Pro tier includes conversation context for continuity
"""

import json
import re
from typing import Optional, Dict, Any

from app.schemas.guidance import GuidanceRequest, GuidanceResponse, ValidationResult
from app.schemas.chart import ChartSnapshotResponse, NumerologyData, AstrologyData
from app.models.user import GuidanceMode, Language, ResponseStyle
from app.models.subscription import SubscriptionTier
from app.validators.guidance_validator import GuidanceValidator, ValidationContext
from app.core.tier_config import TierConfig, get_tier_config
from app.services.chart_filter_service import ChartFilterService
from app.services.llm_service import LLMService


# Common greetings in multiple languages
GREETINGS = {
    'hi', 'hello', 'hey', 'hola', 'namaste', 'namaskar', 'namaskaram',
    'pranam', 'pranaam', 'sat sri akal', 'jai shri krishna', 'ram ram',
    'good morning', 'good afternoon', 'good evening', 'good night',
    'howdy', 'sup', 'yo', 'hii', 'hiii', 'hiiii', 'helo', 'heya',
    'greetings', 'salaam', 'assalam', 'vanakkam', 'kemon acho',
    'how are you', 'how r u', 'whats up', "what's up", 'wassup', 'wazzup',
    'hows it going', "how's it going", 'how do you do',
}


def is_greeting(text: str) -> bool:
    """Check if the message is a simple greeting."""
    # Normalize text
    normalized = text.lower().strip()
    # Remove punctuation
    normalized = re.sub(r'[^\w\s]', '', normalized)
    # Check if it's a greeting (exact match or starts with greeting)
    words = normalized.split()
    if not words:
        return False
    # Single word greeting
    if len(words) == 1 and words[0] in GREETINGS:
        return True
    # Two word greeting like "good morning"
    if len(words) == 2 and ' '.join(words) in GREETINGS:
        return True
    # Starts with greeting word and is short (< 5 words)
    if words[0] in GREETINGS and len(words) <= 4:
        return True
    return False


def get_greeting_response(name: Optional[str] = None, language: Language = Language.ENGLISH) -> GuidanceResponse:
    """Return a friendly greeting response without chart analysis, respecting language preference."""

    if language == Language.HINDI:
        greeting = "नमस्ते"
        if name:
            greeting = f"नमस्ते, {name}"
        response_text = f"{greeting}! AstraVaani में आपका स्वागत है। 🙏\n\nआज आप क्या जानना चाहेंगे?\n\n• **ज्योतिष** - आपके ग्रहों की स्थिति, गोचर और ब्रह्मांडीय प्रभाव\n• **अंकशास्त्र** - आपका जीवन पथ अंक, भाग्य अंक और व्यक्तिगत चक्र\n• **दोनों** - आपकी पूरी कुंडली का विश्लेषण\n\nअपनी कुंडली के बारे में कुछ भी पूछें!"
        direction = "आज आप अपनी कुंडली के बारे में क्या जानना चाहेंगे?"

    elif language == Language.HINGLISH:
        greeting = "Namaste"
        if name:
            greeting = f"Namaste, {name}"
        response_text = f"{greeting}! AstraVaani mein aapka swagat hai. 🙏\n\nAaj aap kya jaanna chahenge?\n\n• **Astrology** - Aapke planets ki position, transits aur cosmic influences\n• **Numerology** - Aapka life path number, destiny number aur personal cycles\n• **Both** - Aapki complete chart ka analysis\n\nApni chart ke baare mein kuch bhi puchho!"
        direction = "Aaj aap apni chart ke baare mein kya jaanna chahenge?"

    else:  # English (default)
        greeting = "Namaste"
        if name:
            greeting = f"Namaste, {name}"
        response_text = f"{greeting}! Welcome to AstraVaani. 🙏\n\nWhat would you like to explore today?\n\n• **Astrology** - Your planetary positions, transits, and cosmic influences\n• **Numerology** - Your life path, destiny number, and personal cycles\n• **Both** - A combined reading of your complete chart\n\nJust ask me anything about your chart, or tell me what's on your mind!"
        direction = "What would you like to explore about your chart today?"

    return GuidanceResponse(
        empathy_line=f"{greeting}! Welcome to AstraVaani." if language == Language.ENGLISH else greeting,
        reasons=[],
        direction=direction,
        caution=None,
        data_points_used=[],
        validation=None,
        full_response=response_text,
    )


class GuidanceService:
    """
    Orchestrates the guidance flow:
    1. Filter chart data based on tier (critical for preventing feature leakage)
    2. Prepare context from filtered chart data
    3. Call LLM with tier-specific model and system prompt
    4. Validate response (Pro tier only - Generator + Validator pipeline)
    5. Regenerate if needed (Pro only)
    6. Return structured response

    Tier-specific Model Configuration:
    - Free: Haiku only (~₹0.80/chat)
    - Starter (₹99): Sonnet only (~₹2.50/chat)
    - Pro (₹699): Sonnet generator + Opus validator (~₹7/chat)
    """

    # Maximum regeneration attempts (only used for Pro tier with validator)
    MAX_REGENERATION_ATTEMPTS = 2

    def __init__(self):
        """
        Initialize the guidance service.

        Note: LLMService is created per-request based on user's tier.
        """
        pass

    async def get_guidance(
        self,
        request: GuidanceRequest,
        chart: ChartSnapshotResponse,
        language: Language,
        tier: SubscriptionTier = SubscriptionTier.FREE,
        conversation_context: Optional[Dict[str, Any]] = None,
        response_style: ResponseStyle = ResponseStyle.BALANCED,
    ) -> GuidanceResponse:
        """
        Get guidance response for a user question.

        Args:
            request: The guidance request with user's question
            chart: The user's computed chart data
            language: Response language
            tier: User's subscription tier (determines model and features)
            conversation_context: Previous conversation context for continuity (Pro tier)
            response_style: User's preferred response style (supportive, balanced, direct)

        Returns:
            GuidanceResponse (validated for Pro, unvalidated for Free/Starter)
        """
        # Check for simple greetings FIRST - respond without full chart analysis
        if is_greeting(request.question):
            profile_name = None
            if conversation_context:
                profile_name = conversation_context.get("profile_name")
            return get_greeting_response(profile_name, language)

        # Get tier configuration
        tier_config = get_tier_config(tier)

        # Create tier-specific LLM service
        # - Free: Haiku only
        # - Starter: Sonnet only
        # - Pro: Sonnet + Opus validator
        llm_service = LLMService.for_tier(tier_config)

        # Filter chart data based on tier - CRITICAL for preventing feature leakage
        # This ensures the LLM only sees data the user's tier allows
        filtered_chart = ChartFilterService.filter_chart_for_tier(chart, tier)

        # Apply mode-based filtering (astrology only, numerology only, or both)
        mode = request.mode or GuidanceMode.BOTH
        filtered_chart = self._filter_chart_by_mode(filtered_chart, mode)

        # Prepare context for LLM with tier-specific restrictions and conversation history
        system_prompt = self._build_system_prompt(
            filtered_chart, language, tier_config, conversation_context, mode, response_style
        )
        user_message = self._build_user_message(request.question, language)

        # Determine max tokens based on tier
        max_chars = tier_config.response.max_characters
        # If max_characters is 0 (unlimited for paid tiers), use a reasonable default
        if max_chars == 0:
            max_tokens = 2000  # Allow longer responses for paid tiers
        else:
            # Token estimation: 1 token ~= 4 characters on average
            # Add 20% buffer to allow sentence completion (prevents mid-sentence cutoffs)
            base_tokens = max_chars // 4
            completion_buffer = max(base_tokens // 5, 30)  # At least 30 tokens buffer
            max_tokens = min(base_tokens + completion_buffer, 1500)

        # For Pro tier: Use Generator + Validator pipeline
        # For Free/Starter: Generator only (single LLM call)
        if tier_config.response.use_validator:
            return await self._get_guidance_with_validation(
                request, filtered_chart, language, system_prompt, user_message, max_tokens, llm_service
            )
        else:
            return await self._get_guidance_simple(
                request, filtered_chart, system_prompt, user_message, max_tokens, llm_service
            )

    async def _get_guidance_with_validation(
        self,
        request: GuidanceRequest,
        chart: ChartSnapshotResponse,
        language: Language,
        system_prompt: str,
        user_message: str,
        max_tokens: int,
        llm_service: LLMService,
    ) -> GuidanceResponse:
        """
        Pro tier: Sonnet Generator + Opus Validator pipeline.

        Cost breakdown:
        - Generator (Sonnet): ~₹2.50
        - Validator (Opus): ~₹4.50
        - Total: ~₹7 per chat

        Opus is the most capable model for catching subtle hallucinations.
        """
        attempts = 0
        validation_result = None
        was_regenerated = False

        # Prepare chart data for validation
        chart_data = {
            "numerology": chart.numerology_data,
            "astrology": chart.astrology_data,
            "transits": chart.transit_data,
        }

        while attempts < self.MAX_REGENERATION_ATTEMPTS:
            attempts += 1

            # Call LLM Generator (Sonnet for Pro tier)
            raw_response = await self._call_llm(system_prompt, user_message, max_tokens, llm_service)

            # Parse response
            parsed = self._parse_response(raw_response)

            # Validate using Opus (Pro tier's validator)
            llm_validation = await llm_service.validate_response(
                response=parsed["full_response"],
                chart_data=chart_data,
                user_question=request.question,
            )

            # Convert to ValidationResult
            validation_result = ValidationResult(
                passed=llm_validation.get("passed", True),
                issues=llm_validation.get("issues", []),
                was_regenerated=was_regenerated,
            )

            if validation_result.passed:
                break

            # If failed, modify prompt for regeneration
            was_regenerated = True
            user_message = self._build_regeneration_prompt(
                request.question,
                validation_result.issues,
                language,
            )

        # If still failing after attempts, use safe fallback
        if not validation_result.passed:
            parsed = self._get_safe_response(validation_result.issues)
            validation_result.was_regenerated = True

        return GuidanceResponse(
            empathy_line=parsed.get("empathy_line", ""),
            reasons=parsed.get("reasons", []),
            direction=parsed.get("direction", ""),
            caution=parsed.get("caution"),
            data_points_used=parsed.get("data_points_used", []),
            validation=validation_result,
            full_response=parsed.get("full_response", ""),
        )

    async def _get_guidance_simple(
        self,
        request: GuidanceRequest,
        chart: ChartSnapshotResponse,
        system_prompt: str,
        user_message: str,
        max_tokens: int,
        llm_service: LLMService,
    ) -> GuidanceResponse:
        """
        Free/Starter tier: Generator only (no validation).

        Cost:
        - Free: ~₹0.80 per chat (Haiku)
        - Starter: ~₹2.50 per chat (Sonnet)

        Response quality relies on system prompt restrictions.
        """
        # Single LLM call - no validation loop
        raw_response = await self._call_llm(system_prompt, user_message, max_tokens, llm_service)

        # Parse response
        parsed = self._parse_response(raw_response)

        # No validation for non-Pro tiers
        return GuidanceResponse(
            empathy_line=parsed.get("empathy_line", ""),
            reasons=parsed.get("reasons", []),
            direction=parsed.get("direction", ""),
            caution=parsed.get("caution"),
            data_points_used=parsed.get("data_points_used", []),
            validation=None,  # No validation for Free/Starter
            full_response=parsed.get("full_response", ""),
        )

    def _build_chart_data_summary(self, chart: ChartSnapshotResponse) -> str:
        """
        Build an explicit, human-readable summary of the chart data.
        This helps prevent LLM hallucination by making available data crystal clear.
        """
        # Helper to safely get attribute/dict value
        def get_val(obj, key, default=None):
            if obj is None:
                return default
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)

        lines = []
        lines.append("=" * 50)
        lines.append("VERIFIED CHART DATA - USE ONLY THESE VALUES")
        lines.append("=" * 50)

        # Astrology data
        astro = chart.astrology_data
        if astro:
            lines.append("\n## ASTROLOGY (Verified Calculations):")

            # Sun
            sun_sign = get_val(astro, 'sun_sign')
            if sun_sign:
                sign = get_val(sun_sign, 'sign')
                degree = get_val(sun_sign, 'degree', 0)
                lines.append(f"   SUN: {sign} at {degree:.2f}°")

            # Moon - CRITICAL
            moon_sign = get_val(astro, 'moon_sign')
            if moon_sign:
                sign = get_val(moon_sign, 'sign')
                degree = get_val(moon_sign, 'degree', 0)
                moon_info = f"   MOON: {sign} at {degree:.2f}°"
                nakshatra = get_val(moon_sign, 'nakshatra')
                if nakshatra:
                    moon_info += f" ({nakshatra} nakshatra"
                    pada = get_val(moon_sign, 'nakshatra_pada')
                    if pada:
                        moon_info += f", pada {pada}"
                    moon_info += ")"
                lines.append(moon_info)

            # Other planets
            planets = get_val(astro, 'planets')
            if planets:
                for planet, pos in planets.items():
                    if planet.lower() not in ['sun', 'moon']:
                        sign = get_val(pos, 'sign')
                        degree = get_val(pos, 'degree', 0)
                        is_retro = get_val(pos, 'is_retrograde', False)
                        retro = " (R)" if is_retro else ""
                        lines.append(f"   {planet.upper()}: {sign} at {degree:.2f}°{retro}")

            # Birth time dependent data
            has_birth_time = get_val(astro, 'has_birth_time', False)
            if has_birth_time:
                ascendant = get_val(astro, 'ascendant')
                if ascendant:
                    sign = get_val(ascendant, 'sign')
                    degree = get_val(ascendant, 'degree', 0)
                    lines.append(f"   ASCENDANT: {sign} at {degree:.2f}°")
                houses = get_val(astro, 'houses')
                if houses:
                    lines.append("   HOUSES: Available (birth time provided)")
            else:
                lines.append("\n   ⚠️ NO BIRTH TIME: Ascendant and houses are NOT available.")
                lines.append("   DO NOT mention houses or ascendant for this chart!")

        else:
            lines.append("\n## ASTROLOGY: Not available for this reading")

        # Numerology data
        num = chart.numerology_data
        if num:
            lines.append("\n## NUMEROLOGY (Verified Calculations):")
            lines.append(f"   LIFE PATH: {get_val(num, 'life_path')}")
            lines.append(f"   DESTINY NUMBER: {get_val(num, 'destiny_number')}")
            lines.append(f"   SOUL URGE: {get_val(num, 'soul_urge')}")
            lines.append(f"   PERSONALITY: {get_val(num, 'personality')}")
            lines.append(f"   BIRTH DAY: {get_val(num, 'birth_day')}")
            personal_year = get_val(num, 'personal_year')
            if personal_year:
                lines.append(f"   PERSONAL YEAR: {personal_year}")
            maturity = get_val(num, 'maturity_number')
            if maturity:
                lines.append(f"   MATURITY NUMBER: {maturity}")
            karmic = get_val(num, 'karmic_debt')
            if karmic:
                lines.append(f"   KARMIC DEBT: {', '.join(map(str, karmic))}")
        else:
            lines.append("\n## NUMEROLOGY: Not available for this reading")

        # Transits
        transit = chart.transit_data
        if transit:
            lines.append("\n## CURRENT TRANSITS (today's planetary positions):")
            lines.append(f"   Date: {get_val(transit, 'date')}")
            planets = get_val(transit, 'planets', {})
            for planet, pos in planets.items():
                sign = get_val(pos, 'sign')
                degree = get_val(pos, 'degree', 0)
                is_retro = get_val(pos, 'is_retrograde', False)
                retro = " (R)" if is_retro else ""
                lines.append(f"   Transit {planet}: {sign} at {degree:.2f}°{retro}")

        lines.append("\n" + "=" * 50)
        lines.append("END OF VERIFIED DATA - DO NOT INVENT ANY OTHER VALUES")
        lines.append("=" * 50)

        return "\n".join(lines)

    def _filter_chart_by_mode(
        self,
        chart: ChartSnapshotResponse,
        mode: GuidanceMode,
    ) -> ChartSnapshotResponse:
        """Filter chart data based on guidance mode selection."""
        from copy import deepcopy

        if mode == GuidanceMode.BOTH:
            return chart  # Return everything

        # Create a copy with filtered data
        filtered = deepcopy(chart)

        if mode == GuidanceMode.ASTROLOGY:
            # Only include astrology data
            filtered.numerology_data = None
        elif mode == GuidanceMode.NUMEROLOGY:
            # Only include numerology data
            filtered.astrology_data = None
            filtered.transit_data = None

        return filtered

    def _build_system_prompt(
        self,
        chart: ChartSnapshotResponse,
        language: Language,
        tier_config: TierConfig,
        conversation_context: Optional[Dict[str, Any]] = None,
        mode: GuidanceMode = GuidanceMode.BOTH,
        response_style: ResponseStyle = ResponseStyle.BALANCED,
    ) -> str:
        """Build the system prompt with chart data, rules, tier restrictions, and conversation context."""

        # Language instruction - CRITICAL: Must be strongly enforced
        lang_instructions = {
            Language.ENGLISH: {
                "main": "**MANDATORY LANGUAGE: ENGLISH ONLY**",
                "detail": "You MUST respond ENTIRELY in English. Do not use any Hindi words, Devanagari script, or Hindi phrases. Every single word must be in English.",
                "example": "Example: 'Your Sun is in Aries, indicating leadership qualities.' NOT 'Aapka Sun Aries mein hai.'",
            },
            Language.HINDI: {
                "main": "**अनिवार्य भाषा: केवल हिंदी**",
                "detail": "आपको पूरी तरह से हिंदी में जवाब देना होगा। देवनागरी लिपि का प्रयोग करें। कोई भी अंग्रेजी शब्द या वाक्य न लिखें।",
                "example": "उदाहरण: 'आपका सूर्य मेष राशि में है, जो नेतृत्व क्षमता दर्शाता है।' 'Your Sun is in Aries' नहीं।",
            },
            Language.HINGLISH: {
                "main": "**MANDATORY LANGUAGE: HINGLISH (Hindi-English Mix)**",
                "detail": "You MUST respond in Hinglish - a natural mix of Hindi and English using ROMAN SCRIPT (Latin alphabet). Mix Hindi and English words naturally as Indians speak. Do NOT use Devanagari script.",
                "example": "Example: 'Aapka Sun Aries mein hai, jo leadership qualities indicate karta hai. Career mein aage badhne ke chances hain.'",
            },
        }
        lang_config = lang_instructions[language]
        lang_instruction = f"""{lang_config['main']}
{lang_config['detail']}
{lang_config['example']}
⚠️ LANGUAGE COMPLIANCE IS MANDATORY - responses in wrong language will be rejected."""

        # Chart data as JSON for LLM reference (already filtered by tier)
        # Use model_dump() to properly serialize Pydantic models to dicts
        def serialize_data(data):
            if data is None:
                return None
            if hasattr(data, 'model_dump'):
                return data.model_dump()
            if isinstance(data, dict):
                return data
            return str(data)

        chart_json = json.dumps({
            "numerology": serialize_data(chart.numerology_data),
            "astrology": serialize_data(chart.astrology_data),
            "transits": serialize_data(chart.transit_data),
        }, indent=2, default=str)

        # Build explicit data summary to prevent hallucination
        data_summary = self._build_chart_data_summary(chart)

        # Get tier-specific restrictions
        tier_restrictions = ChartFilterService.get_tier_prompt_restrictions(tier_config.tier)

        # Explanation section instructions based on tier
        explanation_instruction = ""
        if tier_config.response.include_explanation:
            explanation_instruction = f"""
## EXPLANATION SECTION:
Include a "Why this matters" section with {tier_config.response.explanation_bullets} bullet points explaining the astrological/numerological reasoning behind your guidance.
"""
        else:
            # Free tier - add conciseness instruction to prevent mid-sentence cutoffs
            max_chars = tier_config.response.max_characters
            explanation_instruction = f"""
## RESPONSE LENGTH (CRITICAL):
Your response MUST be concise and under {max_chars} characters.
- Keep your response focused and complete within the limit
- Always finish your sentences - NEVER stop mid-sentence
- Prioritize the most important insight over covering everything
- Use short, impactful sentences
- If you have more to say, end with a complete thought like "For deeper insights, consider upgrading your plan."
DO NOT let your response get cut off mid-sentence!
"""

        # Response style instructions based on user preference
        style_instructions = {
            ResponseStyle.SUPPORTIVE: """
## COMMUNICATION STYLE: SUPPORTIVE & ENCOURAGING
The user prefers a warm, emotionally supportive style. Please:
- Be nurturing, empathetic, and encouraging
- Use warm language and acknowledge their feelings
- Frame challenges as opportunities for growth
- Provide emotional validation alongside practical guidance
- Use phrases like "I understand...", "It's natural to feel...", "This is a wonderful opportunity..."
- Focus on positive aspects while gently mentioning areas for growth
- Be like a supportive friend who believes in them
""",
            ResponseStyle.BALANCED: """
## COMMUNICATION STYLE: BALANCED
The user prefers a balanced mix of warmth and directness. Please:
- Be friendly but also clear and informative
- Acknowledge emotions briefly, then focus on practical insights
- Present both positive and challenging aspects fairly
- Be encouraging without over-promising
""",
            ResponseStyle.DIRECT: """
## COMMUNICATION STYLE: DIRECT & PRECISE
The user prefers a blunt, no-nonsense style. Please:
- Be straightforward and get to the point quickly
- NO sugar-coating or excessive emotional language
- NO emojis or overly warm phrases
- State facts clearly without unnecessary softening
- If there are challenges, state them directly: "Your chart shows X, which indicates Y"
- Skip the empathy phrases - just provide the information
- Be like a professional consultant: precise, factual, actionable
- Use phrases like "Your chart indicates...", "This suggests...", "Focus on..."
- Keep it concise and information-dense
""",
        }
        style_instruction = style_instructions.get(response_style, style_instructions[ResponseStyle.BALANCED])

        # Conversation context section (Pro tier with memory)
        context_section = ""
        if conversation_context:
            profile_name = conversation_context.get("profile_name", "the user")
            relationship = conversation_context.get("relationship", "self")
            recent_topics = conversation_context.get("recent_topics", [])
            key_insights = conversation_context.get("key_insights", [])

            topics_str = "\n".join(f"- {t}" for t in recent_topics[:5]) if recent_topics else "None yet"
            insights_str = "\n".join(f"- {i}" for i in key_insights[:5]) if key_insights else "None yet"

            context_section = f"""
## CONVERSATION CONTEXT (for continuity):
You are providing guidance for **{profile_name}** (relationship: {relationship}).

**Recent topics discussed:**
{topics_str}

**Key insights from previous sessions:**
{insights_str}

Use this context to provide more personalized and consistent guidance. Reference previous insights when relevant, but don't force connections where they don't naturally fit.
"""

        # Mode-specific instructions
        mode_instruction = ""

        # Transit instructions (only if transit data is available)
        transit_instruction = ""
        if chart.transit_data:
            transit_instruction = """
## CURRENT TRANSITS (for timing-based predictions):
Transit data shows where planets are TODAY. Use this for:
- **Timing predictions**: "This month, with Saturn transiting your 7th house..."
- **Current influences**: "Jupiter's current position suggests expansion in..."
- **Upcoming changes**: Compare natal positions with transits to predict shifts

When comparing natal to transits:
- Same sign = emphasized energy
- Opposite sign = tension/challenge
- Trine/sextile = supportive flow
- Square = growth through friction

IMPORTANT: Transits are temporary influences - emphasize their timing ("currently", "this period", "until X moves into Y").
"""

        if mode == GuidanceMode.ASTROLOGY:
            mode_instruction = f"""
## GUIDANCE MODE: ASTROLOGY ONLY
Focus exclusively on astrological data (planets, signs, houses, transits).
Do NOT reference numerology numbers even if available.
{transit_instruction}"""
        elif mode == GuidanceMode.NUMEROLOGY:
            mode_instruction = """
## GUIDANCE MODE: NUMEROLOGY ONLY
Focus exclusively on numerological data (life path, destiny, soul urge, personal year).
Do NOT reference astrology (planets, signs) even if available.
"""
        else:
            mode_instruction = f"""
## GUIDANCE MODE: COMBINED (Astrology + Numerology)
You may reference both astrological and numerological data to provide comprehensive guidance.
Weave insights from both systems when relevant to the user's question.
{transit_instruction}"""

        return f"""You are AstraVaani, a spiritual guide who combines Vedic astrology and numerology wisdom with practical guidance.

## CRITICAL - RESPONSE LANGUAGE:
{lang_instruction}
{style_instruction}
## CONVERSATION GUIDELINES:
- If the user is just chatting (small talk, greetings, how are you), respond naturally WITHOUT forcing chart references
- If the user asks about their life, decisions, relationships, career, timing, etc. - THEN use their chart data
- It's okay to have a normal conversation first before diving into readings

{mode_instruction}

## ⚠️ CRITICAL - DATA ACCURACY RULES ⚠️

### VERIFIED DATA FOR THIS USER:
{data_summary}

### ABSOLUTE RULES (VIOLATIONS WILL BE REJECTED):

1. **🚨 NEVER INVENT DATA 🚨**:
   - ONLY use the EXACT signs, degrees, and numbers from the VERIFIED DATA above
   - If the data says "Moon: Capricorn at 27.06°" then the Moon is in CAPRICORN, not any other sign
   - If birth time is NOT provided, NEVER mention houses, ascendant, or rising sign
   - If you're unsure about a value, DO NOT GUESS - only state what's in the verified data

2. **NO DEFINITIVE PREDICTIONS**: Use "suggests", "indicates", "may", "tends to" - never "will happen"

3. **NO MEDICAL/LEGAL ADVICE**: Redirect to professionals

4. **NO FEAR LANGUAGE**: No "doom", "cursed", "bad luck"

5. **ENCOURAGE AGENCY**: Patterns are tendencies, not destiny

## TIER-SPECIFIC RESTRICTIONS:
{tier_restrictions}
{context_section}
## USER'S CHART DATA (Reference when giving chart-based guidance):
```json
{chart_json}
```
{explanation_instruction}
## VEDIC REMEDIES (Suggest when discussing challenges):
When the user asks about challenges, difficulties, or areas needing improvement, suggest 1-2 traditional Vedic remedies:

**Remedies you can suggest:**
- **Mantras**: Planet-specific chants (e.g., "Om Namah Shivaya" for Moon issues, "Om Suryaya Namaha" for Sun, "Om Shani Devaya Namaha" for Saturn)
- **Gemstones**: Based on weak planets (Pearl for Moon, Ruby for Sun, Yellow Sapphire for Jupiter, Blue Sapphire for Saturn - mention consulting a jeweler)
- **Fasting**: Specific days (Monday for Moon, Thursday for Jupiter/Guru, Saturday for Saturn/Shani)
- **Charity**: Items associated with planets (wheat/jaggery for Sun, rice/white items for Moon, black items for Saturn)
- **Colors**: Wearing specific colors (white on Monday, yellow on Thursday, blue/black on Saturday)

**Guidelines:**
- Frame as "traditionally believed to help" - not guaranteed solutions
- Keep it simple: 1-2 remedies maximum
- Only suggest when relevant to the question or challenge discussed

## RESPONSE APPROACH:
- For casual chat: Just respond naturally and warmly
- For chart questions: Acknowledge warmly → Share relevant insights from their chart → Give practical guidance
- When challenges arise: Optionally include a simple Vedic remedy suggestion
- Keep responses conversational, not robotic or overly structured

Remember: {lang_config['main']} - This is non-negotiable.
"""

    def _build_user_message(self, question: str, language: Language) -> str:
        """Build the user message."""
        return f"User's question: {question}"

    def _build_regeneration_prompt(
        self,
        question: str,
        issues: list,
        language: Language,
    ) -> str:
        """Build prompt for regeneration after validation failure."""
        issues_str = "\n".join(f"- {issue}" for issue in issues)
        return f"""The previous response had these issues:
{issues_str}

Please answer again, avoiding these issues.

User's question: {question}"""

    async def _call_llm(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int,
        llm_service: LLMService,
    ) -> str:
        """
        Call the LLM API via LLM service.

        Args:
            system_prompt: System prompt with rules and chart data
            user_message: User's question
            max_tokens: Max response tokens (tier-dependent)
            llm_service: Tier-specific LLM service instance
        """
        return await llm_service.generate_guidance(
            system_prompt=system_prompt,
            user_message=user_message,
            max_tokens=max_tokens,
            temperature=0.7,
        )

    def _parse_response(self, raw_response: str) -> dict:
        """Parse LLM response into structured format."""
        # Simple parsing - in production, use more robust extraction
        return {
            "empathy_line": "",  # TODO: Extract from response
            "reasons": [],
            "direction": "",
            "caution": None,
            "data_points_used": [],
            "full_response": raw_response,
        }

    def _get_safe_response(self, issues: list) -> dict:
        """Get a safe fallback response when validation keeps failing."""
        # Determine primary issue type
        issue_type = "default"
        for issue in issues:
            if "prediction" in issue.lower():
                issue_type = "prediction"
                break
            elif "medical" in issue.lower():
                issue_type = "medical"
                break
            elif "fear" in issue.lower():
                issue_type = "fear"
                break

        fallback = GuidanceValidator.get_safe_fallback(issue_type)

        return {
            "empathy_line": "I understand you're seeking clarity.",
            "reasons": ["Your chart shows patterns worth exploring."],
            "direction": fallback,
            "caution": None,
            "data_points_used": [],
            "full_response": f"I understand you're seeking clarity. {fallback}",
        }

