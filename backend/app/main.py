from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.dependencies import (
    get_catalog_repository,
    get_database_engine,
    get_roi_service,
)
from app.api.routes import analyze, health, recommendations
from app.core.config import get_settings
from app.database import check_database_connection


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix=settings.api_prefix)
    app.include_router(analyze.router, prefix=settings.api_prefix)
    app.include_router(recommendations.router, prefix=settings.api_prefix)

    @app.on_event("startup")
    def validate_database_catalog() -> None:
        try:
            check_database_connection(get_database_engine())
            get_catalog_repository()
        except Exception as error:
            raise RuntimeError(
                "PostgreSQL catalog is unavailable. Start the database, run "
                "'alembic upgrade head', and run 'python scripts/import_catalog.py'."
            ) from error

    @app.on_event("shutdown")
    def close_face_detection_resources() -> None:
        get_roi_service().face_detection_service.close()
        get_database_engine().dispose()

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        _request: Request, _error: Exception
    ) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={
                "detail": {
                    "message": "Something went wrong while processing the request.",
                    "code": "internal_server_error",
                }
            },
        )

    return app


app = create_app()
