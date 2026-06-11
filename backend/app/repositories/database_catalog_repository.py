from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload, sessionmaker

from app.models import Ingredient, Product
from app.schemas.domain import IngredientRecord, ProductRecord


class DatabaseCatalogRepository:
    def __init__(self, session_factory: sessionmaker[Session]):
        self.session_factory = session_factory
        self._ingredients: list[IngredientRecord] | None = None
        self._products: list[ProductRecord] | None = None

    def load(self) -> None:
        with self.session_factory() as session:
            ingredient_rows = session.scalars(
                select(Ingredient).order_by(Ingredient.source_order, Ingredient.id)
            ).all()
            product_rows = session.scalars(
                select(Product)
                .options(selectinload(Product.sub_category))
                .order_by(Product.source_order, Product.id)
            ).all()

        if not ingredient_rows or not product_rows:
            raise RuntimeError(
                "The database catalog is empty. Run scripts/import_catalog.py."
            )

        self._ingredients = [
            IngredientRecord(
                name=row.name,
                ingredient_type=row.ingredient_type,
                alternate_name=row.alternate_name,
                inci_name=row.inci_name,
                important_chemical_component=row.important_chemical_component,
                best_for=row.best_for,
                can_used_to=row.can_used_to,
                not_recommend=row.not_recommend,
                personal_care_category=row.personal_care_category,
                topical_use=row.topical_use,
            )
            for row in ingredient_rows
        ]
        self._products = [
            ProductRecord(
                bpom_id=row.public_id,
                name=row.name,
                brand=row.brand,
                category=row.sub_category.name,
                description=row.description,
                price=row.price,
                ingredients=row.ingredients,
                image_url=row.image_url,
                product_url=row.product_url,
                incidecoder_verif=row.incidecoder_verif,
            )
            for row in product_rows
        ]

    @property
    def ingredients(self) -> list[IngredientRecord]:
        if self._ingredients is None:
            self.load()
        return self._ingredients or []

    @property
    def products(self) -> list[ProductRecord]:
        if self._products is None:
            self.load()
        return self._products or []
