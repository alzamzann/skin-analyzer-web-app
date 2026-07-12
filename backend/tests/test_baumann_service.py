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


def test_detected_field_determines_baumann_mapping() -> None:
    predictions = [
        LabelPrediction(label="Acne", detected=True, confidence=0.62),
        LabelPrediction(label="Redness", detected=False, confidence=0.22),
        LabelPrediction(label="Pigmentation", detected=True, confidence=0.74),
        LabelPrediction(label="Blackheads", detected=True, confidence=0.66),
        LabelPrediction(label="Wrinkles", detected=False, confidence=0.41),
        LabelPrediction(label="Enlarged Pores", detected=False, confidence=0.31),
    ]

    code, attributes, mapping, *_ = BaumannService().map_predictions(predictions)

    assert code == "OSPT"
    assert attributes.oiliness == 66
    assert mapping.oiliness == "Oily"
    assert mapping.sensitivity == "Sensitive"
    assert mapping.pigmentation == "Pigmented"
    assert mapping.aging == "Tight/Firm"


def test_high_confidence_without_detected_does_not_affect_mapping() -> None:
    predictions = [
        LabelPrediction(label="Acne", detected=False, confidence=0.95),
        LabelPrediction(label="Redness", detected=False, confidence=0.88),
        LabelPrediction(label="Pigmentation", detected=False, confidence=0.92),
        LabelPrediction(label="Blackheads", detected=False, confidence=0.91),
        LabelPrediction(label="Wrinkles", detected=False, confidence=0.87),
        LabelPrediction(label="Enlarged Pores", detected=False, confidence=0.89),
    ]

    code, attributes, mapping, *_ = BaumannService().map_predictions(predictions)

    assert code == "DRNT"
    assert mapping.oiliness == "Dry"
    assert mapping.sensitivity == "Resistant"
    assert mapping.pigmentation == "Non-pigmented"
    assert mapping.aging == "Tight/Firm"
    assert attributes.oiliness == 91
    assert attributes.sensitivity == 95


def test_pigmentation_and_wrinkle_scores_use_max_confidence() -> None:
    predictions = [
        LabelPrediction(label="Pigmentation", detected=False, confidence=0.21),
        LabelPrediction(label="Pigmentation", detected=True, confidence=0.73),
        LabelPrediction(label="Wrinkles", detected=False, confidence=0.19),
        LabelPrediction(label="Wrinkles", detected=True, confidence=0.68),
    ]

    code, attributes, mapping, *_ = BaumannService().map_predictions(predictions)

    assert code == "DRPW"
    assert attributes.pigmentation == 73
    assert attributes.wrinkle_tendency == 68
    assert mapping.pigmentation == "Pigmented"
    assert mapping.aging == "Wrinkle-prone"


def test_any_detected_label_in_axis_triggers_positive_side() -> None:
    predictions = [
        LabelPrediction(label="Acne", detected=False, confidence=0.30),
        LabelPrediction(label="Redness", detected=True, confidence=0.55),
        LabelPrediction(label="Pigmentation", detected=False, confidence=0.20),
        LabelPrediction(label="Blackheads", detected=False, confidence=0.25),
        LabelPrediction(label="Wrinkles", detected=False, confidence=0.15),
        LabelPrediction(label="Enlarged Pores", detected=True, confidence=0.60),
    ]

    code, attributes, mapping, *_ = BaumannService().map_predictions(predictions)

    assert code == "OSNT"
    assert mapping.oiliness == "Oily"
    assert mapping.sensitivity == "Sensitive"
    assert mapping.pigmentation == "Non-pigmented"
    assert mapping.aging == "Tight/Firm"
