from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import analyze, health, recommendations
from app.core.config import get_settings


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
