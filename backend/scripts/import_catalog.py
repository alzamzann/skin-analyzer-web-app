from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import get_settings
from app.database import create_database_engine, create_session_factory
from app.services.catalog_import_service import import_catalog


def main() -> None:
    settings = get_settings()
    engine = create_database_engine(settings.database_url)
    try:
        result = import_catalog(
            session_factory=create_session_factory(engine),
            data_dir=settings.data_dir,
        )
    finally:
        engine.dispose()

    print(f"Ingredients imported: {result.ingredient_count}")
    print(f"Products imported: {result.product_count}")
    print(f"Ingredients skipped: {result.skipped_ingredients}")
    print(f"Products skipped: {result.skipped_products}")
    print(f"Main categories: {result.main_category_count}")
    print(f"Subcategories: {result.sub_category_count}")


if __name__ == "__main__":
    main()
