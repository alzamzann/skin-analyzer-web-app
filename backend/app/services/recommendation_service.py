from app.repositories.contracts import CatalogRepositoryProtocol
from app.schemas.analysis import (
    ProductCategoryFilter,
    RecommendedIngredient,
    RecommendedProduct,
)
from app.schemas.domain import IngredientRecord, ProductRecord
from app.services.product_categories import (
    ROUTINE_MAIN_CATEGORY_ORDER,
    get_main_category,
    group_available_subcategories,
    normalize_subcategory,
)
from app.services.text import normalize_text, split_codes, split_terms


class RecommendationService:
    def __init__(self, catalog_repository: CatalogRepositoryProtocol):
        self.catalog_repository = catalog_repository

    def get_available_filters(self) -> list[str]:
        return [
            "All",
            *[
                subcategory
                for category_filter in self.get_product_category_filters()
                for subcategory in category_filter.sub_categories
            ],
        ]

    def get_product_category_filters(self) -> list[ProductCategoryFilter]:
        return [
            ProductCategoryFilter(
                main_category=main_category,
                sub_categories=subcategories,
            )
            for main_category, subcategories in group_available_subcategories(
                self.catalog_repository.products
            ).items()
        ]

    def recommend_ingredients(
        self, baumann_type: str, include_all: bool = True
    ) -> list[RecommendedIngredient]:
        records = [
            ingredient
            for ingredient in self.catalog_repository.ingredients
            if self._is_suitable(ingredient, baumann_type, include_all)
        ]

        return [self._to_ingredient_schema(record) for record in records]

    def recommend_products(
        self,
        baumann_type: str,
        category: str | None = None,
        main_category: str | None = None,
        sub_category: str | None = None,
        top_k: int = 5,
    ) -> tuple[list[RecommendedProduct], int, int]:
        ingredient_records = [
            ingredient
            for ingredient in self.catalog_repository.ingredients
            if self._is_suitable(ingredient, baumann_type, include_all=True)
        ]

        total_ingredients = len(ingredient_records)

        products = self._filter_products(
            category=category,
            main_category=main_category,
            sub_category=sub_category,
        )

        scored = [
            self._score_product(
                product=product,
                ingredient_records=ingredient_records,
                total_ingredients=total_ingredients,
            )
            for product in products
        ]
        scored = [product for product in scored if product.similarity_score > 0]
        scored.sort(
            key=lambda product: (
                product.similarity_score,
                len(product.matched_ingredients),
            ),
            reverse=True,
        )
        return scored[:top_k], len(scored), total_ingredients

    def recommend_routine_products(self, baumann_type: str) -> list[RecommendedProduct]:
        available_main_categories = {
            category_filter.main_category
            for category_filter in self.get_product_category_filters()
        }
        routine_products = []

        for main_category in ROUTINE_MAIN_CATEGORY_ORDER:
            if main_category not in available_main_categories:
                continue

            products, _, _ = self.recommend_products(
                baumann_type=baumann_type,
                main_category=main_category,
                top_k=1,
            )
            routine_products.extend(products)

        return routine_products

    def _filter_products(
        self,
        category: str | None,
        main_category: str | None,
        sub_category: str | None,
    ) -> list[ProductRecord]:
        groups = group_available_subcategories(self.catalog_repository.products)
        normalized_main = self._normalize_main_category(main_category, groups)
        legacy_subcategory = None if category in {None, "All"} else category

        if legacy_subcategory and sub_category:
            if normalize_subcategory(legacy_subcategory) != normalize_subcategory(
                sub_category
            ):
                raise ValueError("category and subCategory must identify the same category")

        selected_subcategory = sub_category or legacy_subcategory
        normalized_subcategory = (
            normalize_subcategory(selected_subcategory)
            if selected_subcategory and selected_subcategory != "All"
            else None
        )

        if normalized_subcategory:
            available_subcategories = {
                subcategory
                for subcategories in groups.values()
                for subcategory in subcategories
            }
            if normalized_subcategory not in available_subcategories:
                raise ValueError(f"Unknown subcategory: {selected_subcategory}")
            if normalized_main and normalized_subcategory not in groups[normalized_main]:
                raise ValueError(
                    f"Subcategory {normalized_subcategory} does not belong to "
                    f"{normalized_main}"
                )

        if normalized_subcategory:
            return [
                product
                for product in self.catalog_repository.products
                if product.category == normalized_subcategory
            ]

        if normalized_main:
            allowed_subcategories = set(groups[normalized_main])
            return [
                product
                for product in self.catalog_repository.products
                if product.category in allowed_subcategories
            ]

        return self.catalog_repository.products

    def _normalize_main_category(
        self,
        main_category: str | None,
        groups: dict[str, list[str]],
    ) -> str | None:
        if not main_category or main_category == "All":
            return None

        matching_category = next(
            (
                category
                for category in groups
                if category.casefold() == main_category.strip().casefold()
            ),
            None,
        )
        if matching_category is None:
            raise ValueError(f"Unknown main category: {main_category}")
        return matching_category

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
        self,
        product: ProductRecord,
        ingredient_records: list[IngredientRecord],
        total_ingredients: int,
    ) -> RecommendedProduct:
        normalized_product_ingredients = normalize_text(product.ingredients)
        matched = []

        for ingredient in ingredient_records:
            if self._ingredient_matches_product(
                ingredient, normalized_product_ingredients
            ):
                matched.append(ingredient.name)

        matched_count = len(matched)
        score = round(matched_count / max(total_ingredients, 1), 3)

        return RecommendedProduct(
            id=product.bpom_id or normalize_text(product.name).replace(" ", "-"),
            bpom_id=product.bpom_id,
            name=product.name,
            brand=product.brand,
            category=product.category,
            main_category=get_main_category(product.category),
            sub_category=product.category,
            description=product.description,
            price=product.price,
            image_url=product.image_url,
            product_url=product.product_url,
            matched_ingredients=matched,
            matched_count=matched_count,
            similarity_score=score,
        )

    def _ingredient_matches_product(
        self, ingredient: IngredientRecord, normalized_product_ingredients: str
    ) -> bool:
        terms = self._ingredient_match_terms(ingredient)
        return any(term in normalized_product_ingredients for term in terms)

    def _ingredient_match_terms(self, ingredient: IngredientRecord) -> list[str]:
        terms = split_terms(ingredient.inci_name)

        cleaned_terms = []
        for term in terms:
            if not term or len(term) < 3:
                continue
            if term not in cleaned_terms:
                cleaned_terms.append(term)

        return cleaned_terms
