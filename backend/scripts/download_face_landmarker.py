from pathlib import Path
from urllib.request import urlretrieve


MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/"
    "face_landmarker/float16/latest/face_landmarker.task"
)
MODEL_PATH = (
    Path(__file__).resolve().parents[1]
    / "app"
    / "ml_models"
    / "face_landmarker.task"
)


def main() -> None:
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    if MODEL_PATH.exists():
        print(f"Face landmarker model already exists: {MODEL_PATH}")
        return

    print(f"Downloading Face Landmarker model to {MODEL_PATH}")
    urlretrieve(MODEL_URL, MODEL_PATH)
    print("Done.")


if __name__ == "__main__":
    main()
