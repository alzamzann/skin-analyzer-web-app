from PIL import Image

from app.services.mock_inference_service import MockInferenceService


def test_mock_inference_uses_per_label_thresholds() -> None:
    service = MockInferenceService(
        threshold=0.5,
        label_thresholds={"Acne": 0.99, "Redness": 0.01},
    )
    predictions = service._predict_image(Image.new("RGB", (16, 16), color=(180, 120, 120)))
    by_label = {prediction.label: prediction for prediction in predictions}

    assert by_label["Acne"].detected is False
    assert by_label["Redness"].detected is True
