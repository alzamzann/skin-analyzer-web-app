from pathlib import Path

import pytest
from sqlalchemy import create_engine, select

from app.database import create_session_factory
from app.models import Base, Product
from app.repositories.catalog_repository import CatalogRepository
from app.repositories.database_catalog_repository import DatabaseCatalogRepository
from app.services.catalog_import_service import import_catalog
from app.services.recommendation_service import RecommendationService


def _session_factory(tmp_path: Path):
    engine = create_engine(f"sqlite+pysqlite:///{tmp_path / 'catalog.db'}")
    Base.metadata.create_all(engine)
    return engine, create_session_factory(engine)


def _write_catalog(data_dir: Path) -> None:
    (data_dir / "ingredients.csv").write_text(
        "\n".join(
            [
                (
                    "name,ingredient_type,alternate_name,inci_name,"
                    "important_chemical_component,best_for,can_used_to,"
                    "not_recommend,personal_care_category,topical_use"
                ),
                (
                    "Glycerin,humectant,,Glycerin,,ALL,hydration,none,"
                    "moisturizing,hydration support"
                ),
                (
                    "Ceramides,lipid,,Ceramide NP; Ceramide AP,,DRNT,"
                    "barrier,none,moisturizing,barrier support"
                ),
            ]
        ),
        encoding="utf-8",
    )
    (data_dir / "products.csv").write_text(
        "\n".join(
            [
                (
                    "bpom_id,name,brand,category,description,price,ingredients,"
                    "image_url,product_url,incidecoder_verif"
                ),
                "NA1,Wash,Brand,Face Wash,Desc,10000,Glycerin,,,",
                (
                    'NA1,Cream,Brand,Face Cream And Lotion,Desc,"45.650,00",'
                    '"Glycerin, Ceramide NP",,,'
                ),
                ",Serum,Brand,Face Serum,Desc,20000,Glycerin,,,",
            ]
        ),
        encoding="utf-8",
    )


def test_import_is_repeatable_and_preserves_csv_repository_behavior(tmp_path) -> None:
    _write_catalog(tmp_path)
    engine, session_factory = _session_factory(tmp_path)

    first = import_catalog(session_factory, tmp_path)
    second = import_catalog(session_factory, tmp_path)

    database_repository = DatabaseCatalogRepository(session_factory)
    csv_repository = CatalogRepository(tmp_path)

    assert first == second
    assert first.ingredient_count == 2
    assert first.product_count == 3
    assert database_repository.ingredients == csv_repository.ingredients
    assert database_repository.products == csv_repository.products

    csv_products = RecommendationService(csv_repository).recommend_products(
        "DRNT", top_k=10
    )
    database_products = RecommendationService(
        database_repository
    ).recommend_products("DRNT", top_k=10)
    assert database_products == csv_products

    engine.dispose()


def test_import_preserves_duplicate_and_missing_bpom_values(tmp_path) -> None:
    _write_catalog(tmp_path)
    engine, session_factory = _session_factory(tmp_path)
    import_catalog(session_factory, tmp_path)

    with session_factory() as session:
        products = session.scalars(
            select(Product).order_by(Product.source_order)
        ).all()

    assert [product.public_id for product in products] == [
        "NA1",
        "NA1",
        "product-3",
    ]
    assert [product.bpom_id for product in products] == ["NA1", "NA1", None]
    engine.dispose()


def test_database_repository_rejects_empty_catalog(tmp_path) -> None:
    engine, session_factory = _session_factory(tmp_path)

    with pytest.raises(RuntimeError, match="database catalog is empty"):
        DatabaseCatalogRepository(session_factory).load()

    engine.dispose()


def test_failed_import_does_not_replace_existing_catalog(tmp_path) -> None:
    _write_catalog(tmp_path)
    engine, session_factory = _session_factory(tmp_path)
    import_catalog(session_factory, tmp_path)

    (tmp_path / "products.csv").write_text(
        "bpom_id,name,brand,category,description,price,ingredients\n"
        "NA1,,Brand,Face Wash,Desc,10000,Glycerin\n",
        encoding="utf-8",
    )

    with pytest.raises(ValueError, match="No valid product rows"):
        import_catalog(session_factory, tmp_path)

    repository = DatabaseCatalogRepository(session_factory)
    assert len(repository.products) == 3
    engine.dispose()


def test_current_catalog_imports_expected_row_counts(tmp_path) -> None:
    data_dir = Path(__file__).resolve().parents[1] / "app" / "data"
    engine, session_factory = _session_factory(tmp_path)

    result = import_catalog(session_factory, data_dir)

    assert result.ingredient_count == 73
    assert result.product_count == 1905
    assert result.main_category_count == 4
    assert result.sub_category_count == 18
    engine.dispose()
