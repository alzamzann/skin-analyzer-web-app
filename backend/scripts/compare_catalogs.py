from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import get_settings
from app.database import create_database_engine, create_session_factory
from app.repositories.catalog_repository import CatalogRepository
from app.repositories.database_catalog_repository import DatabaseCatalogRepository
from app.services.recommendation_service import RecommendationService


BAUMANN_TYPES = [
    f"{oiliness}{sensitivity}{pigmentation}{aging}"
    for oiliness in "DO"
    for sensitivity in "SR"
    for pigmentation in "PN"
    for aging in "WT"
]


def main() -> None:
    settings = get_settings()
    csv_service = RecommendationService(CatalogRepository(settings.data_dir))
    engine = create_database_engine(settings.database_url)
    try:
        database_service = RecommendationService(
            DatabaseCatalogRepository(create_session_factory(engine))
        )
        _assert_catalog_parity(csv_service, database_service)
    finally:
        engine.dispose()

    print("Catalog parity audit passed for all Baumann types and category filters.")


def _assert_catalog_parity(
    csv_service: RecommendationService,
    database_service: RecommendationService,
) -> None:
    if (
        csv_service.catalog_repository.ingredients
        != database_service.catalog_repository.ingredients
    ):
        raise AssertionError("Ingredient records differ between CSV and database.")
    if (
        csv_service.catalog_repository.products
        != database_service.catalog_repository.products
    ):
        raise AssertionError("Product records differ between CSV and database.")

    filters = csv_service.get_product_category_filters()
    contexts: list[tuple[str | None, str | None]] = [(None, None)]
    for category_filter in filters:
        contexts.append((category_filter.main_category, None))
        contexts.extend(
            (category_filter.main_category, subcategory)
            for subcategory in category_filter.sub_categories
        )

    for baumann_type in BAUMANN_TYPES:
        _assert_equal(
            f"{baumann_type} ingredients",
            csv_service.recommend_ingredients(baumann_type),
            database_service.recommend_ingredients(baumann_type),
        )
        _assert_equal(
            f"{baumann_type} routine",
            csv_service.recommend_routine_products(baumann_type),
            database_service.recommend_routine_products(baumann_type),
        )

        for main_category, sub_category in contexts:
            context = f"{baumann_type} {main_category or 'All'} {sub_category or 'All'}"
            _assert_equal(
                context,
                csv_service.recommend_products(
                    baumann_type,
                    main_category=main_category,
                    sub_category=sub_category,
                    top_k=20,
                ),
                database_service.recommend_products(
                    baumann_type,
                    main_category=main_category,
                    sub_category=sub_category,
                    top_k=20,
                ),
            )


def _assert_equal(context: str, csv_value: object, database_value: object) -> None:
    if csv_value != database_value:
        raise AssertionError(f"Catalog parity failed for {context}.")


if __name__ == "__main__":
    main()
