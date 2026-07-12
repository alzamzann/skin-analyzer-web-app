from functools import lru_cache

from app.core.config import get_settings
from app.database import create_database_engine, create_session_factory
from app.repositories.database_catalog_repository import DatabaseCatalogRepository
from app.services.analysis_service import AnalysisService
from app.services.baumann_service import BaumannService
from app.services.face_detection_service import MediaPipeFaceDetectionService
from app.services.face_quality_service import FaceQualityValidationService
from app.services.inference_service import TorchInferenceService
from app.services.mock_inference_service import MockInferenceService
from app.services.recommendation_service import RecommendationService
from app.services.roi_service import RoiService


@lru_cache
def get_database_engine():
    return create_database_engine(get_settings().database_url)


@lru_cache
def get_session_factory():
    return create_session_factory(get_database_engine())


@lru_cache
def get_catalog_repository() -> DatabaseCatalogRepository:
    repository = DatabaseCatalogRepository(get_session_factory())
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
        face_quality_service=FaceQualityValidationService(),
        crop_size=settings.roi_crop_size,
    )


@lru_cache
def get_inference_service():
    settings = get_settings()
    if settings.mock_inference_enabled:
        return MockInferenceService(
            threshold=settings.skin_model_threshold,
            label_thresholds=settings.skin_model_label_thresholds,
        )

    return TorchInferenceService(
        model_path=settings.skin_model_path,
        labels=settings.skin_model_labels,
        threshold=settings.skin_model_threshold,
        label_thresholds=settings.skin_model_label_thresholds,
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
