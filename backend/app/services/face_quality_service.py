# Import
from collections.abc import Sequence
from dataclasses import dataclass

import numpy as np
from PIL import Image

from app.services.errors import AnalysisError
from app.services.face_detection_service import DetectedFace


# Aturan kualitas validasi wajah
@dataclass(frozen=True)
class FaceQualityRules:
    minimum_landmarks: int = 281
    min_face_side_ratio: float = 0.18
    min_face_area_ratio: float = 0.04
    max_face_area_ratio: float = 0.92
    min_face_aspect_ratio: float = 0.45
    max_face_aspect_ratio: float = 1.65
    max_outside_landmark_ratio: float = 0.08
    min_luminance: float = 0.08
    max_luminance: float = 0.94
    min_contrast: float = 0.025
    min_edge_strength: float = 0.006
    min_roi_contrast: float = 0.018


# Kelas utama
class FaceQualityValidationService:
    def __init__(self, rules: FaceQualityRules | None = None):
        self.rules = rules or FaceQualityRules()

    # Validasi wajah
    def validate_detected_face(self, image: Image.Image, face: DetectedFace) -> None:
        # Cek jumlah landmark minimum
        if len(face.landmarks) < self.rules.minimum_landmarks:
            raise self._rejection(
                "Face landmarks were incomplete. Upload a clearer front-facing face photo."
            )

        # Validasi batas landmark, geometri, dan kualitas gambar
        self._validate_landmark_bounds(face)
        self._validate_face_geometry(image, face)
        self._validate_image_quality(
            image.crop(
                (
                    face.bounding_box.x,
                    face.bounding_box.y,
                    face.bounding_box.x + face.bounding_box.width,
                    face.bounding_box.y + face.bounding_box.height,
                )
            )
        )

    # Validasi ROI (cek detail dan kejelasan region kulit)
    def validate_roi_images(self, roi_images: Sequence[Image.Image]) -> None:
        if not roi_images:
            raise AnalysisError(
                "Face was detected but no skin regions could be extracted.",
                "roi_extraction_failed",
            )

        # Hitung jumlah ROI dengan kontras rendah
        low_detail_count = 0
        for image in roi_images:
            metrics = _quality_metrics(image)
            if metrics.contrast < self.rules.min_roi_contrast:
                low_detail_count += 1

        # Tolak jika semua ROI memiliki detail rendah
        if low_detail_count == len(roi_images):
            raise self._rejection(
                "Skin regions were too flat or unclear for analysis. Upload a clearer human face photo."
            )

    # Validasi batas landmark (memastikan titik dalam frame)
    def _validate_landmark_bounds(self, face: DetectedFace) -> None:
        outside = sum(
            1
            for landmark in face.landmarks
            if landmark.x < 0 or landmark.x > 1 or landmark.y < 0 or landmark.y > 1
        )
        outside_ratio = outside / max(len(face.landmarks), 1)
        if outside_ratio > self.rules.max_outside_landmark_ratio:
            raise self._rejection(
                "Face landmarks were too close to the image boundary. Center the face and try again."
            )

    # Validasi geometri wajah (ukuran, rasio, dan aspek)
    def _validate_face_geometry(self, image: Image.Image, face: DetectedFace) -> None:
        box = face.bounding_box
        image_area = image.width * image.height
        face_area_ratio = (box.width * box.height) / max(image_area, 1)
        min_side_ratio = min(box.width / image.width, box.height / image.height)
        aspect_ratio = box.width / max(box.height, 1)

        # Cek rasio sisi minimum
        if min_side_ratio < self.rules.min_face_side_ratio:
            raise self._rejection(
                "Face was too small for reliable analysis. Move closer to the camera and try again."
            )

        # Cek rasio area wajah
        if (
            face_area_ratio < self.rules.min_face_area_ratio
            or face_area_ratio > self.rules.max_face_area_ratio
        ):
            raise self._rejection(
                "Face framing was unsuitable for analysis. Upload one centered human face photo."
            )

        # Cek rasio aspek wajah
        if not (
            self.rules.min_face_aspect_ratio
            <= aspect_ratio
            <= self.rules.max_face_aspect_ratio
        ):
            raise self._rejection(
                "Face shape or pose was unsuitable for analysis. Upload a front-facing photo."
            )

    # Validasi kualitas gambar (kecerahan, kontras, ketajaman)
    def _validate_image_quality(self, image: Image.Image) -> None:
        metrics = _quality_metrics(image)

        # Cek kecerahan minimum
        if metrics.luminance < self.rules.min_luminance:
            raise self._rejection(
                "Face image was too dark for reliable analysis. Use brighter lighting and try again."
            )

        # Cek kecerahan maksimal
        if metrics.luminance > self.rules.max_luminance:
            raise self._rejection(
                "Face image was too bright for reliable analysis. Reduce glare and try again."
            )

        # Cek kontras
        if metrics.contrast < self.rules.min_contrast:
            raise self._rejection(
                "Face image had too little detail for reliable analysis. Upload a clearer human face photo."
            )

        # Cek ketajaman (edge strength)
        if metrics.edge_strength < self.rules.min_edge_strength:
            raise self._rejection(
                "Face image was too blurry for reliable analysis. Hold the camera steady and try again."
            )

    # Helper: buat AnalysisError untuk penolakan
    @staticmethod
    def _rejection(message: str) -> AnalysisError:
        return AnalysisError(message, "face_quality_rejected")


# Metrik kualitas gambar
@dataclass(frozen=True)
class ImageQualityMetrics:
    luminance: float
    contrast: float
    edge_strength: float


def _quality_metrics(image: Image.Image) -> ImageQualityMetrics:
    # Konversi ke array float32
    pixels = np.asarray(image.convert("RGB"), dtype=np.float32) / 255.0
    if pixels.size == 0:
        return ImageQualityMetrics(luminance=0, contrast=0, edge_strength=0)

    # Hitung grayscale menggunakan rumus luminance
    gray = (
        pixels[:, :, 0] * 0.299
        + pixels[:, :, 1] * 0.587
        + pixels[:, :, 2] * 0.114
    )
    # Hitung gradient untuk edge strength
    gradient_x = np.abs(np.diff(gray, axis=1)).mean() if gray.shape[1] > 1 else 0
    gradient_y = np.abs(np.diff(gray, axis=0)).mean() if gray.shape[0] > 1 else 0

    return ImageQualityMetrics(
        luminance=float(gray.mean()),
        contrast=float(gray.std()),
        edge_strength=float(gradient_x + gradient_y),
    )
