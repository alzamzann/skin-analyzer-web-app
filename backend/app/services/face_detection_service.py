from dataclasses import dataclass
import os
from pathlib import Path
from threading import Lock

import numpy as np
from PIL import Image

from app.services.errors import AnalysisError


@dataclass(frozen=True)
class FaceBoundingBox:
    x: int
    y: int
    width: int
    height: int


@dataclass(frozen=True)
class FaceLandmark:
    x: float
    y: float
    z: float = 0.0


@dataclass(frozen=True)
class DetectedFace:
    bounding_box: FaceBoundingBox
    landmarks: list[FaceLandmark]


class MediaPipeFaceDetectionService:
    def __init__(self, model_path: Path):
        self.model_path = model_path
        self._landmarker = None
        self._lock = Lock()

    def detect_single_face(self, image: Image.Image) -> DetectedFace:
        landmarker = self._get_landmarker()
        mp_image = self._to_mediapipe_image(image)
        with self._lock:
            result = landmarker.detect(mp_image)
        faces = result.face_landmarks

        if not faces:
            raise AnalysisError(
                "No face was detected. Upload a clear front-facing face photo.",
                "no_face_detected",
            )

        if len(faces) > 1:
            raise AnalysisError(
                "Multiple faces were detected. Upload a photo with one face only.",
                "multiple_faces_detected",
            )

        landmarks = [
            FaceLandmark(x=point.x, y=point.y, z=point.z) for point in faces[0]
        ]
        return DetectedFace(
            bounding_box=_build_face_box(landmarks, image.width, image.height),
            landmarks=landmarks,
        )

    def _get_landmarker(self):
        if self._landmarker is not None:
            return self._landmarker

        if not self.model_path.exists():
            raise AnalysisError(
                "Face detection model is missing. Run scripts/download_face_landmarker.py.",
                "face_model_missing",
                status_code=503,
            )

        mp = _import_mediapipe()

        options = mp.tasks.vision.FaceLandmarkerOptions(
            base_options=mp.tasks.BaseOptions(
                model_asset_path=str(self.model_path),
            ),
            num_faces=2,
            running_mode=mp.tasks.vision.RunningMode.IMAGE,
        )
        try:
            self._landmarker = mp.tasks.vision.FaceLandmarker.create_from_options(
                options
            )
        except OSError as error:
            raise AnalysisError(
                "MediaPipe could not start. Install the required system vision libraries.",
                "face_detector_unavailable",
                status_code=503,
            ) from error
        return self._landmarker

    def close(self) -> None:
        with self._lock:
            if self._landmarker is not None:
                self._landmarker.close()
                self._landmarker = None

    @staticmethod
    def _to_mediapipe_image(image: Image.Image):
        mp = _import_mediapipe()

        image_array = np.asarray(image.convert("RGB"))
        return mp.Image(image_format=mp.ImageFormat.SRGB, data=image_array)


def _import_mediapipe():
    os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")
    try:
        import mediapipe as mp
    except ImportError as error:
        raise AnalysisError(
            "MediaPipe is not installed in the backend Python environment.",
            "face_detector_unavailable",
            status_code=503,
        ) from error
    return mp


def _build_face_box(
    landmarks: list[FaceLandmark],
    image_width: int,
    image_height: int,
) -> FaceBoundingBox:
    min_x = min(point.x for point in landmarks) * image_width
    max_x = max(point.x for point in landmarks) * image_width
    min_y = min(point.y for point in landmarks) * image_height
    max_y = max(point.y for point in landmarks) * image_height

    x = _clamp_int(round(min_x), 0, image_width - 1)
    y = _clamp_int(round(min_y), 0, image_height - 1)
    width = _clamp_int(round(max_x - min_x), 1, image_width - x)
    height = _clamp_int(round(max_y - min_y), 1, image_height - y)
    return FaceBoundingBox(x=x, y=y, width=width, height=height)


def _clamp_int(value: int, minimum: int, maximum: int) -> int:
    return min(max(value, minimum), maximum)
