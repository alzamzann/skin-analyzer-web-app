import re


def singularize_token(value: str) -> str:
    if len(value) > 3 and value.endswith("ies"):
        return f"{value[:-3]}y"
    if len(value) > 3 and value.endswith("s"):
        return value[:-1]
    return value


def normalize_text(value: str | None) -> str:
    if not value:
        return ""

    lowered = value.lower()
    normalized = re.sub(r"[^a-z0-9]+", " ", lowered).strip()
    return " ".join(singularize_token(token) for token in normalized.split())


def split_terms(value: str | None) -> list[str]:
    if not value:
        return []

    terms = []
    for term in re.split(r"[,;/\n\r]+", value):
        normalized = normalize_text(term)
        if len(normalized) >= 3:
            terms.append(normalized)

    return terms


def split_codes(value: str | None) -> set[str]:
    if not value:
        return set()

    return {
        item.strip().upper()
        for item in re.split(r"[,;/\s]+", value)
        if item.strip()
    }
