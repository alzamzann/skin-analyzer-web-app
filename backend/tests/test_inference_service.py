from pathlib import Path

import torch
from PIL import Image

from app.services.inference_service import TorchInferenceService


class FixedLogitModel:
    def __init__(self, probabilities: list[list[float]]):
        self.logits = torch.logit(torch.tensor(probabilities))

    def __call__(self, _batch: torch.Tensor) -> torch.Tensor:
        return self.logits


def test_predict_rois_uses_maximum_probability_per_class() -> None:
    service = TorchInferenceService(
        model_path=Path("unused.pt"),
        labels=["Acne", "Redness"],
        threshold=0.5,
        device="cpu",
    )
    service._model = FixedLogitModel(
        [
            [0.10, 0.20],
            [0.90, 0.30],
            [0.40, 0.80],
            [0.20, 0.10],
        ]
    )
    service._transform = lambda _image: torch.zeros((3, 8, 8))
    roi_images = [Image.new("RGB", (8, 8)) for _ in range(4)]

    predictions = service.predict_rois(roi_images)

    assert [prediction.confidence for prediction in predictions] == [0.9, 0.8]
    assert all(prediction.detected for prediction in predictions)


def test_predict_rois_uses_per_label_thresholds() -> None:
    service = TorchInferenceService(
        model_path=Path("unused.pt"),
        labels=["Acne", "Redness"],
        threshold=0.5,
        label_thresholds={"Acne": 0.8, "Redness": 0.7},
        device="cpu",
    )
    service._model = FixedLogitModel([[0.75, 0.75]])
    service._transform = lambda _image: torch.zeros((3, 8, 8))

    predictions = service.predict_rois([Image.new("RGB", (8, 8))])

    assert [prediction.confidence for prediction in predictions] == [0.75, 0.75]
    assert [prediction.detected for prediction in predictions] == [False, True]
