"""
config.py — Application settings using pydantic-settings.
Reads all config from environment variables / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./llm_firewall_dev.db"

    # Google Gemini
    GEMINI_API_KEY: str = ""

    # App
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "*"
    APP_VERSION: str = "1.0.0"
    APP_NAME: str = "LLM Security Firewall"

    @property
    def allowed_origins_list(self) -> list[str]:
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — only loaded once per process."""
    return Settings()
