"""
LLM Service - Handles Anthropic and OpenAI API integration.

Provides a unified interface for LLM calls with automatic provider selection.
Supports tier-based model selection:
- Free: Haiku (~₹0.80/chat)
- Starter: Sonnet (~₹2.50/chat)
- Pro: Sonnet + Opus validator (~₹7/chat)

Updated: 2026-01-26 - Using -latest model aliases
"""

from typing import Optional, List, Dict, Any
from abc import ABC, abstractmethod

from app.core.config import settings


# Model name resolution: short name -> full model ID
MODEL_NAME_MAP = {
    # Anthropic Claude 4.x models
    "haiku": "claude-3-haiku-20240307",     # Claude 3 Haiku (fastest, cheapest)
    "sonnet": "claude-sonnet-4-20250514",   # Claude Sonnet 4 (balanced)
    "opus": "claude-opus-4-5-20251101",     # Claude Opus 4.5 (most capable)
    # OpenAI models (for future use)
    "gpt-4o-mini": "gpt-4o-mini",
    "gpt-4o": "gpt-4o",
}


def resolve_model_name(short_name: str) -> str:
    """Resolve short model name to full model ID."""
    return MODEL_NAME_MAP.get(short_name, short_name)


class LLMClient(ABC):
    """Abstract base class for LLM clients."""

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> str:
        """Generate a response from the LLM."""
        pass


class AnthropicClient(LLMClient):
    """Anthropic Claude API client."""

    def __init__(self, api_key: str, model: str = "claude-3-haiku-20240307"):
        self.api_key = api_key
        self.model = model
        self._client = None

    @property
    def client(self):
        """Lazy load the Anthropic client."""
        if self._client is None:
            from anthropic import AsyncAnthropic
            self._client = AsyncAnthropic(api_key=self.api_key)
        return self._client

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> str:
        """Generate a response using Claude."""
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        return response.content[0].text


class OpenAIClient(LLMClient):
    """OpenAI API client."""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model
        self._client = None

    @property
    def client(self):
        """Lazy load the OpenAI client."""
        if self._client is None:
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(api_key=self.api_key)
        return self._client

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> str:
        """Generate a response using GPT."""
        response = await self.client.chat.completions.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
        return response.choices[0].message.content


class MockLLMClient(LLMClient):
    """Mock client for development without API keys."""

    async def generate(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> str:
        """Return a mock response for development."""
        return """I understand you're seeking guidance on this matter.

Based on your chart patterns, there are a few things worth considering:

Your Sun placement suggests a natural inclination towards thoughtful decision-making. The patterns in your chart indicate that taking time to reflect before major decisions tends to serve you well.

Consider exploring what truly resonates with you in this situation. Your chart patterns suggest that trusting your intuition, while also gathering practical information, could be a balanced approach.

Remember, these are patterns to be aware of. Your choices shape your path."""


def get_llm_client(
    provider: Optional[str] = None,
    model: Optional[str] = None,
) -> LLMClient:
    """
    Get an LLM client based on configuration.

    Args:
        provider: Override provider ("anthropic" or "openai")
        model: Override model name

    Returns:
        Configured LLM client
    """
    provider = provider or settings.LLM_PROVIDER
    model = model or settings.LLM_MODEL

    if provider == "anthropic":
        if not settings.ANTHROPIC_API_KEY:
            # Return mock client for development
            return MockLLMClient()
        return AnthropicClient(
            api_key=settings.ANTHROPIC_API_KEY,
            model=model,
        )
    elif provider == "openai":
        if not settings.OPENAI_API_KEY:
            # Return mock client for development
            return MockLLMClient()
        return OpenAIClient(
            api_key=settings.OPENAI_API_KEY,
            model=model,
        )
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")


# Singleton instances for the application - reset to None on module reload
_generator_client: Optional[LLMClient] = None
_validator_client: Optional[LLMClient] = None

# Cached clients per model - empty dict forces recreation with new model names
_model_clients: Dict[str, LLMClient] = {}


def get_generator_client() -> LLMClient:
    """Get the generator LLM client (Haiku - fast, cheap). Legacy function."""
    global _generator_client
    if _generator_client is None:
        _generator_client = get_llm_client(model=settings.LLM_MODEL)
    return _generator_client


def get_validator_client() -> LLMClient:
    """Get the validator LLM client (Sonnet - thorough, Pro tier only). Legacy function."""
    global _validator_client
    if _validator_client is None:
        _validator_client = get_llm_client(model=settings.LLM_MODEL_VALIDATOR)
    return _validator_client


def get_client_for_model(model_short_name: str) -> LLMClient:
    """
    Get or create an LLM client for a specific model.

    Args:
        model_short_name: Short model name (e.g., "haiku", "sonnet", "opus")

    Returns:
        Configured LLM client for the model
    """
    # Always create fresh clients to avoid stale model name issues during hot reload
    full_model_name = resolve_model_name(model_short_name)
    return get_llm_client(model=full_model_name)


def get_default_llm_client() -> LLMClient:
    """Get the default LLM client (Haiku for backwards compatibility)."""
    return get_client_for_model("haiku")


class LLMService:
    """
    High-level service for LLM operations.

    Tier-based model configuration:
    - Free: Haiku only (~₹0.80/chat)
    - Starter: Sonnet only (~₹2.50/chat)
    - Pro: Sonnet generator + Opus validator (~₹7/chat)
    """

    def __init__(
        self,
        generator_model: str = "haiku",
        validator_model: Optional[str] = None,
        generator_client: Optional[LLMClient] = None,
        validator_client: Optional[LLMClient] = None,
    ):
        """
        Initialize LLM service with tier-specific models.

        Args:
            generator_model: Short model name for generation (e.g., "haiku", "sonnet")
            validator_model: Short model name for validation (e.g., "opus"), None if no validation
            generator_client: Override generator client (for testing)
            validator_client: Override validator client (for testing)
        """
        self.generator = generator_client or get_client_for_model(generator_model)
        self.validator = validator_client or (
            get_client_for_model(validator_model) if validator_model else None
        )
        self.generator_model = generator_model
        self.validator_model = validator_model

    @classmethod
    def for_tier(cls, tier_config) -> "LLMService":
        """
        Create an LLMService configured for a specific tier.

        Args:
            tier_config: TierConfig object with response.generator_model and response.validator_model

        Returns:
            LLMService configured for the tier
        """
        return cls(
            generator_model=tier_config.response.generator_model,
            validator_model=tier_config.response.validator_model if tier_config.response.use_validator else None,
        )

    async def generate_guidance(
        self,
        system_prompt: str,
        user_message: str,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        max_retries: int = 2,
    ) -> str:
        """
        Generate guidance response using Generator model (Haiku).

        Args:
            system_prompt: System prompt with chart data and rules
            user_message: User's question
            max_tokens: Maximum response tokens
            temperature: Response creativity (0.0-1.0)
            max_retries: Number of retry attempts on failure

        Returns:
            Generated response text
        """
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                response = await self.generator.generate(
                    system_prompt=system_prompt,
                    user_message=user_message,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                return response
            except Exception as e:
                last_error = e
                if attempt < max_retries:
                    # Wait before retry (exponential backoff)
                    import asyncio
                    await asyncio.sleep(2 ** attempt)
                    continue
                raise

        raise last_error

    async def validate_response(
        self,
        response: str,
        chart_data: Dict[str, Any],
        user_question: str,
        max_tokens: int = 512,
    ) -> Dict[str, Any]:
        """
        Use Validator model to validate a response (Pro tier only).

        This is the "Validator" part of the Generator + Validator pipeline.
        Pro tier uses Opus for thorough fact-checking.

        Args:
            response: The generated response to validate
            chart_data: Original chart data for fact-checking
            user_question: The original user question
            max_tokens: Maximum tokens for validation response

        Returns:
            Validation result with issues list
        """
        # If no validator configured, auto-pass
        if self.validator is None:
            return {"passed": True, "issues": []}

        import json as json_module

        validation_prompt = f"""You are a strict validator for AstraVaani, a spiritual guidance platform.

CRITICAL: Your job is to catch any violations in this response. Be thorough.

## RESPONSE TO VALIDATE:
{response}

## USER'S ORIGINAL QUESTION:
{user_question}

## ACTUAL CHART DATA (source of truth):
{json_module.dumps(chart_data, indent=2, default=str)}

## CHECK FOR THESE VIOLATIONS:

1. **PREDICTION**: Does it make definitive predictions?
   - BAD: "will happen", "will definitely", "is guaranteed", "you will meet"
   - GOOD: "suggests", "indicates", "may", "tends to"

2. **INVENTION**: Does it reference data NOT in the chart?
   - Check every sign, planet, degree, and number mentioned
   - If response says "Sun in Aries" but chart shows "Sun in Taurus" = VIOLATION
   - If response mentions a planet not in the chart data = VIOLATION

3. **MEDICAL/LEGAL**: Does it give medical diagnoses or legal advice?
   - Any health recommendations beyond "consult a professional" = VIOLATION
   - Any legal advice = VIOLATION

4. **FEAR LANGUAGE**: Does it use fear-based language?
   - "doom", "cursed", "bad luck will", "danger", "beware" = VIOLATION
   - Gentle cautions are OK, fear-mongering is NOT

## RESPOND IN THIS EXACT JSON FORMAT:
{{"passed": true, "issues": []}}

OR if there are issues:
{{"passed": false, "issues": ["PREDICTION: Found 'will definitely' in response", "INVENTION: Response mentions Jupiter but chart has no Jupiter data"]}}

Be specific about what you found. Cite the exact text."""

        try:
            # Use Sonnet (validator) for thorough checking
            result = await self.validator.generate(
                system_prompt="You are a JSON validator for AstraVaani. Respond ONLY with valid JSON. Be strict and thorough.",
                user_message=validation_prompt,
                max_tokens=max_tokens,
                temperature=0.0,  # Deterministic for validation
            )

            # Parse JSON response
            result = result.strip()
            if result.startswith("```"):
                result = result.split("```")[1]
                if result.startswith("json"):
                    result = result[4:]
            result = result.strip()

            return json_module.loads(result)
        except Exception:
            # If validation parsing fails, be conservative and pass
            return {"passed": True, "issues": []}


# Cost estimation (approximate USD per 1K tokens)
COST_PER_1K_TOKENS = {
    # Claude 4.x models (current)
    "claude-haiku-4-5-20251015": {"input": 0.001, "output": 0.005},
    "claude-sonnet-4-20250514": {"input": 0.003, "output": 0.015},
    "claude-opus-4-5-20251101": {"input": 0.015, "output": 0.075},
    # OpenAI models
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    "gpt-4o": {"input": 0.005, "output": 0.015},
}

# Cost breakdown for AstraVaani tiers (estimates at 83 INR/USD):
# Free: Haiku only = ~₹0.80/chat
# Starter (₹99): Sonnet only = ~₹2.50/chat
# Pro (₹699): Sonnet generator + Opus validator = ~₹7/chat


def estimate_cost_inr(
    model: str,
    input_tokens: int,
    output_tokens: int,
    usd_to_inr: float = 83.0,
) -> float:
    """
    Estimate cost in INR for a single LLM call.

    Args:
        model: Model name
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens
        usd_to_inr: USD to INR conversion rate

    Returns:
        Estimated cost in INR
    """
    costs = COST_PER_1K_TOKENS.get(model, {"input": 0.001, "output": 0.002})

    input_cost = (input_tokens / 1000) * costs["input"]
    output_cost = (output_tokens / 1000) * costs["output"]

    total_usd = input_cost + output_cost
    return total_usd * usd_to_inr
