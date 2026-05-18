from app.schemas.analysis import BaumannMapping, LabelPrediction, SkinAttributes


class BaumannService:
    def map_predictions(
        self, predictions: list[LabelPrediction]
    ) -> tuple[str, SkinAttributes, BaumannMapping, float, str]:
        scores = {prediction.label: prediction.confidence for prediction in predictions}

        oiliness = max(scores.get("Blackheads", 0), scores.get("Enlarged Pores", 0))
        sensitivity = max(scores.get("Acne", 0), scores.get("Redness", 0))
        pigmentation = scores.get("Pigmentation", 0)
        wrinkle_tendency = scores.get("Wrinkles", 0)

        code = "".join(
            [
                "O" if oiliness >= 0.5 else "D",
                "S" if sensitivity >= 0.5 else "R",
                "P" if pigmentation >= 0.5 else "N",
                "W" if wrinkle_tendency >= 0.5 else "T",
            ]
        )

        mapping = BaumannMapping(
            oiliness="Oily" if code[0] == "O" else "Dry",
            sensitivity="Sensitive" if code[1] == "S" else "Resistant",
            pigmentation="Pigmented" if code[2] == "P" else "Non-pigmented",
            aging="Wrinkle-prone" if code[3] == "W" else "Tight/Firm",
        )
        attributes = SkinAttributes(
            oiliness=round(oiliness * 100),
            sensitivity=round(sensitivity * 100),
            pigmentation=round(pigmentation * 100),
            wrinkle_tendency=round(wrinkle_tendency * 100),
        )
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

        description = (
            f"Your skin profile appears {mapping.oiliness.lower()}, "
            f"{mapping.sensitivity.lower()}, {mapping.pigmentation.lower()}, "
            f"and {mapping.aging.lower()}. Use this as educational guidance for "
            "ingredient and product selection, not as a medical diagnosis."
        )

        return code, attributes, mapping, min(confidence, 0.97), description
