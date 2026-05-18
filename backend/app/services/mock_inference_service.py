from io import BytesIO

import numpy as np
from PIL import Image, UnidentifiedImageError

from app.schemas.analysis import LabelPrediction
from app.services.errors import AnalysisError


LABELS = [
    "Acne",
    "Redness",
    "Pigmentation",
    "Blackheads",
    "Wrinkles",
    "Enlarged Pores",
]


class MockInferenceService:
    def predict(self, image_bytes: bytes) -> list[LabelPrediction]:
        try:
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
        except UnidentifiedImageError as error:
            raise AnalysisError(
                "The uploaded file could not be read as an image.",
                "invalid_image",
            ) from error

        image.thumbnail((128, 128))
        pixels = np.asarray(image, dtype=np.float32) / 255.0
        brightness = float(pixels.mean())
        contrast = float(pixels.std())
        red_balance = float(pixels[:, :, 0].mean() - pixels[:, :, 1].mean())
        blue_balance = float(pixels[:, :, 2].mean() - pixels[:, :, 1].mean())
        texture = float(np.abs(np.diff(pixels, axis=0)).mean())

        raw_scores = {
            "Acne": 0.34 + max(red_balance, 0) * 0.9 + texture * 1.6,
            "Redness": 0.28 + max(red_balance, 0) * 1.8,
            "Pigmentation": 0.30 + contrast * 1.8 + max(0.48 - brightness, 0) * 0.7,
            "Blackheads": 0.26 + max(0.58 - brightness, 0) * 0.8 + texture * 1.4,
            "Wrinkles": 0.22 + contrast * 1.15 + texture * 2.4,
            "Enlarged Pores": 0.32 + contrast * 1.25 + max(blue_balance, 0) * 0.5,
        }

        return [
            LabelPrediction(
                label=label,
                detected=_clamp(raw_scores[label]) >= 0.5,
                confidence=_clamp(raw_scores[label]),
            )
            for label in LABELS
        ]


def _clamp(value: float) -> float:
    return round(min(max(value, 0.05), 0.97), 3)
