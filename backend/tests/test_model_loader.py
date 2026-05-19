from collections import OrderedDict

from app.ml.model_loader import _extract_state_dict, _normalize_state_dict_keys


def test_extract_state_dict_accepts_model_state_key() -> None:
    state_dict = OrderedDict({"classifier.1.bias": object()})

    assert _extract_state_dict({"model_state": state_dict}) is state_dict


def test_normalize_state_dict_keys_removes_common_wrappers() -> None:
    state_dict = {
        "module.features.0.0.weight": object(),
        "model.classifier.1.bias": object(),
    }

    normalized = _normalize_state_dict_keys(state_dict)

    assert "features.0.0.weight" in normalized
    assert "classifier.1.bias" in normalized
