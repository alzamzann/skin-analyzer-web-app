from pydantic import BaseModel, ConfigDict, Field


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=lambda value: "".join(
            word.capitalize() if index else word
            for index, word in enumerate(value.split("_"))
        ),
        populate_by_name=True,
    )


class ApiError(CamelModel):
    message: str
    code: str
    details: dict[str, str] | None = None


class LabelPrediction(CamelModel):
    label: str
    detected: bool
    confidence: float = Field(ge=0, le=1)


class SkinAttributes(CamelModel):
    oiliness: int = Field(ge=0, le=100)
    sensitivity: int = Field(ge=0, le=100)
    pigmentation: int = Field(ge=0, le=100)
    wrinkle_tendency: int = Field(ge=0, le=100)


class BaumannMapping(CamelModel):
    oiliness: str
    sensitivity: str
    pigmentation: str
    aging: str


class RecommendedIngredient(CamelModel):
    name: str
    reason: str
    ingredient_type: str | None = None
    alternate_name: str | None = None
    inci_name: str | None = None
    best_for: str | None = None
    can_used_to: str | None = None
    not_recommend: str | None = None
    personal_care_category: str | None = None
    topical_use: str | None = None


class RecommendedProduct(CamelModel):
    id: str
    bpom_id: str | None = None
    name: str
    brand: str
    category: str
    description: str | None = None
    price: int
    image_url: str | None = None
    product_url: str | None = None
    matched_ingredients: list[str] = Field(default_factory=list)
    similarity_score: float = Field(ge=0, le=1)


class AnalysisResult(CamelModel):
    analysis_id: str
    baumann_type: str
    confidence: float = Field(ge=0, le=1)
    description: str
    attributes: SkinAttributes
    detected_labels: list[LabelPrediction]
    baumann_mapping: BaumannMapping
    recommended_ingredients: list[RecommendedIngredient]
    recommended_products: list[RecommendedProduct]
    available_filters: list[str]
    disclaimer: str


class IngredientListResponse(CamelModel):
    baumann_type: str
    include_all: bool
    ingredients: list[RecommendedIngredient]


class ProductListResponse(CamelModel):
    baumann_type: str
    category: str | None = None
    total_candidates: int
    top_k: int
    products: list[RecommendedProduct]
