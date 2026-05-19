from functools import lru_cache

from app.core.config import get_settings
from app.repositories.catalog_repository import CatalogRepository
from app.services.analysis_service import AnalysisService
from app.services.baumann_service import BaumannService
from app.services.face_detection_service import MediaPipeFaceDetectionService
from app.services.inference_service import TorchInferenceService
from app.services.mock_inference_service import MockInferenceService
from app.services.recommendation_service import RecommendationService
from app.services.roi_service import RoiService


@lru_cache
def get_catalog_repository() -> CatalogRepository:
    repository = CatalogRepository(get_settings().data_dir)
    repository.load()
    return repository


@lru_cache
def get_recommendation_service() -> RecommendationService:
    return RecommendationService(get_catalog_repository())


@lru_cache
def get_roi_service() -> RoiService:
    settings = get_settings()
    return RoiService(
        face_detection_service=MediaPipeFaceDetectionService(
            settings.face_landmarker_model_path
        ),
        crop_size=settings.roi_crop_size,
    )


@lru_cache
def get_inference_service():
    settings = get_settings()
    if settings.mock_inference_enabled:
        return MockInferenceService()

    return TorchInferenceService(
        model_path=settings.skin_model_path,
        labels=settings.skin_model_labels,
        threshold=settings.skin_model_threshold,
        arch=settings.skin_model_arch,
        image_size=settings.roi_crop_size,
    )


@lru_cache
def get_analysis_service() -> AnalysisService:
    return AnalysisService(
        inference_service=get_inference_service(),
        baumann_service=BaumannService(),
        recommendation_service=get_recommendation_service(),
        roi_service=get_roi_service(),
    )
