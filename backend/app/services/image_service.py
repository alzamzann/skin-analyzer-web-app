from io import BytesIO

from PIL import Image, UnidentifiedImageError

from app.services.errors import AnalysisError


# Decode (konversi bytes ke PIL Image RGB)
def decode_image(image_bytes: bytes) -> Image.Image:
    try:
        # Buka gambar dari bytes dan load ke memory
        image = Image.open(BytesIO(image_bytes))
        image.load()
    except UnidentifiedImageError as error:
        raise AnalysisError(
            "The uploaded file could not be read as an image.",
            "invalid_image",
        ) from error

    # Konversi ke format RGB
    return image.convert("RGB")


# Encode (konversi PIL Image ke bytes JPEG)
def encode_jpeg(image: Image.Image, quality: int = 90) -> bytes:
    buffer = BytesIO()
    # Simpan gambar ke buffer sebagai JPEG 
    image.convert("RGB").save(buffer, format="JPEG", quality=quality)
    return buffer.getvalue()
