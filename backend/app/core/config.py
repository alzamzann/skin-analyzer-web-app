from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Dermalyzer API"
    api_prefix: str = "/api"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    database_url: str = (
        "postgresql+psycopg://dermalyzer:dermalyzer@localhost:5432/dermalyzer"
    )
    max_upload_size_bytes: int = 8 * 1024 * 1024
    data_dir: Path = Path(__file__).resolve().parents[1] / "data"
    face_landmarker_model_path: Path = (
        Path(__file__).resolve().parents[1] / "ml_models" / "face_landmarker.task"
    )
    skin_model_path: Path = (
        Path(__file__).resolve().parents[1] / "ml_models" / "best_efficientnet_b0_v1.pt"
    )
    skin_model_arch: str = "efficientnet_b0"
    skin_model_labels: list[str] = Field(
        default_factory=lambda: [
            "Acne",
            "Blackheads",
            "Enlarged Pores",
            "Pigmentation",
            "Redness",
            "Wrinkles",
        ]
    )
    skin_model_threshold: float = 0.7
    skin_model_label_thresholds: dict[str, float] = Field(default_factory=dict)
    mock_inference_enabled: bool = True
    roi_crop_size: int = 224

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="DERMALYZER_",
        extra="ignore",
    )

    @field_validator("skin_model_label_thresholds")
    @classmethod
    def validate_label_thresholds(
        cls,
        thresholds: dict[str, float],
    ) -> dict[str, float]:
        invalid_labels = [
            label for label, threshold in thresholds.items() if threshold < 0 or threshold > 1
        ]
        if invalid_labels:
            raise ValueError(
                "skin_model_label_thresholds values must be between 0 and 1 "
                f"for labels: {', '.join(invalid_labels)}"
            )

        return thresholds


@lru_cache
def get_settings() -> Settings:
    return Settings()
