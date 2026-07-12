from typing import Protocol

from app.schemas.domain import IngredientRecord, ProductRecord


class CatalogRepositoryProtocol(Protocol):
    @property
    def ingredients(self) -> list[IngredientRecord]: ...

    @property
    def products(self) -> list[ProductRecord]: ...

    def load(self) -> None: ...
