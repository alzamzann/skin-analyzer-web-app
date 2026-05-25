from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.api.dependencies import get_catalog_repository, get_recommendation_service
from app.services.product_categories import get_unmapped_subcategories


BAUMANN_TYPES = [
    f"{oiliness}{sensitivity}{pigmentation}{aging}"
    for oiliness in "DO"
    for sensitivity in "SR"
    for pigmentation in "PN"
    for aging in "WT"
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audit top product recommendations for Baumann skin types.",
    )
    parser.add_argument(
        "--type",
        dest="baumann_types",
        action="append",
        choices=BAUMANN_TYPES,
        help="Baumann type to audit. May be passed multiple times. Defaults to all.",
    )
    parser.add_argument(
        "--category",
        help="Backward-compatible subcategory filter from the product dataset.",
    )
    parser.add_argument(
        "--main-category",
        help="Optional main category filter, for example Treatment or Cleanser.",
    )
    parser.add_argument(
        "--sub-category",
        help="Optional subcategory filter, for example Toner or Face Wash.",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=5,
        help="Number of products to show per Baumann type.",
    )
    parser.add_argument(
        "--routine",
        action="store_true",
        help="Show the initial routine result: the top product per main category.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    selected_types = args.baumann_types or BAUMANN_TYPES

    if args.routine and any(
        [args.category, args.main_category, args.sub_category]
    ):
        raise SystemExit("--routine cannot be combined with category filters.")

    get_catalog_repository.cache_clear()
    get_recommendation_service.cache_clear()
    recommendation_service = get_recommendation_service()
    repository = recommendation_service.catalog_repository
    category_filters = recommendation_service.get_product_category_filters()

    print(f"Ingredients loaded: {len(repository.ingredients)}")
    print(f"Products loaded: {len(repository.products)}")
    print("Available product filters:")
    for category_filter in category_filters:
        subcategories = ", ".join(category_filter.sub_categories)
        print(f"  {category_filter.main_category}: {subcategories}")
    unmapped = get_unmapped_subcategories(repository.products)
    if unmapped:
        print(f"Unmapped categories assigned to Other: {', '.join(unmapped)}")
    print()

    matched_ingredient_counts: Counter[str] = Counter()
    category_counts: Counter[str] = Counter()

    for baumann_type in selected_types:
        ingredients = recommendation_service.recommend_ingredients(baumann_type)
        if args.routine:
            products = recommendation_service.recommend_routine_products(baumann_type)
            context = f"routine_products={len(products)}"
        else:
            try:
                products, total_candidates = recommendation_service.recommend_products(
                    baumann_type=baumann_type,
                    category=args.category,
                    main_category=args.main_category,
                    sub_category=args.sub_category,
                    top_k=args.top_k,
                )
            except ValueError as error:
                raise SystemExit(str(error)) from error
            context = f"candidates={total_candidates}"

        print(f"{baumann_type} | {context} | ingredients={len(ingredients)}")
        print(
            "  ingredient pool: "
            + ", ".join(ingredient.name for ingredient in ingredients)
        )

        if not products:
            print("  no matching products")
            print()
            continue

        for rank, product in enumerate(products, start=1):
            matched_ingredient_counts.update(product.matched_ingredients)
            category_counts[product.category] += 1
            matched = ", ".join(product.matched_ingredients) or "-"
            if args.routine:
                print(
                    f"  {product.main_category:<11} | {product.similarity_score:.3f} | "
                    f"{product.sub_category:<23} | {product.name} | {matched}"
                )
            else:
                print(
                    f"  {rank}. {product.similarity_score:.3f} | "
                    f"{product.main_category:<11} | {product.sub_category:<23} | "
                    f"{product.name} | {matched}"
                )
        print()

    if matched_ingredient_counts:
        print("Most common matched ingredients in displayed products:")
        for ingredient, count in matched_ingredient_counts.most_common(20):
            print(f"  {count:>3} {ingredient}")
        print()

    if category_counts:
        print("Displayed category mix:")
        for category_name, count in category_counts.most_common():
            print(f"  {count:>3} {category_name}")


if __name__ == "__main__":
    main()
