"""Application configuration using Pydantic Settings."""

from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Application
    APP_NAME: str = "AstraVaani"
    DEBUG: bool = False
    SECRET_KEY: str = "change-this-in-production"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/astravaani"

    # CORS - Allow localhost and Vercel domains
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://astravaani.vercel.app",
        "https://astravaani-aagam-botharas-projects.vercel.app",
    ]

    # JWT
    JWT_SECRET_KEY: str = "jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # LLM Configuration
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    LLM_PROVIDER: str = "anthropic"  # or "openai"

    # Tier-specific models (Anthropic Claude 4.x)
    # Free tier: Haiku only (~₹0.80/chat)
    LLM_MODEL_FREE: str = "claude-3-haiku-20240307"
    # Starter tier (₹99): Sonnet 4 (~₹2.50/chat)
    LLM_MODEL_STARTER: str = "claude-sonnet-4-20250514"
    # Pro tier (₹699): Sonnet 4 generator + Opus 4.5 validator (~₹7/chat)
    LLM_MODEL_PRO: str = "claude-sonnet-4-20250514"
    LLM_MODEL_PRO_VALIDATOR: str = "claude-opus-4-5-20251101"

    # Legacy settings (for backwards compatibility)
    LLM_MODEL: str = "claude-3-haiku-20240307"
    LLM_MODEL_VALIDATOR: str = "claude-3-5-sonnet-20241022"

    # Razorpay Configuration (Indian payment gateway)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # App URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Email (Resend)
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "onboarding@resend.dev"


settings = Settings()
