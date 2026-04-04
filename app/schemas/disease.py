"""Pydantic schemas for the /detect-disease endpoint."""

from pydantic import BaseModel, Field


class DiseasePrediction(BaseModel):
    """Single disease prediction result."""

    disease_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    description: str = ""
    treatment: str = ""


class DiseaseDetectionResponse(BaseModel):
    """Response from the disease detection endpoint."""

    success: bool = True
    predictions: list[DiseasePrediction]
    crop_name: str = ""
    recommendation: str = ""
