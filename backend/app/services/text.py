import re


def normalize_text(value: str | None) -> str:
    if not value:
        return ""

    lowered = value.lower()
    return re.sub(r"[^a-z0-9]+", " ", lowered).strip()


def split_codes(value: str | None) -> set[str]:
    if not value:
        return set()

    return {
        item.strip().upper()
        for item in re.split(r"[,;/\s]+", value)
        if item.strip()
    }
