"""Application configuration using Pydantic Settings."""

import json
from typing import List, Union

from pydantic import computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS_ORIGINS from JSON string or list."""
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                # Try comma-separated format
                return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v if isinstance(v, list) else []

    # Application
    APP_NAME: str = "AstraVaani"
    DEBUG: bool = False
    SECRET_KEY: str = "change-this-in-production"

    # Database (Render provides postgres://, we need postgresql+asyncpg://)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/astravaani"

    @computed_field
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """Convert postgres:// to postgresql+asyncpg:// for SQLAlchemy async."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    # CORS - Allow localhost, Vercel, Render, and custom domains
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://astravaani.vercel.app",
        "https://astravaani-aagam-botharas-projects.vercel.app",
        "https://astravaani-frontend.onrender.com",
        "https://astravaani.com",
        "https://www.astravaani.com",
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

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Email (Resend)
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "onboarding@resend.dev"


settings = Settings()
