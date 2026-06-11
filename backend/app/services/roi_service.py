import base64
from dataclasses import dataclass
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont

from app.services.errors import AnalysisError
from app.services.face_detection_service import (
    DetectedFace,
    FaceBoundingBox,
    MediaPipeFaceDetectionService,
)
from app.services.face_quality_service import FaceQualityValidationService
from app.services.image_service import decode_image, encode_jpeg


ROI_CENTER_CONFIG = {
    "forehead": {"index": 151, "scale": 0.45, "offset_y": -0.05},
    "nose": {"index": 5, "scale": 0.40, "offset_y": 0.00},
    "left_cheek": {"index": 50, "scale": 0.43, "offset_y": 0.03},
    "right_cheek": {"index": 280, "scale": 0.43, "offset_y": 0.03},
}


@dataclass(frozen=True)
class RoiCrop:
    region: str
    bounding_box: FaceBoundingBox
    image: Image.Image

    def to_data_url(self) -> str:
        payload = base64.b64encode(encode_jpeg(self.image)).decode("ascii")
        return f"data:image/jpeg;base64,{payload}"


@dataclass(frozen=True)
class RoiExtractionResult:
    face_bounding_box: FaceBoundingBox
    landmark_count: int
    rois: list[RoiCrop]

    def to_inference_image_bytes(self) -> bytes:
        if not self.rois:
            raise AnalysisError(
                "Face was detected but no skin regions could be extracted.",
                "roi_extraction_failed",
            )

        tile_size = self.rois[0].image.size[0]
        canvas = Image.new("RGB", (tile_size * 2, tile_size * 2), color=(255, 255, 255))
        for index, roi in enumerate(self.rois[:4]):
            x = (index % 2) * tile_size
            y = (index // 2) * tile_size
            canvas.paste(roi.image.convert("RGB"), (x, y))

        buffer = BytesIO()
        canvas.save(buffer, format="JPEG", quality=90)
        return buffer.getvalue()


@dataclass(frozen=True)
class LandmarkDetectionResult:
    image: Image.Image
    face: DetectedFace

    def to_annotated_data_url(self) -> str:
        preview, scale = _preview_canvas(self.image)
        draw = ImageDraw.Draw(preview)
        radius = max(2, round(max(preview.size) / 320))
        font = ImageFont.load_default()

        for index, landmark in enumerate(self.face.landmarks):
            x = round(landmark.x * self.image.width * scale)
            y = round(landmark.y * self.image.height * scale)
            draw.ellipse(
                (x - radius, y - radius, x + radius, y + radius),
                fill=(0, 195, 255),
                outline=(12, 38, 54),
            )
            _draw_label(draw, str(index), x + radius + 1, y - radius - 1, font)

        payload = base64.b64encode(encode_jpeg(preview)).decode("ascii")
        return f"data:image/jpeg;base64,{payload}"


@dataclass(frozen=True)
class LandmarkCropResult:
    image: Image.Image
    face: DetectedFace
    landmark_index: int
    bounding_box: FaceBoundingBox
    crop: Image.Image

    def to_crop_data_url(self) -> str:
        payload = base64.b64encode(encode_jpeg(self.crop)).decode("ascii")
        return f"data:image/jpeg;base64,{payload}"


class RoiService:
    def __init__(
        self,
        face_detection_service: MediaPipeFaceDetectionService,
        face_quality_service: FaceQualityValidationService | None = None,
        crop_size: int = 224,
    ):
        self.face_detection_service = face_detection_service
        self.face_quality_service = (
            face_quality_service or FaceQualityValidationService()
        )
        self.crop_size = crop_size

    def extract(self, image_bytes: bytes) -> RoiExtractionResult:
        image = decode_image(image_bytes)
        face = self.face_detection_service.detect_single_face(image)
        self.face_quality_service.validate_detected_face(image, face)
        rois: list[RoiCrop] = []

        for region in ROI_CENTER_CONFIG:
            bounding_box = _region_box(face, region, image.width, image.height)
            rois.append(
                RoiCrop(
                    region=region,
                    bounding_box=bounding_box,
                    image=_crop_region(image, bounding_box, self.crop_size),
                )
            )

        self.face_quality_service.validate_roi_images([roi.image for roi in rois])
        return RoiExtractionResult(
            face_bounding_box=face.bounding_box,
            landmark_count=len(face.landmarks),
            rois=rois,
        )

    def detect_landmarks(self, image_bytes: bytes) -> LandmarkDetectionResult:
        image = decode_image(image_bytes)
        face = self.face_detection_service.detect_single_face(image)
        self.face_quality_service.validate_detected_face(image, face)
        return LandmarkDetectionResult(image=image, face=face)

    def crop_from_landmark(
        self,
        image_bytes: bytes,
        landmark_index: int,
        crop_size: int,
    ) -> LandmarkCropResult:
        image = decode_image(image_bytes)
        face = self.face_detection_service.detect_single_face(image)
        self.face_quality_service.validate_detected_face(image, face)

        if landmark_index < 0 or landmark_index >= len(face.landmarks):
            raise AnalysisError(
                f"Landmark index must be between 0 and {len(face.landmarks) - 1}.",
                "invalid_landmark_index",
                status_code=422,
            )

        landmark = face.landmarks[landmark_index]
        center_x = round(landmark.x * image.width)
        center_y = round(landmark.y * image.height)
        bounding_box = _fixed_square_box(center_x, center_y, crop_size, image.size)
        crop = _crop_region(image, bounding_box, crop_size)

        return LandmarkCropResult(
            image=image,
            face=face,
            landmark_index=landmark_index,
            bounding_box=bounding_box,
            crop=crop,
        )


def _region_box(
    face: DetectedFace,
    region: str,
    image_width: int,
    image_height: int,
) -> FaceBoundingBox:
    config = ROI_CENTER_CONFIG[region]
    landmark_index = config["index"]
    if landmark_index >= len(face.landmarks):
        raise AnalysisError(
            f"Missing landmark {landmark_index} for the {region.replace('_', ' ')} region.",
            "roi_extraction_failed",
        )

    landmark = face.landmarks[landmark_index]
    center_x = round(landmark.x * image_width)
    center_y = round(
        landmark.y * image_height + face.bounding_box.height * config["offset_y"]
    )
    source_size = max(round(face.bounding_box.width * config["scale"]), 32)
    return _fixed_square_box(center_x, center_y, source_size, (image_width, image_height))


def _crop_region(
    image: Image.Image,
    box: FaceBoundingBox,
    crop_size: int,
) -> Image.Image:
    cropped = image.crop((box.x, box.y, box.x + box.width, box.y + box.height))
    return cropped.resize((crop_size, crop_size), Image.Resampling.LANCZOS)


def _fixed_square_box(
    center_x: int,
    center_y: int,
    crop_size: int,
    image_size: tuple[int, int],
) -> FaceBoundingBox:
    image_width, image_height = image_size
    width = min(crop_size, image_width)
    height = min(crop_size, image_height)
    half_width = width // 2
    half_height = height // 2

    x = _clamp(center_x - half_width, 0, image_width - width)
    y = _clamp(center_y - half_height, 0, image_height - height)
    return FaceBoundingBox(x=x, y=y, width=width, height=height)


def _preview_canvas(image: Image.Image, max_side: int = 960) -> tuple[Image.Image, float]:
    scale = min(max_side / max(image.size), 1.0)
    if scale == 1.0:
        return image.copy(), scale

    size = (round(image.width * scale), round(image.height * scale))
    return image.resize(size, Image.Resampling.LANCZOS), scale


def _draw_label(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    font: ImageFont.ImageFont,
) -> None:
    text_box = draw.textbbox((x, y), text, font=font)
    padding = 1
    background_box = (
        text_box[0] - padding,
        text_box[1] - padding,
        text_box[2] + padding,
        text_box[3] + padding,
    )
    draw.rectangle(background_box, fill=(12, 38, 54))
    draw.text((x, y), text, fill=(255, 255, 255), font=font)


def _clamp(value: int, minimum: int, maximum: int) -> int:
    return min(max(value, minimum), maximum)
