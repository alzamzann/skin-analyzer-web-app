from dataclasses import dataclass
from pathlib import Path

import pandas as pd
from sqlalchemy import delete
from sqlalchemy.orm import Session, sessionmaker

from app.models import Ingredient, MainCategory, Product, SubCategory
from app.repositories.catalog_repository import _clean_cell, _parse_price
from app.services.product_categories import (
    MAIN_CATEGORY_SUBCATEGORIES,
    OTHER_MAIN_CATEGORY,
    get_main_category,
    normalize_subcategory,
)


@dataclass(frozen=True)
class CatalogImportResult:
    ingredient_count: int
    product_count: int
    skipped_ingredients: int
    skipped_products: int
    main_category_count: int
    sub_category_count: int


@dataclass(frozen=True)
class ProductImportRow:
    source_order: int
    public_id: str
    bpom_id: str | None
    name: str
    brand: str
    category: str
    description: str | None
    price: int
    ingredients: str
    image_url: str | None
    product_url: str | None
    incidecoder_verif: str | None


def import_catalog(
    session_factory: sessionmaker[Session],
    data_dir: Path,
) -> CatalogImportResult:
    ingredient_rows, skipped_ingredients = _read_ingredients(data_dir)
    product_rows, skipped_products = _read_products(data_dir)

    if not ingredient_rows:
        raise ValueError("No valid ingredient rows were found.")
    if not product_rows:
        raise ValueError("No valid product rows were found.")

    with session_factory.begin() as session:
        session.execute(delete(Product))
        session.execute(delete(SubCategory))
        session.execute(delete(MainCategory))
        session.execute(delete(Ingredient))

        category_map = _insert_categories(session, product_rows)
        session.add_all(ingredient_rows)
        session.add_all(
            [
                Product(
                    source_order=row.source_order,
                    public_id=row.public_id,
                    bpom_id=row.bpom_id,
                    name=row.name,
                    brand=row.brand,
                    sub_category_id=category_map[row.category].id,
                    description=row.description,
                    price=row.price,
                    ingredients=row.ingredients,
                    image_url=row.image_url,
                    product_url=row.product_url,
                    incidecoder_verif=row.incidecoder_verif,
                )
                for row in product_rows
            ]
        )

    return CatalogImportResult(
        ingredient_count=len(ingredient_rows),
        product_count=len(product_rows),
        skipped_ingredients=skipped_ingredients,
        skipped_products=skipped_products,
        main_category_count=len(
            {get_main_category(row.category) for row in product_rows}
        ),
        sub_category_count=len({row.category for row in product_rows}),
    )


def _read_ingredients(data_dir: Path) -> tuple[list[Ingredient], int]:
    path = data_dir / "ingredients.csv"
    if not path.exists():
        raise FileNotFoundError(f"Ingredient CSV was not found: {path}")

    frame = pd.read_csv(path).dropna(axis=1, how="all")
    ingredients = []
    skipped = 0

    for index, row in enumerate(frame.to_dict(orient="records")):
        name = _clean_cell(row.get("name"))
        if not name:
            skipped += 1
            continue

        ingredients.append(
            Ingredient(
                source_order=index,
                name=name,
                ingredient_type=_clean_cell(row.get("ingredient_type")),
                alternate_name=_clean_cell(row.get("alternate_name")),
                inci_name=_clean_cell(row.get("inci_name")),
                important_chemical_component=_clean_cell(
                    row.get("important_chemical_component")
                ),
                best_for=_clean_cell(row.get("best_for")),
                can_used_to=_clean_cell(row.get("can_used_to")),
                not_recommend=_clean_cell(row.get("not_recommend")),
                personal_care_category=_clean_cell(
                    row.get("personal_care_category")
                ),
                topical_use=_clean_cell(row.get("topical_use")),
            )
        )

    return ingredients, skipped


def _read_products(data_dir: Path) -> tuple[list[ProductImportRow], int]:
    path = data_dir / "products.csv"
    if not path.exists():
        raise FileNotFoundError(f"Product CSV was not found: {path}")

    frame = pd.read_csv(path).dropna(axis=1, how="all")
    products = []
    skipped = 0

    for index, row in enumerate(frame.to_dict(orient="records")):
        name = _clean_cell(row.get("name"))
        if not name:
            skipped += 1
            continue

        bpom_id = _clean_cell(row.get("bpom_id"))
        products.append(
            ProductImportRow(
                source_order=index,
                public_id=bpom_id or f"product-{index + 1}",
                bpom_id=bpom_id,
                name=name,
                brand=_clean_cell(row.get("brand")) or "Unknown Brand",
                category=normalize_subcategory(_clean_cell(row.get("category"))),
                description=_clean_cell(row.get("description")),
                price=_parse_price(row.get("price")),
                ingredients=_clean_cell(row.get("ingredients")) or "",
                image_url=_clean_cell(row.get("image_url")),
                product_url=_clean_cell(row.get("product_url")),
                incidecoder_verif=_clean_cell(row.get("incidecoder_verif")),
            )
        )

    return products, skipped


def _insert_categories(
    session: Session,
    product_rows: list[ProductImportRow],
) -> dict[str, SubCategory]:
    present_subcategories = {row.category for row in product_rows}
    configured_main_order = list(MAIN_CATEGORY_SUBCATEGORIES)
    present_main_categories = {
        get_main_category(subcategory) for subcategory in present_subcategories
    }
    main_names = [
        name for name in configured_main_order if name in present_main_categories
    ]
    if OTHER_MAIN_CATEGORY in present_main_categories:
        main_names.append(OTHER_MAIN_CATEGORY)

    main_rows = {
        name: MainCategory(name=name, display_order=index)
        for index, name in enumerate(main_names)
    }
    session.add_all(main_rows.values())
    session.flush()

    subcategory_rows: dict[str, SubCategory] = {}
    for main_name in main_names:
        configured = MAIN_CATEGORY_SUBCATEGORIES.get(main_name, ())
        names = [
            name for name in configured if name in present_subcategories
        ]
        if main_name == OTHER_MAIN_CATEGORY:
            names = sorted(
                (
                    name
                    for name in present_subcategories
                    if get_main_category(name) == OTHER_MAIN_CATEGORY
                ),
                key=str.casefold,
            )

        for index, name in enumerate(names):
            subcategory_rows[name] = SubCategory(
                main_category_id=main_rows[main_name].id,
                name=name,
                display_order=index,
            )

    session.add_all(subcategory_rows.values())
    session.flush()
    return subcategory_rows
