from functools import lru_cache

from app.core.config import get_settings
from app.repositories.catalog_repository import CatalogRepository
from app.services.analysis_service import AnalysisService
from app.services.baumann_service import BaumannService
from app.services.mock_inference_service import MockInferenceService
from app.services.recommendation_service import RecommendationService


@lru_cache
def get_catalog_repository() -> CatalogRepository:
    repository = CatalogRepository(get_settings().data_dir)
    repository.load()
    return repository


@lru_cache
def get_recommendation_service() -> RecommendationService:
    return RecommendationService(get_catalog_repository())


@lru_cache
def get_analysis_service() -> AnalysisService:
    return AnalysisService(
        inference_service=MockInferenceService(),
        baumann_service=BaumannService(),
        recommendation_service=get_recommendation_service(),
    )
