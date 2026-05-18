from app.schemas.analysis import LabelPrediction
from app.services.baumann_service import BaumannService


def test_maps_predictions_to_baumann_code() -> None:
    predictions = [
        LabelPrediction(label="Acne", detected=True, confidence=0.74),
        LabelPrediction(label="Redness", detected=False, confidence=0.31),
        LabelPrediction(label="Pigmentation", detected=True, confidence=0.69),
        LabelPrediction(label="Blackheads", detected=False, confidence=0.18),
        LabelPrediction(label="Wrinkles", detected=False, confidence=0.22),
        LabelPrediction(label="Enlarged Pores", detected=False, confidence=0.27),
    ]

    code, attributes, mapping, confidence, _description = (
        BaumannService().map_predictions(predictions)
    )

    assert code == "DSPT"
    assert attributes.sensitivity == 74
    assert mapping.oiliness == "Dry"
    assert mapping.sensitivity == "Sensitive"
    assert confidence > 0.5
