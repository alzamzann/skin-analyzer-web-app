from io import BytesIO
from pathlib import Path

from PIL import Image

from app.services.errors import AnalysisError
from app.services.face_detection_service import (
    DetectedFace,
    FaceBoundingBox,
    FaceLandmark,
    MediaPipeFaceDetectionService,
)
from app.services.roi_service import RoiService


ROI_CENTER_INDEXES = {
    "forehead": 151,
    "nose": 5,
    "left_cheek": 50,
    "right_cheek": 280,
}


def _image_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (128, 128), color=(180, 140, 120)).save(buffer, format="JPEG")
    return buffer.getvalue()


def _landmarks() -> list[FaceLandmark]:
    landmarks = [FaceLandmark(x=0.5, y=0.5) for _ in range(468)]
    overrides = {
        10: (0.50, 0.22),
        67: (0.42, 0.25),
        69: (0.45, 0.24),
        104: (0.38, 0.28),
        108: (0.44, 0.26),
        151: (0.50, 0.28),
        299: (0.58, 0.25),
        332: (0.62, 0.28),
        337: (0.56, 0.26),
        338: (0.55, 0.24),
        1: (0.50, 0.48),
        2: (0.50, 0.52),
        4: (0.50, 0.56),
        5: (0.50, 0.43),
        98: (0.45, 0.55),
        168: (0.50, 0.40),
        197: (0.50, 0.44),
        327: (0.55, 0.55),
        50: (0.34, 0.50),
        101: (0.32, 0.55),
        116: (0.28, 0.58),
        117: (0.30, 0.60),
        118: (0.32, 0.62),
        123: (0.36, 0.63),
        187: (0.38, 0.58),
        205: (0.39, 0.54),
        280: (0.66, 0.50),
        330: (0.68, 0.55),
        346: (0.72, 0.58),
        347: (0.70, 0.60),
        348: (0.68, 0.62),
        352: (0.64, 0.63),
        411: (0.62, 0.58),
        425: (0.61, 0.54),
    }
    for index, (x, y) in overrides.items():
        landmarks[index] = FaceLandmark(x=x, y=y)
    return landmarks


class FakeDetector:
    def detect_single_face(self, _image: Image.Image) -> DetectedFace:
        return DetectedFace(
            bounding_box=FaceBoundingBox(x=24, y=20, width=80, height=88),
            landmarks=_landmarks(),
        )


class NoFaceDetector:
    def detect_single_face(self, _image: Image.Image) -> DetectedFace:
        raise AnalysisError(
            "No face was detected. Upload a clear front-facing face photo.",
            "no_face_detected",
        )


def test_roi_service_extracts_four_regions() -> None:
    service = RoiService(face_detection_service=FakeDetector(), crop_size=48)

    result = service.extract(_image_bytes())
    roi_by_region = {roi.region: roi for roi in result.rois}
    landmarks = _landmarks()

    assert result.landmark_count == 468
    assert [roi.region for roi in result.rois] == [
        "forehead",
        "nose",
        "left_cheek",
        "right_cheek",
    ]
    assert all(roi.image.size == (48, 48) for roi in result.rois)
    assert all(roi.bounding_box.width > 0 for roi in result.rois)

    for region, landmark_index in ROI_CENTER_INDEXES.items():
        roi = roi_by_region[region]
        landmark = landmarks[landmark_index]
        center_x = roi.bounding_box.x + roi.bounding_box.width / 2
        expected_x = landmark.x * 128
        assert abs(center_x - expected_x) <= 1

    forehead_center_y = (
        roi_by_region["forehead"].bounding_box.y
        + roi_by_region["forehead"].bounding_box.height / 2
    )
    forehead_landmark_y = landmarks[151].y * 128
    assert forehead_center_y < forehead_landmark_y


def test_roi_service_detects_landmarks_for_preview() -> None:
    service = RoiService(face_detection_service=FakeDetector(), crop_size=48)

    result = service.detect_landmarks(_image_bytes())

    assert len(result.face.landmarks) == 468
    assert result.image.size == (128, 128)
    assert result.to_annotated_data_url().startswith("data:image/jpeg;base64,")


def test_roi_service_crops_from_single_landmark() -> None:
    service = RoiService(face_detection_service=FakeDetector(), crop_size=48)

    result = service.crop_from_landmark(
        image_bytes=_image_bytes(),
        landmark_index=10,
        crop_size=64,
    )

    assert result.landmark_index == 10
    assert result.bounding_box.width == 64
    assert result.bounding_box.height == 64
    assert result.crop.size == (64, 64)
    assert result.to_crop_data_url().startswith("data:image/jpeg;base64,")


def test_roi_service_rejects_unknown_landmark_index() -> None:
    service = RoiService(face_detection_service=FakeDetector(), crop_size=48)

    try:
        service.crop_from_landmark(
            image_bytes=_image_bytes(),
            landmark_index=999,
            crop_size=64,
        )
    except AnalysisError as error:
        assert error.code == "invalid_landmark_index"
        assert error.status_code == 422
    else:
        raise AssertionError("Invalid landmark indexes should fail.")


def test_roi_service_keeps_detector_errors() -> None:
    service = RoiService(face_detection_service=NoFaceDetector(), crop_size=48)

    try:
        service.extract(_image_bytes())
    except AnalysisError as error:
        assert error.code == "no_face_detected"
    else:
        raise AssertionError("No-face images should fail before ROI extraction.")


def test_mediapipe_detector_reports_missing_model() -> None:
    detector = MediaPipeFaceDetectionService(Path("missing-face-model.task"))

    try:
        detector.detect_single_face(Image.new("RGB", (32, 32)))
    except AnalysisError as error:
        assert error.code == "face_model_missing"
        assert error.status_code == 503
    else:
        raise AssertionError("Missing model should fail with a setup error.")
