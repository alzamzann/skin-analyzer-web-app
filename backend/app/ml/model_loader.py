from pathlib import Path
from typing import Any


def load_efficientnet_b0_state_dict_model(
    model_path: Path,
    label_count: int,
    device: str,
):
    try:
        import torch
        from torchvision.models import efficientnet_b0
    except ImportError as error:
        raise ImportError("torch and torchvision are required for real inference.") from error

    if not model_path.exists():
        raise FileNotFoundError(model_path)

    model = efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier[1] = torch.nn.Linear(in_features, label_count)

    checkpoint = _load_checkpoint(torch, model_path, device)
    state_dict = _extract_state_dict(checkpoint)
    model.load_state_dict(_normalize_state_dict_keys(state_dict), strict=True)
    model.to(device)
    model.eval()
    return model


def _load_checkpoint(torch_module, model_path: Path, device: str):
    try:
        return torch_module.load(model_path, map_location=device, weights_only=True)
    except TypeError:
        return torch_module.load(model_path, map_location=device)


def _extract_state_dict(checkpoint: Any) -> dict[str, Any]:
    if isinstance(checkpoint, dict):
        for key in ("model_state_dict", "model_state", "state_dict", "model"):
            value = checkpoint.get(key)
            if isinstance(value, dict):
                return value
        if checkpoint and all(hasattr(value, "shape") for value in checkpoint.values()):
            return checkpoint

    raise ValueError(
        "Unsupported model checkpoint format. Expected a state_dict or a checkpoint "
        "containing model_state_dict/state_dict."
    )


def _normalize_state_dict_keys(state_dict: dict[str, Any]) -> dict[str, Any]:
    normalized = {}
    for key, value in state_dict.items():
        next_key = key
        for prefix in ("module.", "model."):
            if next_key.startswith(prefix):
                next_key = next_key[len(prefix) :]
        normalized[next_key] = value
    return normalized
