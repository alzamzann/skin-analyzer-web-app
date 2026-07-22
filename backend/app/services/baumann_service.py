# Impor: dependensi pemetaan Baumann
from app.schemas.analysis import BaumannMapping, LabelPrediction, SkinAttributes


# Konfigurasi pemetaan label prediksi ke dimensi Baumann
BAUMANN_AXIS_SOURCE_LABELS = {
    "oiliness": ("Blackheads", "Enlarged Pores"),
    "sensitivity": ("Acne", "Redness"),
    "pigmentation": ("Pigmentation",),
    "wrinkle_tendency": ("Wrinkles",),
}


# Hitung skor dari prediksi
def max_score_for_labels(
    predictions: list[LabelPrediction],
    source_labels: tuple[str, ...],
) -> float:
    # Ambil confidence tertinggi dari label yang sesuai
    return max(
        (
            prediction.confidence
            for prediction in predictions
            if prediction.label in source_labels
        ),
        default=0,
    )


def any_detected_for_labels(
    predictions: list[LabelPrediction],
    source_labels: tuple[str, ...],
) -> bool:
    # Cek apakah ada label yang terdeteksi
    return any(
        prediction.detected
        for prediction in predictions
        if prediction.label in source_labels
    )


# Kelas utama
class BaumannService:
    # Pemetaan 4 dimensi, kode, atribut, dan deskripsi
    def map_predictions(
        self, predictions: list[LabelPrediction]
    ) -> tuple[str, SkinAttributes, BaumannMapping, float, str]:
        # Hitung skor tertinggi per sumbu
        oiliness = max_score_for_labels(
            predictions,
            BAUMANN_AXIS_SOURCE_LABELS["oiliness"],
        )
        sensitivity = max_score_for_labels(
            predictions,
            BAUMANN_AXIS_SOURCE_LABELS["sensitivity"],
        )
        pigmentation = max_score_for_labels(
            predictions,
            BAUMANN_AXIS_SOURCE_LABELS["pigmentation"],
        )
        wrinkle_tendency = max_score_for_labels(
            predictions,
            BAUMANN_AXIS_SOURCE_LABELS["wrinkle_tendency"],
        )

        # Cek apakah ada label yang terdeteksi per sumbu
        oiliness_detected = any_detected_for_labels(
            predictions,
            BAUMANN_AXIS_SOURCE_LABELS["oiliness"],
        )
        sensitivity_detected = any_detected_for_labels(
            predictions,
            BAUMANN_AXIS_SOURCE_LABELS["sensitivity"],
        )
        pigmentation_detected = any_detected_for_labels(
            predictions,
            BAUMANN_AXIS_SOURCE_LABELS["pigmentation"],
        )
        wrinkle_detected = any_detected_for_labels(
            predictions,
            BAUMANN_AXIS_SOURCE_LABELS["wrinkle_tendency"],
        )

        # Susun kode Baumann 4 karakter (misal: DSPT, DRPW)
        code = "".join(
            [
                "O" if oiliness_detected else "D",
                "S" if sensitivity_detected else "R",
                "P" if pigmentation_detected else "N",
                "W" if wrinkle_detected else "T",
            ]
        )

        # Buat mapping deskriptif per dimensi
        mapping = BaumannMapping(
            oiliness="Oily" if code[0] == "O" else "Dry",
            sensitivity="Sensitive" if code[1] == "S" else "Resistant",
            pigmentation="Pigmented" if code[2] == "P" else "Non-pigmented",
            aging="Wrinkle-prone" if code[3] == "W" else "Tight/Firm",
        )
        # Konversi skor ke persen
        attributes = SkinAttributes(
            oiliness=round(oiliness * 100),
            sensitivity=round(sensitivity * 100),
            pigmentation=round(pigmentation * 100),
            wrinkle_tendency=round(wrinkle_tendency * 100),
        )
        # Hitung confidence berdasarkan deviasi dari threshold 0.5
        confidence = round(
            (
                abs(oiliness - 0.5)
                + abs(sensitivity - 0.5)
                + abs(pigmentation - 0.5)
                + abs(wrinkle_tendency - 0.5)
            )
            / 2
            + 0.5,
            3,
        )

        # Buat deskripsi untuk user
        description = (
            f"Your skin profile appears {mapping.oiliness.lower()}, "
            f"{mapping.sensitivity.lower()}, {mapping.pigmentation.lower()}, "
            f"and {mapping.aging.lower()}. Use this as educational guidance for "
            "ingredient and product selection, not as a medical diagnosis."
        )

        return code, attributes, mapping, min(confidence, 0.97), description
