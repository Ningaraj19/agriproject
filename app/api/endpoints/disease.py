"""API endpoint: POST /detect-disease — Crop disease detection."""

from fastapi import APIRouter, File, UploadFile

from app.schemas.disease import DiseaseDetectionResponse, DiseasePrediction
from app.services.disease_service import detect_disease
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post(
    "/detect-disease",
    response_model=DiseaseDetectionResponse,
    summary="Detect crop disease from image",
    description="Upload a leaf/plant image. The CNN model classifies it into one of 38 disease categories.",
    tags=["Disease Detection"],
)
async def detect_disease_endpoint(file: UploadFile = File(..., description="Plant/leaf image (JPG, PNG)")):
    """Upload a plant/leaf image and get disease classification with treatment advice."""
    image_bytes = await file.read()

    result = await detect_disease(image_bytes)

    predictions = [
        DiseasePrediction(
            disease_name=p["disease_name"],
            confidence=p["confidence"],
            description=f"Detected on {p['crop_name']}",
            treatment=p["treatment"],
        )
        for p in result["predictions"]
    ]

    return DiseaseDetectionResponse(
        predictions=predictions,
        crop_name=result["crop_name"],
        recommendation=result["recommendation"],
    )
