from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from app.api.dependencies import get_analysis_service
from app.core.config import Settings, get_settings
from app.schemas.analysis import (
    AnalysisResult,
    BoundingBox,
    FaceMetadata,
    LandmarkCropPreviewResponse,
    LandmarkPoint,
    LandmarkPreviewResponse,
    RoiPreview,
    RoiPreviewResponse,
)
from app.services.analysis_service import AnalysisService
from app.services.errors import AnalysisError
from app.services.face_detection_service import FaceBoundingBox, FaceLandmark
from app.services.upload_validation_service import read_validated_image

router = APIRouter(tags=["analysis"])


@router.post("/analyze", response_model=AnalysisResult, response_model_by_alias=True)
async def analyze_skin(
    image: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> AnalysisResult:
    try:
        image_bytes = await read_validated_image(image, settings)
        return analysis_service.analyze(image_bytes)
    except AnalysisError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"message": error.message, "code": error.code},
        ) from error


@router.post(
    "/analyze/roi-preview",
    response_model=RoiPreviewResponse,
    response_model_by_alias=True,
)
async def preview_roi_crops(
    image: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> RoiPreviewResponse:
    try:
        image_bytes = await read_validated_image(image, settings)
        roi_result = analysis_service.extract_roi_preview(image_bytes)
        return RoiPreviewResponse(
            face=FaceMetadata(
                bounding_box=_to_schema_box(roi_result.face_bounding_box),
                landmark_count=roi_result.landmark_count,
            ),
            rois=[
                RoiPreview(
                    region=roi.region,
                    bounding_box=_to_schema_box(roi.bounding_box),
                    image_data_url=roi.to_data_url(),
                )
                for roi in roi_result.rois
            ],
        )
    except AnalysisError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"message": error.message, "code": error.code},
        ) from error


@router.post(
    "/analyze/landmarks-preview",
    response_model=LandmarkPreviewResponse,
    response_model_by_alias=True,
)
async def preview_face_landmarks(
    image: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> LandmarkPreviewResponse:
    try:
        image_bytes = await read_validated_image(image, settings)
        landmark_result = analysis_service.extract_landmark_preview(image_bytes)
        return LandmarkPreviewResponse(
            image_width=landmark_result.image.width,
            image_height=landmark_result.image.height,
            face=FaceMetadata(
                bounding_box=_to_schema_box(landmark_result.face.bounding_box),
                landmark_count=len(landmark_result.face.landmarks),
            ),
            annotated_image_data_url=landmark_result.to_annotated_data_url(),
            landmarks=[
                _to_schema_landmark(
                    index,
                    landmark,
                    landmark_result.image.width,
                    landmark_result.image.height,
                )
                for index, landmark in enumerate(landmark_result.face.landmarks)
            ],
        )
    except AnalysisError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"message": error.message, "code": error.code},
        ) from error


@router.post(
    "/analyze/landmark-crop-preview",
    response_model=LandmarkCropPreviewResponse,
    response_model_by_alias=True,
)
async def preview_landmark_crop(
    image: UploadFile = File(...),
    landmark_index: int = Query(..., ge=0),
    crop_size: int = Query(224, ge=32, le=1024),
    settings: Settings = Depends(get_settings),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> LandmarkCropPreviewResponse:
    try:
        image_bytes = await read_validated_image(image, settings)
        crop_result = analysis_service.crop_from_landmark(
            image_bytes=image_bytes,
            landmark_index=landmark_index,
            crop_size=crop_size,
        )
        landmark = crop_result.face.landmarks[crop_result.landmark_index]
        return LandmarkCropPreviewResponse(
            image_width=crop_result.image.width,
            image_height=crop_result.image.height,
            face=FaceMetadata(
                bounding_box=_to_schema_box(crop_result.face.bounding_box),
                landmark_count=len(crop_result.face.landmarks),
            ),
            landmark=_to_schema_landmark(
                crop_result.landmark_index,
                landmark,
                crop_result.image.width,
                crop_result.image.height,
            ),
            source_bounding_box=_to_schema_box(crop_result.bounding_box),
            crop_size=crop_size,
            crop_image_data_url=crop_result.to_crop_data_url(),
        )
    except AnalysisError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"message": error.message, "code": error.code},
        ) from error


def _to_schema_box(box: FaceBoundingBox) -> BoundingBox:
    return BoundingBox(x=box.x, y=box.y, width=box.width, height=box.height)


def _to_schema_landmark(
    index: int,
    landmark: FaceLandmark,
    image_width: int,
    image_height: int,
) -> LandmarkPoint:
    return LandmarkPoint(
        index=index,
        x=landmark.x,
        y=landmark.y,
        z=landmark.z,
        pixel_x=round(landmark.x * image_width),
        pixel_y=round(landmark.y * image_height),
    )
