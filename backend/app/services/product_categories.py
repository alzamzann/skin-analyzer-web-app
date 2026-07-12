from collections.abc import Iterable

from app.schemas.domain import ProductRecord


MAIN_CATEGORY_SUBCATEGORIES: dict[str, tuple[str, ...]] = {
    "Treatment": ("Toner", "Essence", "Face Serum", "Booster", "Ampoule"),
    "Cleanser": (
        "Face Wash",
        "Cleansing Oil",
        "Cleansing Balm",
        "Cleansing Cream",
        "Cleansing Gel",
        "Scrub And Exfoliator",
        "Micellar Water",
        "Peeling",
    ),
    "Moisturizer": ("Face Oil", "Face Cream And Lotion", "Face Mist", "Face Gel"),
    "Sunscreen": ("Sunscreen",),
}
ROUTINE_MAIN_CATEGORY_ORDER = ("Cleanser", "Treatment", "Moisturizer", "Sunscreen")
OTHER_MAIN_CATEGORY = "Other"

_CANONICAL_SUBCATEGORIES = {
    category.casefold(): category
    for categories in MAIN_CATEGORY_SUBCATEGORIES.values()
    for category in categories
}
_SUBCATEGORY_ALIASES = {
    "sun care": "Sunscreen",
    "suncare": "Sunscreen",
    "spf": "Sunscreen",
}


def normalize_subcategory(value: str | None) -> str:
    category = (value or "").strip()
    if not category:
        return "Uncategorized"

    key = category.casefold()
    return _CANONICAL_SUBCATEGORIES.get(
        key,
        _SUBCATEGORY_ALIASES.get(key, category),
    )


def get_main_category(subcategory: str) -> str:
    for main_category, subcategories in MAIN_CATEGORY_SUBCATEGORIES.items():
        if subcategory in subcategories:
            return main_category
    return OTHER_MAIN_CATEGORY


def group_available_subcategories(
    products: Iterable[ProductRecord],
) -> dict[str, list[str]]:
    present_categories = {product.category for product in products if product.category}
    groups: dict[str, list[str]] = {}

    for main_category, configured_subcategories in MAIN_CATEGORY_SUBCATEGORIES.items():
        available = [
            subcategory
            for subcategory in configured_subcategories
            if subcategory in present_categories
        ]
        if available:
            groups[main_category] = available

    unmapped = sorted(
        (
            subcategory
            for subcategory in present_categories
            if get_main_category(subcategory) == OTHER_MAIN_CATEGORY
        ),
        key=str.casefold,
    )
    if unmapped:
        groups[OTHER_MAIN_CATEGORY] = unmapped

    return groups


def get_unmapped_subcategories(products: Iterable[ProductRecord]) -> list[str]:
    return group_available_subcategories(products).get(OTHER_MAIN_CATEGORY, [])
