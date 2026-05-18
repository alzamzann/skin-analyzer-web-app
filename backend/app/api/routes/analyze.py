from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.config import Settings, get_settings
from app.schemas.analysis import AnalysisResult
from app.services.analysis_service import AnalysisService
from app.services.errors import AnalysisError
from app.services.upload_validation_service import read_validated_image
from app.api.dependencies import get_analysis_service

router = APIRouter(tags=["analysis"])


@router.post("/analyze", response_model=AnalysisResult, response_model_by_alias=True)
async def analyze_skin(
    image: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> AnalysisResult:
    try:
        image_bytes = await read_validated_image(image, settings)
        return analysis_service.analyze(image_bytes)
    except AnalysisError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail={"message": error.message, "code": error.code},
        ) from error
