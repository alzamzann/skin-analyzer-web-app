# Backend Review Workflows

This guide collects the local commands for reviewing the recommendation system and the current MediaPipe ROI debug tools.

## 1. Project Location

Run commands from the repository root unless a section says otherwise:

```bash
cd /home/alzamzann/skin-analyzer/skin-analyzer-web-app
```

Backend folder:

```bash
cd backend
```

## 2. Backend Environment

Use the existing backend conda environment:

```bash
conda activate skin-backend
```

If dependencies need to be installed again:

```bash
cd /home/alzamzann/skin-analyzer/skin-analyzer-web-app/backend
python -m pip install -r requirements.txt
```

The Face Landmarker model file is required for real face detection:

```bash
cd /home/alzamzann/skin-analyzer/skin-analyzer-web-app/backend
python scripts/download_face_landmarker.py
```

Expected local model path:

```txt
backend/app/ml_models/face_landmarker.task
```

The `.task` file is ignored by git.

## 3. Run Backend Tests

```bash
cd /home/alzamzann/skin-analyzer/skin-analyzer-web-app/backend
conda activate skin-backend
python -m pytest
```

## 4. Recommendation Review

The recommendation audit script prints:

- number of loaded ingredients and products
- available product filters
- compatible ingredient pool for each Baumann type
- top recommended products
- `candidates`, meaning the number of products considered after the category filter
- matched ingredients for each displayed product
- common matched ingredients across displayed products

Run the full recommendation audit:

```bash
cd /home/alzamzann/skin-analyzer/skin-analyzer-web-app/backend
conda activate skin-backend
python scripts/audit_recommendations.py --top-k 5
```

Audit one Baumann type:

```bash
python scripts/audit_recommendations.py --type DSPT --top-k 5
```

Audit the initial routine shown on the result page:

```bash
python scripts/audit_recommendations.py --type DSPT --routine
```

Audit multiple Baumann types:

```bash
python scripts/audit_recommendations.py --type DSPT --type ORNW --top-k 5
```

Audit one main category:

```bash
python scripts/audit_recommendations.py --type DSPT --main-category Moisturizer --top-k 10
```

Audit one subcategory:

```bash
python scripts/audit_recommendations.py --type DSPT --main-category Treatment --sub-category "Face Serum" --top-k 10
```

The script prints current main/subcategory filters after loading `products.csv`.
Unmapped CSV category values are reported under `Other`.

Important matching rule:

- Product matching uses only the `inci_name` / `INCI_NAME` values from `ingredients.csv`.
- The display `name` column is not used to decide whether a product contains an ingredient.
- If one INCI variant from an ingredient row matches a product composition, that ingredient row counts as matched once.

Current product score meaning:

```txt
matched compatible ingredients / total compatible ingredients
```

This is a coverage score, not Precision@N and not cosine similarity.

Initial result behavior:

```txt
Top 1 Cleanser + Top 1 Treatment + Top 1 Moisturizer + Top 1 Sunscreen
```

Selecting a main category or subcategory in the result page loads its Top 5
products using the same coverage score.

## 5. Run Backend API

```bash
cd /home/alzamzann/skin-analyzer/skin-analyzer-web-app/backend
conda activate skin-backend
python -m uvicorn app.main:app --reload
```

Open API docs:

```txt
http://127.0.0.1:8000/docs
```

Use the docs page for the easiest file upload flow.

## 5.1 Real Model Inference

Put the skin model file in:

```txt
backend/app/ml_models/
```

Current model filename:

```txt
backend/app/ml_models/best_efficientnet_b0_v1.pt
```

Model files are ignored by git.

Install optional CUDA model dependencies:

```bash
cd /home/alzamzann/skin-analyzer/skin-analyzer-web-app/backend
conda activate skin-backend
python -m pip install -r requirements-ml.txt
```

Current `requirements-ml.txt` uses PyTorch CUDA 13.0 wheels:

```txt
--index-url https://download.pytorch.org/whl/cu130
torch==2.11.0
torchvision==0.26.0
```

Check PyTorch and CUDA visibility:

```bash
python -c "import torch; print(torch.__version__); print(torch.cuda.is_available()); print(torch.version.cuda)"
```

Enable real inference by setting:

```env
DERMALYZER_MOCK_INFERENCE_ENABLED=false
DERMALYZER_SKIN_MODEL_PATH=backend/app/ml_models/best_efficientnet_b0_v1.pt
DERMALYZER_SKIN_MODEL_ARCH=efficientnet_b0
DERMALYZER_SKIN_MODEL_THRESHOLD=0.7
```

Current model label order:

```txt
Acne
Blackheads
Enlarged Pores
Pigmentation
Redness
Wrinkles
```

If `DERMALYZER_MOCK_INFERENCE_ENABLED=true`, the backend keeps using the deterministic mock inference service.

## 6. ROI Preview

Endpoint:

```txt
POST /api/analyze/roi-preview
```

Input:

```txt
multipart/form-data
image: face image file
```

The response includes:

- `face.boundingBox`
- `face.landmarkCount`
- `rois`
- each ROI `region`
- each ROI `boundingBox`
- each ROI `imageDataUrl`

To view a crop:

1. Copy one `imageDataUrl`.
2. Paste it into the browser address bar.

Current ROI center configuration:

```txt
forehead    center landmark 151
nose        center landmark 5
left_cheek  center landmark 50
right_cheek center landmark 280
```

The crop source region is sized relative to detected face width, clamped inside the image, then resized to `224x224` for backend inference.

## 7. All Landmark Preview

Endpoint:

```txt
POST /api/analyze/landmarks-preview
```

Input:

```txt
multipart/form-data
image: face image file
```

The response includes:

- `annotatedImageDataUrl`, an image with all MediaPipe landmark dots and numbers
- `landmarks`, a JSON list of all landmarks

Each landmark item includes:

```json
{
  "index": 151,
  "x": 0.5,
  "y": 0.28,
  "z": -0.01,
  "pixelX": 640,
  "pixelY": 360
}
```

To view the numbered landmark image:

1. Copy `annotatedImageDataUrl`.
2. Paste it into the browser address bar.

## 8. Single Landmark Crop Preview

Endpoint:

```txt
POST /api/analyze/landmark-crop-preview
```

Input:

```txt
multipart/form-data
image: face image file
```

Query parameters:

```txt
landmark_index: MediaPipe landmark number
crop_size: square crop size, default 224
```

Example values in Swagger docs:

```txt
landmark_index = 151
crop_size = 224
```

The response includes:

- selected `landmark`
- `sourceBoundingBox`
- `cropSize`
- `cropImageDataUrl`

To view the crop:

1. Copy `cropImageDataUrl`.
2. Paste it into the browser address bar.

Useful landmarks for the current ROI centers:

```txt
151 forehead
5   nose
50  left cheek
280 right cheek
```

## 9. Direct Curl Examples

ROI preview:

```bash
curl -X POST "http://127.0.0.1:8000/api/analyze/roi-preview" \
  -F "image=@/path/to/face.jpg"
```

All landmarks preview:

```bash
curl -X POST "http://127.0.0.1:8000/api/analyze/landmarks-preview" \
  -F "image=@/path/to/face.jpg"
```

Single landmark crop:

```bash
curl -X POST "http://127.0.0.1:8000/api/analyze/landmark-crop-preview?landmark_index=151&crop_size=224" \
  -F "image=@/path/to/face.jpg"
```

## 10. Common Errors

`face_model_missing`

Run:

```bash
python scripts/download_face_landmarker.py
```

`face_detector_unavailable`

MediaPipe is not installed correctly or the native vision libraries are missing in the active Python environment.

`no_face_detected`

Upload a clearer, front-facing image with one visible face.

`multiple_faces_detected`

Upload an image with only one face.

`invalid_landmark_index`

The selected landmark index does not exist in the detected MediaPipe landmark list.
