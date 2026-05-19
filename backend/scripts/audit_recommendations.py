from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.api.dependencies import get_catalog_repository, get_recommendation_service


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
        choices=["All", "Cleanser", "Moisturizer", "Sun Care"],
        default="All",
        help="Optional product category filter.",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=5,
        help="Number of products to show per Baumann type.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    selected_types = args.baumann_types or BAUMANN_TYPES
    category = None if args.category == "All" else args.category

    get_catalog_repository.cache_clear()
    get_recommendation_service.cache_clear()
    recommendation_service = get_recommendation_service()
    repository = recommendation_service.catalog_repository

    print(f"Ingredients loaded: {len(repository.ingredients)}")
    print(f"Products loaded: {len(repository.products)}")
    print(f"Available filters: {', '.join(recommendation_service.get_available_filters())}")
    print()

    matched_ingredient_counts: Counter[str] = Counter()
    category_counts: Counter[str] = Counter()

    for baumann_type in selected_types:
        ingredients = recommendation_service.recommend_ingredients(baumann_type)
        products, total_candidates = recommendation_service.recommend_products(
            baumann_type=baumann_type,
            category=category,
            top_k=args.top_k,
        )

        print(f"{baumann_type} | candidates={total_candidates} | ingredients={len(ingredients)}")
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
            print(
                f"  {rank}. {product.similarity_score:.3f} | "
                f"{product.category:<11} | {product.name} | {matched}"
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
