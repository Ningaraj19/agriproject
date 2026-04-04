"""API endpoints: /voice/stt and /voice/tts — Voice assistant."""

from fastapi import APIRouter, File, UploadFile
from fastapi.responses import FileResponse

from app.schemas.voice import TTSRequest, STTResponse, TTSResponse
from app.services.voice_service import speech_to_text, text_to_speech
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post(
    "/voice/stt",
    response_model=STTResponse,
    summary="Speech to Text",
    description="Upload an audio file and get the transcribed text.",
    tags=["Voice"],
)
async def stt_endpoint(file: UploadFile = File(..., description="Audio file (WAV, MP3)")):
    """Transcribe audio to text using Whisper."""
    audio_bytes = await file.read()
    result = await speech_to_text(audio_bytes)

    return STTResponse(
        transcribed_text=result["transcribed_text"],
        detected_language=result.get("detected_language", "en"),
    )


@router.post(
    "/voice/tts",
    response_model=TTSResponse,
    summary="Text to Speech",
    description="Convert text to speech audio file.",
    tags=["Voice"],
)
async def tts_endpoint(request: TTSRequest):
    """Convert text to speech audio."""
    result = await text_to_speech(request.text, request.language)

    return TTSResponse(
        audio_url=result["audio_url"],
        language=result.get("language", request.language),
    )
