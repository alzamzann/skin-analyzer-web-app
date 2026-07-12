from io import BytesIO
from collections.abc import Sequence

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
    def __init__(
        self,
        threshold: float = 0.5,
        label_thresholds: dict[str, float] | None = None,
    ):
        self.threshold = threshold
        self.label_thresholds = label_thresholds or {}

    def predict_rois(self, roi_images: Sequence[Image.Image]) -> list[LabelPrediction]:
        if not roi_images:
            raise AnalysisError(
                "No ROI images were available for model inference.",
                "model_inference_failed",
            )

        roi_predictions = [
            self._predict_image(roi_image.convert("RGB")) for roi_image in roi_images
        ]
        max_scores = {
            label: max(
                prediction.confidence
                for predictions in roi_predictions
                for prediction in predictions
                if prediction.label == label
            )
            for label in LABELS
        }

        return [
            LabelPrediction(
                label=label,
                detected=max_scores[label] >= self._threshold_for_label(label),
                confidence=max_scores[label],
            )
            for label in LABELS
        ]

    def predict(self, image_bytes: bytes) -> list[LabelPrediction]:
        try:
            image = Image.open(BytesIO(image_bytes)).convert("RGB")
        except UnidentifiedImageError as error:
            raise AnalysisError(
                "The uploaded file could not be read as an image.",
                "invalid_image",
            ) from error

        return self._predict_image(image)

    def _predict_image(self, image: Image.Image) -> list[LabelPrediction]:
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
                detected=_clamp(raw_scores[label]) >= self._threshold_for_label(label),
                confidence=_clamp(raw_scores[label]),
            )
            for label in LABELS
        ]

    def _threshold_for_label(self, label: str) -> float:
        return self.label_thresholds.get(label, self.threshold)


def _clamp(value: float) -> float:
    return round(min(max(value, 0.05), 0.97), 3)
