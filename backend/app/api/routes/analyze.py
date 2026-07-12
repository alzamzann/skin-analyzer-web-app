from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from app.api.dependencies import get_analysis_service
from app.core.config import Settings, get_settings
from app.schemas.analysis import (
    AnalysisResult,
    BaumannAxisDecision,
    BaumannConditionPreviewResponse,
    BaumannThresholdPreviewResponse,
    BoundingBox,
    FaceMetadata,
    LandmarkCropPreviewResponse,
    LandmarkPoint,
    LandmarkPreviewResponse,
    LabelPrediction,
    RoiPreview,
    RoiPreviewResponse,
)
from app.services.baumann_service import (
    BAUMANN_AXIS_SOURCE_LABELS,
    BaumannService,
    max_score_for_labels,
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


@router.post(
    "/analyze/baumann-threshold-preview",
    response_model=BaumannThresholdPreviewResponse,
    response_model_by_alias=True,
)
async def preview_baumann_threshold(
    image: UploadFile = File(...),
    threshold: float = Query(0.5, ge=0, le=1),
    settings: Settings = Depends(get_settings),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> BaumannThresholdPreviewResponse:
    try:
        image_bytes = await read_validated_image(image, settings)
        roi_result = analysis_service.extract_roi_preview(image_bytes)
        raw_predictions = analysis_service.inference_service.predict_rois(
            [roi.image for roi in roi_result.rois]
        )
        predictions = [
            LabelPrediction(
                label=prediction.label,
                detected=prediction.confidence >= threshold,
                confidence=prediction.confidence,
            )
            for prediction in raw_predictions
        ]
        (
            baumann_type,
            attributes,
            mapping,
            confidence,
            description,
        ) = analysis_service.baumann_service.map_predictions(predictions)

        return BaumannThresholdPreviewResponse(
            threshold=threshold,
            face=FaceMetadata(
                bounding_box=_to_schema_box(roi_result.face_bounding_box),
                landmark_count=roi_result.landmark_count,
            ),
            baumann_type=baumann_type,
            confidence=confidence,
            description=description,
            attributes=attributes,
            baumann_mapping=mapping,
            detected_labels=predictions,
            decisions=_to_baumann_axis_decisions(predictions, threshold),
        )
    except AnalysisError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"message": error.message, "code": error.code},
        ) from error


@router.get(
    "/analyze/baumann-condition-preview",
    response_model=BaumannConditionPreviewResponse,
    response_model_by_alias=True,
)
def preview_baumann_condition_threshold(
    acne: float = Query(..., ge=0, le=1),
    blackheads: float = Query(..., ge=0, le=1),
    enlarged_pores: float = Query(..., alias="enlargedPores", ge=0, le=1),
    pigmentation: float = Query(..., ge=0, le=1),
    redness: float = Query(..., ge=0, le=1),
    wrinkles: float = Query(..., ge=0, le=1),
    threshold: float = Query(0.7, ge=0, le=1),
) -> BaumannConditionPreviewResponse:
    predictions = _condition_scores_to_predictions(
        acne=acne,
        blackheads=blackheads,
        enlarged_pores=enlarged_pores,
        pigmentation=pigmentation,
        redness=redness,
        wrinkles=wrinkles,
        threshold=threshold,
    )
    (
        baumann_type,
        attributes,
        mapping,
        confidence,
        description,
    ) = BaumannService().map_predictions(predictions)

    return BaumannConditionPreviewResponse(
        threshold=threshold,
        rule="score >= threshold selects the positive Baumann side",
        baumann_type=baumann_type,
        confidence=confidence,
        description=description,
        attributes=attributes,
        baumann_mapping=mapping,
        detected_labels=predictions,
        decisions=_to_condition_axis_decisions(
            acne=acne,
            blackheads=blackheads,
            enlarged_pores=enlarged_pores,
            pigmentation=pigmentation,
            redness=redness,
            wrinkles=wrinkles,
            threshold=threshold,
        ),
    )


def _to_schema_box(box: FaceBoundingBox) -> BoundingBox:
    return BoundingBox(x=box.x, y=box.y, width=box.width, height=box.height)


def _to_baumann_axis_decisions(
    predictions: list[LabelPrediction],
    threshold: float,
) -> list[BaumannAxisDecision]:
    axis_rules = [
        {
            "axis": "oiliness",
            "source_labels": BAUMANN_AXIS_SOURCE_LABELS["oiliness"],
            "score": max_score_for_labels(
                predictions,
                BAUMANN_AXIS_SOURCE_LABELS["oiliness"],
            ),
            "positive_code": "O",
            "negative_code": "D",
            "positive_result": "Oily",
            "negative_result": "Dry",
        },
        {
            "axis": "sensitivity",
            "source_labels": BAUMANN_AXIS_SOURCE_LABELS["sensitivity"],
            "score": max_score_for_labels(
                predictions,
                BAUMANN_AXIS_SOURCE_LABELS["sensitivity"],
            ),
            "positive_code": "S",
            "negative_code": "R",
            "positive_result": "Sensitive",
            "negative_result": "Resistant",
        },
        {
            "axis": "pigmentation",
            "source_labels": BAUMANN_AXIS_SOURCE_LABELS["pigmentation"],
            "score": max_score_for_labels(
                predictions,
                BAUMANN_AXIS_SOURCE_LABELS["pigmentation"],
            ),
            "positive_code": "P",
            "negative_code": "N",
            "positive_result": "Pigmented",
            "negative_result": "Non-pigmented",
        },
        {
            "axis": "aging",
            "source_labels": BAUMANN_AXIS_SOURCE_LABELS["wrinkle_tendency"],
            "score": max_score_for_labels(
                predictions,
                BAUMANN_AXIS_SOURCE_LABELS["wrinkle_tendency"],
            ),
            "positive_code": "W",
            "negative_code": "T",
            "positive_result": "Wrinkle-prone",
            "negative_result": "Tight/Firm",
        },
    ]

    decisions = []
    for rule in axis_rules:
        is_positive = rule["score"] >= threshold
        decisions.append(
            BaumannAxisDecision(
                axis=rule["axis"],
                source_labels=rule["source_labels"],
                score=rule["score"],
                threshold=threshold,
                code=rule["positive_code"] if is_positive else rule["negative_code"],
                result=(
                    rule["positive_result"] if is_positive else rule["negative_result"]
                ),
                positive_code=rule["positive_code"],
                negative_code=rule["negative_code"],
                positive_result=rule["positive_result"],
                negative_result=rule["negative_result"],
            )
        )

    return decisions


def _condition_scores_to_predictions(
    acne: float,
    blackheads: float,
    enlarged_pores: float,
    pigmentation: float,
    redness: float,
    wrinkles: float,
    threshold: float,
) -> list[LabelPrediction]:
    return [
        LabelPrediction(
            label="Acne",
            detected=acne >= threshold,
            confidence=acne,
        ),
        LabelPrediction(
            label="Blackheads",
            detected=blackheads >= threshold,
            confidence=blackheads,
        ),
        LabelPrediction(
            label="Enlarged Pores",
            detected=enlarged_pores >= threshold,
            confidence=enlarged_pores,
        ),
        LabelPrediction(
            label="Pigmentation",
            detected=pigmentation >= threshold,
            confidence=pigmentation,
        ),
        LabelPrediction(
            label="Redness",
            detected=redness >= threshold,
            confidence=redness,
        ),
        LabelPrediction(
            label="Wrinkles",
            detected=wrinkles >= threshold,
            confidence=wrinkles,
        ),
    ]


def _to_condition_axis_decisions(
    acne: float,
    blackheads: float,
    enlarged_pores: float,
    pigmentation: float,
    redness: float,
    wrinkles: float,
    threshold: float,
) -> list[BaumannAxisDecision]:
    oiliness_score = max(blackheads, enlarged_pores)
    sensitivity_score = max(acne, redness)
    pigmentation_score = pigmentation
    wrinkle_score = wrinkles

    axis_rules = [
        {
            "axis": "oiliness",
            "source_labels": ["Blackheads", "Enlarged Pores"],
            "score": oiliness_score,
            "positive_code": "O",
            "negative_code": "D",
            "positive_result": "Oily",
            "negative_result": "Dry",
        },
        {
            "axis": "sensitivity",
            "source_labels": ["Acne", "Redness"],
            "score": sensitivity_score,
            "positive_code": "S",
            "negative_code": "R",
            "positive_result": "Sensitive",
            "negative_result": "Resistant",
        },
        {
            "axis": "pigmentation",
            "source_labels": ["Pigmentation"],
            "score": pigmentation_score,
            "positive_code": "P",
            "negative_code": "N",
            "positive_result": "Pigmented",
            "negative_result": "Non-pigmented",
        },
        {
            "axis": "aging",
            "source_labels": ["Wrinkles"],
            "score": wrinkle_score,
            "positive_code": "W",
            "negative_code": "T",
            "positive_result": "Wrinkle-prone",
            "negative_result": "Tight/Firm",
        },
    ]

    decisions = []
    for rule in axis_rules:
        is_positive = rule["score"] >= threshold
        decisions.append(
            BaumannAxisDecision(
                axis=rule["axis"],
                source_labels=rule["source_labels"],
                score=rule["score"],
                threshold=threshold,
                code=rule["positive_code"] if is_positive else rule["negative_code"],
                result=(
                    rule["positive_result"] if is_positive else rule["negative_result"]
                ),
                positive_code=rule["positive_code"],
                negative_code=rule["negative_code"],
                positive_result=rule["positive_result"],
                negative_result=rule["negative_result"],
            )
        )

    return decisions


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
