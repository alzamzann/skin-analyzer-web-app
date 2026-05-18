from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_recommendation_service
from app.schemas.analysis import IngredientListResponse, ProductListResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter(tags=["recommendations"])


@router.get(
    "/ingredients",
    response_model=IngredientListResponse,
    response_model_by_alias=True,
)
def list_ingredients(
    baumann_type: str = Query(..., alias="baumannType"),
    recommendation_service: RecommendationService = Depends(get_recommendation_service),
) -> IngredientListResponse:
    return IngredientListResponse(
        baumann_type=baumann_type.upper(),
        include_all=True,
        ingredients=recommendation_service.recommend_ingredients(baumann_type.upper()),
    )


@router.get("/products", response_model=ProductListResponse, response_model_by_alias=True)
def list_products(
    baumann_type: str = Query(..., alias="baumannType"),
    category: str | None = None,
    top_k: int = Query(5, ge=1, le=20, alias="topK"),
    recommendation_service: RecommendationService = Depends(get_recommendation_service),
) -> ProductListResponse:
    products, total_candidates = recommendation_service.recommend_products(
        baumann_type=baumann_type.upper(),
        category=category,
        top_k=top_k,
    )
    return ProductListResponse(
        baumann_type=baumann_type.upper(),
        category=category,
        total_candidates=total_candidates,
        top_k=top_k,
        products=products,
    )
