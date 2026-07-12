import pytest
from pydantic import ValidationError

from app.core.config import Settings


def test_settings_accepts_per_label_thresholds() -> None:
    settings = Settings(
        skin_model_label_thresholds={
            "Acne": 0.75,
            "Redness": 0.65,
        }
    )

    assert settings.skin_model_label_thresholds == {
        "Acne": 0.75,
        "Redness": 0.65,
    }


def test_settings_rejects_invalid_per_label_thresholds() -> None:
    with pytest.raises(ValidationError):
        Settings(skin_model_label_thresholds={"Acne": 1.2})
