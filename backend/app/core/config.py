from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Dermalyzer API"
    api_prefix: str = "/api"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    max_upload_size_bytes: int = 8 * 1024 * 1024
    data_dir: Path = Path(__file__).resolve().parents[1] / "data"
    mock_inference_enabled: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="DERMALYZER_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
