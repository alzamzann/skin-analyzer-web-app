from collections.abc import Sequence
from pathlib import Path
from threading import Lock

from PIL import Image

from app.ml.model_loader import load_efficientnet_b0_state_dict_model
from app.ml.transforms import build_image_transform, ensure_rgb
from app.schemas.analysis import LabelPrediction
from app.services.errors import AnalysisError


class TorchInferenceService:
    def __init__(
        self,
        model_path: Path,
        labels: list[str],
        threshold: float = 0.5,
        label_thresholds: dict[str, float] | None = None,
        arch: str = "efficientnet_b0",
        image_size: int = 224,
        device: str | None = None,
    ):
        self.model_path = model_path
        self.labels = labels
        self.threshold = threshold
        self.label_thresholds = label_thresholds or {}
        self.arch = arch
        self.image_size = image_size
        self.device = device
        self._model = None
        self._transform = None
        self._lock = Lock()

    def predict_rois(self, roi_images: Sequence[Image.Image]) -> list[LabelPrediction]:
        if not roi_images:
            raise AnalysisError(
                "No ROI images were available for model inference.",
                "model_inference_failed",
            )

        try:
            import torch
        except ImportError as error:
            raise AnalysisError(
                "PyTorch is not installed. Install backend/requirements-ml.txt or enable mock inference.",
                "model_inference_unavailable",
                status_code=503,
            ) from error

        model = self._get_model()
        transform = self._get_transform()

        batch = torch.stack([transform(ensure_rgb(image)) for image in roi_images])
        batch = batch.to(self._get_device())

        with self._lock:
            with torch.no_grad():
                logits = model(batch)
                probabilities = (
                    torch.sigmoid(logits).max(dim=0).values.detach().cpu()
                )

        return [
            LabelPrediction(
                label=label,
                detected=float(probabilities[index])
                >= self._threshold_for_label(label),
                confidence=round(float(probabilities[index]), 3),
            )
            for index, label in enumerate(self.labels)
        ]

    def _threshold_for_label(self, label: str) -> float:
        return self.label_thresholds.get(label, self.threshold)

    def _get_model(self):
        if self._model is not None:
            return self._model

        if self.arch != "efficientnet_b0":
            raise AnalysisError(
                f"Unsupported skin model architecture: {self.arch}.",
                "unsupported_model_architecture",
                status_code=503,
            )

        try:
            self._model = load_efficientnet_b0_state_dict_model(
                model_path=self.model_path,
                label_count=len(self.labels),
                device=self._get_device(),
            )
        except FileNotFoundError as error:
            raise AnalysisError(
                "Skin model file is missing. Add the model to backend/app/ml_models.",
                "skin_model_missing",
                status_code=503,
            ) from error
        except ImportError as error:
            raise AnalysisError(
                "PyTorch model dependencies are not available for real inference.",
                "model_inference_unavailable",
                status_code=503,
            ) from error
        except Exception as error:
            raise AnalysisError(
                "Skin model could not be loaded.",
                "skin_model_load_failed",
                status_code=503,
            ) from error

        return self._model

    def _get_transform(self):
        if self._transform is None:
            try:
                self._transform = build_image_transform(self.image_size)
            except RuntimeError as error:
                raise AnalysisError(
                    "Torchvision is not installed. Install backend/requirements-ml.txt or enable mock inference.",
                    "model_inference_unavailable",
                    status_code=503,
                ) from error
        return self._transform

    def _get_device(self) -> str:
        if self.device is not None:
            return self.device

        try:
            import torch
        except ImportError:
            return "cpu"

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        return self.device
