from io import BytesIO

from PIL import Image, UnidentifiedImageError

from app.services.errors import AnalysisError


def decode_image(image_bytes: bytes) -> Image.Image:
    try:
        image = Image.open(BytesIO(image_bytes))
        image.load()
    except UnidentifiedImageError as error:
        raise AnalysisError(
            "The uploaded file could not be read as an image.",
            "invalid_image",
        ) from error

    return image.convert("RGB")


def encode_jpeg(image: Image.Image, quality: int = 90) -> bytes:
    buffer = BytesIO()
    image.convert("RGB").save(buffer, format="JPEG", quality=quality)
    return buffer.getvalue()
