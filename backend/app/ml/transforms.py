from PIL import Image


IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


def build_image_transform(image_size: int = 224):
    try:
        from torchvision import transforms
    except ImportError as error:
        raise RuntimeError("torchvision is required for real model inference.") from error

    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
        ]
    )


def ensure_rgb(image: Image.Image) -> Image.Image:
    return image.convert("RGB")
