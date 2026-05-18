from app.repositories.catalog_repository import CatalogRepository
from app.services.recommendation_service import RecommendationService


def test_seed_recommendations_work_when_csvs_are_missing(tmp_path) -> None:
    repository = CatalogRepository(tmp_path)
    repository.load()
    service = RecommendationService(repository)

    ingredients = service.recommend_ingredients("DSPT")
    products, total_candidates = service.recommend_products("DSPT")

    assert total_candidates == 3
    assert [category for category in service.get_available_filters()] == [
        "All",
        "Cleanser",
        "Moisturizer",
        "Sun Care",
    ]
    assert any(ingredient.name == "Ceramides" for ingredient in ingredients)
    assert products[0].similarity_score >= products[-1].similarity_score
