import asyncio
from dataclasses import dataclass
from io import BytesIO

from PIL import Image

from app.api.dependencies import get_analysis_service
from app.api.routes.analyze import analyze_skin
from app.api.routes.health import health_check
from app.core.config import get_settings


@dataclass
class FakeUploadFile:
    content_type: str
    payload: bytes

    async def read(self) -> bytes:
        return self.payload


def _image_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (64, 64), color=(185, 145, 125)).save(buffer, format="JPEG")
    return buffer.getvalue()


def test_health_check() -> None:
    assert health_check() == {"status": "ok"}


def test_analyze_valid_image_returns_result() -> None:
    file = FakeUploadFile(content_type="image/jpeg", payload=_image_bytes())

    result = asyncio.run(
        analyze_skin(
            image=file,
            settings=get_settings(),
            analysis_service=get_analysis_service(),
        )
    )

    assert result.analysis_id
    assert len(result.baumann_type) == 4
    assert result.recommended_products
    assert result.available_filters == ["All", "Cleanser", "Moisturizer", "Sun Care"]


def test_analyze_rejects_unsupported_file_type() -> None:
    file = FakeUploadFile(content_type="text/plain", payload=b"not an image")

    try:
        asyncio.run(
            analyze_skin(
                image=file,
                settings=get_settings(),
                analysis_service=get_analysis_service(),
            )
        )
    except Exception as error:
        assert getattr(error, "status_code") == 415
        assert error.detail["code"] == "unsupported_image_type"
    else:
        raise AssertionError("Unsupported uploads should fail.")
