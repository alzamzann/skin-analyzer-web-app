import asyncio
from dataclasses import dataclass
from io import BytesIO

from PIL import Image

from app.api.dependencies import get_recommendation_service
from app.api.routes.analyze import analyze_skin
from app.api.routes.analyze import preview_face_landmarks
from app.api.routes.analyze import preview_landmark_crop
from app.api.routes.analyze import preview_roi_crops
from app.api.routes.health import health_check
from app.core.config import get_settings
from app.services.analysis_service import AnalysisService
from app.services.baumann_service import BaumannService
from app.services.face_detection_service import DetectedFace, FaceBoundingBox, FaceLandmark
from app.services.mock_inference_service import MockInferenceService
from app.services.recommendation_service import RecommendationService
from app.services.roi_service import (
    LandmarkCropResult,
    LandmarkDetectionResult,
    RoiCrop,
    RoiExtractionResult,
)


@dataclass
class FakeUploadFile:
    content_type: str
    payload: bytes

    async def read(self) -> bytes:
        return self.payload


def _image_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (64, 64), color=(185, 145, 125)).save(buffer, format="JPEG")
    return buffer.getvalue()


class FakeRoiService:
    def __init__(self) -> None:
        self.face = DetectedFace(
            bounding_box=FaceBoundingBox(x=8, y=8, width=32, height=32),
            landmarks=[
                FaceLandmark(x=0.25, y=0.25, z=-0.01),
                FaceLandmark(x=0.50, y=0.50, z=0.00),
                FaceLandmark(x=0.75, y=0.75, z=0.01),
            ],
        )

    def extract(self, _image_bytes: bytes) -> RoiExtractionResult:
        box = FaceBoundingBox(x=8, y=8, width=32, height=32)
        roi_image = Image.new("RGB", (32, 32), color=(185, 145, 125))
        return RoiExtractionResult(
            face_bounding_box=box,
            landmark_count=468,
            rois=[
                RoiCrop(region="forehead", bounding_box=box, image=roi_image),
                RoiCrop(region="nose", bounding_box=box, image=roi_image),
                RoiCrop(region="left_cheek", bounding_box=box, image=roi_image),
                RoiCrop(region="right_cheek", bounding_box=box, image=roi_image),
            ],
        )

    def detect_landmarks(self, _image_bytes: bytes) -> LandmarkDetectionResult:
        return LandmarkDetectionResult(
            image=Image.new("RGB", (64, 64), color=(185, 145, 125)),
            face=self.face,
        )

    def crop_from_landmark(
        self,
        image_bytes: bytes,
        landmark_index: int,
        crop_size: int,
    ) -> LandmarkCropResult:
        return LandmarkCropResult(
            image=Image.new("RGB", (64, 64), color=(185, 145, 125)),
            face=self.face,
            landmark_index=landmark_index,
            bounding_box=FaceBoundingBox(x=16, y=16, width=32, height=32),
            crop=Image.new("RGB", (crop_size, crop_size), color=(185, 145, 125)),
        )


def _analysis_service() -> AnalysisService:
    return AnalysisService(
        inference_service=MockInferenceService(),
        baumann_service=BaumannService(),
        recommendation_service=get_recommendation_service(),
        roi_service=FakeRoiService(),
    )


def test_health_check() -> None:
    assert health_check() == {"status": "ok"}


def test_analyze_valid_image_returns_result() -> None:
    file = FakeUploadFile(content_type="image/jpeg", payload=_image_bytes())

    result = asyncio.run(
        analyze_skin(
            image=file,
            settings=get_settings(),
            analysis_service=_analysis_service(),
        )
    )

    assert result.analysis_id
    assert len(result.baumann_type) == 4
    assert result.recommended_products
    assert result.available_filters == ["All", "Cleanser", "Moisturizer", "Sun Care"]


def test_roi_preview_returns_debug_crops() -> None:
    file = FakeUploadFile(content_type="image/jpeg", payload=_image_bytes())

    result = asyncio.run(
        preview_roi_crops(
            image=file,
            settings=get_settings(),
            analysis_service=_analysis_service(),
        )
    )

    assert result.face.landmark_count == 468
    assert [roi.region for roi in result.rois] == [
        "forehead",
        "nose",
        "left_cheek",
        "right_cheek",
    ]
    assert result.rois[0].image_data_url.startswith("data:image/jpeg;base64,")


def test_landmark_preview_returns_all_landmarks() -> None:
    file = FakeUploadFile(content_type="image/jpeg", payload=_image_bytes())

    result = asyncio.run(
        preview_face_landmarks(
            image=file,
            settings=get_settings(),
            analysis_service=_analysis_service(),
        )
    )

    assert result.face.landmark_count == 3
    assert result.annotated_image_data_url.startswith("data:image/jpeg;base64,")
    assert [landmark.index for landmark in result.landmarks] == [0, 1, 2]
    assert result.landmarks[0].pixel_x == 16
    assert result.landmarks[0].pixel_y == 16


def test_landmark_crop_preview_returns_crop_from_selected_dot() -> None:
    file = FakeUploadFile(content_type="image/jpeg", payload=_image_bytes())

    result = asyncio.run(
        preview_landmark_crop(
            image=file,
            landmark_index=1,
            crop_size=224,
            settings=get_settings(),
            analysis_service=_analysis_service(),
        )
    )

    assert result.landmark.index == 1
    assert result.source_bounding_box.width == 32
    assert result.crop_size == 224
    assert result.crop_image_data_url.startswith("data:image/jpeg;base64,")


def test_analyze_rejects_unsupported_file_type() -> None:
    file = FakeUploadFile(content_type="text/plain", payload=b"not an image")

    try:
        asyncio.run(
            analyze_skin(
                image=file,
                settings=get_settings(),
                analysis_service=_analysis_service(),
            )
        )
    except Exception as error:
        assert getattr(error, "status_code") == 415
        assert error.detail["code"] == "unsupported_image_type"
    else:
        raise AssertionError("Unsupported uploads should fail.")
