from fastapi import UploadFile

from app.core.config import Settings
from app.services.errors import AnalysisError


# Tipe Gambar yang Diterima
ACCEPTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


# Validasi Tipe, Kosong, dan Ukuran Gambar
async def read_validated_image(file: UploadFile, settings: Settings) -> bytes:
    # --- Cek apakah tipe content type sesuai dengan yang diterima ---
    if file.content_type not in ACCEPTED_IMAGE_TYPES:
        raise AnalysisError(
            "Upload a JPG, PNG, or WebP image.",
            "unsupported_image_type",
            status_code=415,
        )

    # Pembacaan file
    contents = await file.read()
    if not contents:
        raise AnalysisError("Upload an image before analysis.", "empty_image")

    # Validasi ukuran file
    if len(contents) > settings.max_upload_size_bytes:
        raise AnalysisError(
            "Upload an image smaller than 8 MB.",
            "image_too_large",
            status_code=413,
        )

    return contents
