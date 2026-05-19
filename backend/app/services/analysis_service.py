from uuid import uuid4

from app.schemas.analysis import AnalysisResult
from app.services.baumann_service import BaumannService
from app.services.recommendation_service import RecommendationService
from app.services.roi_service import (
    LandmarkDetectionResult,
    LandmarkCropResult,
    RoiExtractionResult,
    RoiService,
)


DISCLAIMER = (
    "Dermalyzer provides educational skincare guidance only and is not a "
    "medical diagnosis. Consult a dermatologist for medical concerns."
)


class AnalysisService:
    def __init__(
        self,
        inference_service,
        baumann_service: BaumannService,
        recommendation_service: RecommendationService,
        roi_service: RoiService,
    ):
        self.inference_service = inference_service
        self.baumann_service = baumann_service
        self.recommendation_service = recommendation_service
        self.roi_service = roi_service

    def analyze(self, image_bytes: bytes) -> AnalysisResult:
        roi_result = self.roi_service.extract(image_bytes)
        predictions = self.inference_service.predict_rois(
            [roi.image for roi in roi_result.rois]
        )
        (
            baumann_type,
            attributes,
            mapping,
            confidence,
            description,
        ) = self.baumann_service.map_predictions(predictions)
        ingredients = self.recommendation_service.recommend_ingredients(baumann_type)
        products, _ = self.recommendation_service.recommend_products(baumann_type)

        return AnalysisResult(
            analysis_id=str(uuid4()),
            baumann_type=baumann_type,
            confidence=confidence,
            description=description,
            attributes=attributes,
            detected_labels=predictions,
            baumann_mapping=mapping,
            recommended_ingredients=ingredients,
            recommended_products=products,
            available_filters=self.recommendation_service.get_available_filters(),
            disclaimer=DISCLAIMER,
        )

    def extract_roi_preview(self, image_bytes: bytes) -> RoiExtractionResult:
        return self.roi_service.extract(image_bytes)

    def extract_landmark_preview(self, image_bytes: bytes) -> LandmarkDetectionResult:
        return self.roi_service.detect_landmarks(image_bytes)

    def crop_from_landmark(
        self,
        image_bytes: bytes,
        landmark_index: int,
        crop_size: int,
    ) -> LandmarkCropResult:
        return self.roi_service.crop_from_landmark(
            image_bytes=image_bytes,
            landmark_index=landmark_index,
            crop_size=crop_size,
        )
