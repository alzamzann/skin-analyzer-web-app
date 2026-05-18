from uuid import uuid4

from app.schemas.analysis import AnalysisResult
from app.services.baumann_service import BaumannService
from app.services.mock_inference_service import MockInferenceService
from app.services.recommendation_service import RecommendationService


DISCLAIMER = (
    "Dermalyzer provides educational skincare guidance only and is not a "
    "medical diagnosis. Consult a dermatologist for medical concerns."
)


class AnalysisService:
    def __init__(
        self,
        inference_service: MockInferenceService,
        baumann_service: BaumannService,
        recommendation_service: RecommendationService,
    ):
        self.inference_service = inference_service
        self.baumann_service = baumann_service
        self.recommendation_service = recommendation_service

    def analyze(self, image_bytes: bytes) -> AnalysisResult:
        predictions = self.inference_service.predict(image_bytes)
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
