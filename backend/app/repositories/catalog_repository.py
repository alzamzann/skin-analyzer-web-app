from pathlib import Path

import pandas as pd

from app.schemas.domain import IngredientRecord, ProductRecord


def _clean_cell(value: object) -> str | None:
    if value is None or pd.isna(value):
        return None

    text = str(value).strip()
    return text or None


def _parse_price(value: object) -> int:
    text = _clean_cell(value)
    if not text:
        return 0

    digits = "".join(character for character in text if character.isdigit())
    if not digits:
        return 0

    if "," in text and len(digits) > 2:
        digits = digits[:-2]

    return int(digits or 0)


def _normalize_category(value: str | None) -> str:
    text = (value or "").strip().lower()
    if text in {"sun care", "suncare", "sunscreen", "spf"}:
        return "Sun Care"
    if text == "moisturizer":
        return "Moisturizer"
    if text == "cleanser":
        return "Cleanser"
    return value or "Uncategorized"


class CatalogRepository:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self._ingredients: list[IngredientRecord] | None = None
        self._products: list[ProductRecord] | None = None

    def load(self) -> None:
        self._ingredients = self._load_ingredients()
        self._products = self._load_products()

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

    def _load_ingredients(self) -> list[IngredientRecord]:
        path = self.data_dir / "ingredients.csv"
        if not path.exists():
            return _seed_ingredients()

        frame = pd.read_csv(path).dropna(axis=1, how="all")
        records: list[IngredientRecord] = []
        for row in frame.to_dict(orient="records"):
            name = _clean_cell(row.get("name"))
            if not name:
                continue

            records.append(
                IngredientRecord(
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

        return records or _seed_ingredients()

    def _load_products(self) -> list[ProductRecord]:
        path = self.data_dir / "products.csv"
        if not path.exists():
            return _seed_products()

        frame = pd.read_csv(path).dropna(axis=1, how="all")
        records: list[ProductRecord] = []
        for index, row in enumerate(frame.to_dict(orient="records")):
            name = _clean_cell(row.get("name"))
            if not name:
                continue

            records.append(
                ProductRecord(
                    bpom_id=_clean_cell(row.get("bpom_id")) or f"product-{index + 1}",
                    name=name,
                    brand=_clean_cell(row.get("brand")) or "Unknown Brand",
                    category=_normalize_category(_clean_cell(row.get("category"))),
                    description=_clean_cell(row.get("description")),
                    price=_parse_price(row.get("price")),
                    ingredients=_clean_cell(row.get("ingredients")) or "",
                    image_url=_clean_cell(row.get("image_url")),
                    product_url=_clean_cell(row.get("product_url")),
                    incidecoder_verif=_clean_cell(row.get("incidecoder_verif")),
                )
            )

        return records or _seed_products()


def _seed_ingredients() -> list[IngredientRecord]:
    return [
        IngredientRecord(
            name="Niacinamide",
            ingredient_type="functional",
            inci_name="Niacinamide",
            best_for="ALL",
            can_used_to="oil control, uneven tone, barrier support",
            not_recommend="none",
            personal_care_category="brightening, barrier support",
            topical_use="Supports oil balance and uneven visible skin tone.",
        ),
        IngredientRecord(
            name="Ceramides",
            ingredient_type="lipid",
            inci_name="Ceramide NP, Ceramide AP, Ceramide EOP",
            best_for="DRNT DRNW DRPT DRPW DSNT DSNW DSPT DSPW",
            can_used_to="dryness, barrier support",
            not_recommend="none",
            personal_care_category="barrier repair, moisturizing",
            topical_use="Helps support a more resilient moisture barrier.",
        ),
        IngredientRecord(
            name="Centella Asiatica",
            ingredient_type="botanical",
            inci_name="Centella Asiatica Extract",
            best_for="DSNT DSNW DSPT DSPW OSNT OSNW OSPT OSPW",
            can_used_to="redness, sensitivity",
            not_recommend="none",
            personal_care_category="soothing, calming",
            topical_use="Helps calm visible sensitivity and redness.",
        ),
        IngredientRecord(
            name="Salicylic Acid",
            ingredient_type="exfoliant",
            inci_name="Salicylic Acid",
            best_for="ORNT ORNW ORPT ORPW OSNT OSNW OSPT OSPW",
            can_used_to="blackheads, pores, congestion",
            not_recommend="very dry or compromised skin",
            personal_care_category="BHA exfoliant",
            topical_use="Helps clear pore buildup and refine texture.",
        ),
        IngredientRecord(
            name="Tranexamic Acid",
            ingredient_type="brightening",
            inci_name="Tranexamic Acid",
            best_for="DRPT DRPW DSPT DSPW ORPT ORPW OSPT OSPW",
            can_used_to="visible discoloration, uneven tone",
            not_recommend="none",
            personal_care_category="tone support",
            topical_use="Supports the look of more even pigmentation.",
        ),
    ]


def _seed_products() -> list[ProductRecord]:
    return [
        ProductRecord(
            bpom_id="SEED-001",
            name="Barrier Comfort Cleanser",
            brand="Dermalyzer Lab",
            category="Cleanser",
            description="Gentle cleanser with ceramides and niacinamide.",
            price=185000,
            ingredients="Water, Glycerin, Niacinamide, Ceramide NP, Centella Asiatica",
            image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
            product_url=None,
        ),
        ProductRecord(
            bpom_id="SEED-002",
            name="Oil Balance Gel Moisturizer",
            brand="Dermalyzer Lab",
            category="Moisturizer",
            description="Lightweight moisturizer with niacinamide and centella.",
            price=215000,
            ingredients="Water, Niacinamide, Centella Asiatica Extract, Hyaluronic Acid",
            image_url="https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?auto=format&fit=crop&w=400&q=80",
            product_url=None,
        ),
        ProductRecord(
            bpom_id="SEED-003",
            name="Tone Defense Sun Care SPF 50",
            brand="Dermalyzer Lab",
            category="Sun Care",
            description="Daily sun care with tranexamic acid and barrier support.",
            price=199000,
            ingredients="Zinc Oxide, Tranexamic Acid, Niacinamide, Ceramide AP",
            image_url="https://images.unsplash.com/photo-1598662972299-5408ddb8a3dc?auto=format&fit=crop&w=400&q=80",
            product_url=None,
        ),
    ]
