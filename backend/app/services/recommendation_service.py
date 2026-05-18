from app.repositories.catalog_repository import CatalogRepository
from app.schemas.analysis import RecommendedIngredient, RecommendedProduct
from app.schemas.domain import IngredientRecord, ProductRecord
from app.services.text import normalize_text, split_codes


class RecommendationService:
    def __init__(self, catalog_repository: CatalogRepository):
        self.catalog_repository = catalog_repository

    def get_available_filters(self) -> list[str]:
        categories = {
            product.category
            for product in self.catalog_repository.products
            if product.category in {"Cleanser", "Moisturizer", "Sun Care"}
        }
        ordered = [
            category
            for category in ["Cleanser", "Moisturizer", "Sun Care"]
            if category in categories
        ]
        return ["All", *ordered]

    def recommend_ingredients(
        self, baumann_type: str, include_all: bool = True
    ) -> list[RecommendedIngredient]:
        records = [
            ingredient
            for ingredient in self.catalog_repository.ingredients
            if self._is_suitable(ingredient, baumann_type, include_all)
        ]

        return [self._to_ingredient_schema(record) for record in records[:8]]

    def recommend_products(
        self,
        baumann_type: str,
        category: str | None = None,
        top_k: int = 5,
    ) -> tuple[list[RecommendedProduct], int]:
        ingredients = self.recommend_ingredients(baumann_type)
        ingredient_terms = [ingredient.name for ingredient in ingredients]
        products = self.catalog_repository.products

        if category and category != "All":
            products = [product for product in products if product.category == category]

        scored = [
            self._score_product(product, ingredient_terms)
            for product in products
        ]
        scored.sort(key=lambda product: product.similarity_score, reverse=True)
        return scored[:top_k], len(scored)

    def _is_suitable(
        self, ingredient: IngredientRecord, baumann_type: str, include_all: bool
    ) -> bool:
        best_for_codes = split_codes(ingredient.best_for)
        if baumann_type.upper() in best_for_codes:
            return True
        return include_all and "ALL" in best_for_codes

    def _to_ingredient_schema(
        self, ingredient: IngredientRecord
    ) -> RecommendedIngredient:
        reason = (
            ingredient.topical_use
            or ingredient.can_used_to
            or "Recommended for this Baumann skin profile."
        )
        return RecommendedIngredient(
            name=ingredient.name,
            reason=reason,
            ingredient_type=ingredient.ingredient_type,
            alternate_name=ingredient.alternate_name,
            inci_name=ingredient.inci_name,
            best_for=ingredient.best_for,
            can_used_to=ingredient.can_used_to,
            not_recommend=ingredient.not_recommend,
            personal_care_category=ingredient.personal_care_category,
            topical_use=ingredient.topical_use,
        )

    def _score_product(
        self, product: ProductRecord, ingredient_terms: list[str]
    ) -> RecommendedProduct:
        normalized_product_ingredients = normalize_text(product.ingredients)
        matched = [
            term
            for term in ingredient_terms
            if normalize_text(term) and normalize_text(term) in normalized_product_ingredients
        ]
        score = round(len(matched) / max(len(ingredient_terms), 1), 3)

        return RecommendedProduct(
            id=product.bpom_id or normalize_text(product.name).replace(" ", "-"),
            bpom_id=product.bpom_id,
            name=product.name,
            brand=product.brand,
            category=product.category,
            description=product.description,
            price=product.price,
            image_url=product.image_url,
            product_url=product.product_url,
            matched_ingredients=matched,
            similarity_score=score,
        )
