"""Pydantic schemas for the /voice endpoints."""

from pydantic import BaseModel, Field


class TTSRequest(BaseModel):
    """Request body for text-to-speech."""

    text: str = Field(..., min_length=1, max_length=5000)
    language: str = Field("en", description="Language code: en or kn")


class STTResponse(BaseModel):
    """Response from speech-to-text."""

    success: bool = True
    transcribed_text: str
    detected_language: str = ""


class TTSResponse(BaseModel):
    """Response from text-to-speech (returns audio file path)."""

    success: bool = True
    audio_url: str
    language: str = ""
