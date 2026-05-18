from dataclasses import dataclass


@dataclass(frozen=True)
class IngredientRecord:
    name: str
    ingredient_type: str | None = None
    alternate_name: str | None = None
    inci_name: str | None = None
    best_for: str | None = None
    can_used_to: str | None = None
    not_recommend: str | None = None
    personal_care_category: str | None = None
    topical_use: str | None = None


@dataclass(frozen=True)
class ProductRecord:
    bpom_id: str | None
    name: str
    brand: str
    category: str
    description: str | None
    price: int
    ingredients: str
    image_url: str | None = None
    product_url: str | None = None
    incidecoder_verif: str | None = None
