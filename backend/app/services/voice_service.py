"""Voice assistant service — Speech-to-Text and Text-to-Speech.

Uses:
- faster-whisper for STT (speech-to-text)
- gTTS for TTS (text-to-speech)

Both are free and open source.
"""

import io
import os
import uuid
import asyncio
from pathlib import Path

from app.core.logging_config import get_logger

logger = get_logger(__name__)

AUDIO_OUTPUT_DIR = "./data/audio_output"


async def speech_to_text(audio_bytes: bytes) -> dict:
    """Transcribe audio to text using Groq Whisper API for incredible speed."""
    logger.info("stt_started", audio_size=len(audio_bytes))

    try:
        from groq import AsyncGroq
        from app.config import get_settings

        settings = get_settings()
        api_key = settings.groq_api_key or os.getenv("GROQ_API_KEY")
        
        if not api_key:
            return {"transcribed_text": "", "detected_language": "en", "error": "Groq Key missing"}

        client = AsyncGroq(api_key=api_key)

        transcription = await client.audio.transcriptions.create(
            file=("audio.webm", audio_bytes), # The browser MediaRecorder generates webm or wav internally
            model="whisper-large-v3-turbo",
            response_format="json"
        )
        
        text = transcription.text
        logger.info("stt_completed", text_length=len(text))
        
        return {
            "transcribed_text": text.strip(),
            "detected_language": "en",
        }

    except ImportError:
        logger.warning("groq_not_installed")
        return {
            "transcribed_text": "",
            "detected_language": "en",
            "error": "groq package is not installed. Install with: pip install groq",
        }
    except Exception as e:
        logger.error("stt_failed", error=str(e))
        return {
            "transcribed_text": "",
            "detected_language": "en",
            "error": str(e),
        }


async def text_to_speech(text: str, language: str = "en") -> dict:
    """Convert text to speech using gTTS.

    Args:
        text: Text to convert to speech.
        language: Language code (en or kn).

    Returns:
        dict with audio file path.
    """
    logger.info("tts_started", text_length=len(text), language=language)

    try:
        from gtts import gTTS

        # Map language codes
        lang_map = {"en": "en", "kn": "kn"}
        gtts_lang = lang_map.get(language, "en")

        def _generate_audio():
            Path(AUDIO_OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
            filename = f"tts_{uuid.uuid4().hex[:8]}.mp3"
            filepath = os.path.join(AUDIO_OUTPUT_DIR, filename)

            tts = gTTS(text=text, lang=gtts_lang, slow=False)
            tts.save(filepath)

            return filepath

        filepath = await asyncio.to_thread(_generate_audio)
        logger.info("tts_completed", filepath=filepath)

        return {
            "audio_url": filepath,
            "language": language,
        }

    except ImportError:
        logger.warning("gtts_not_installed")
        return {
            "audio_url": "",
            "language": language,
            "error": "gTTS is not installed. Install with: pip install gTTS",
        }
    except Exception as e:
        logger.error("tts_failed", error=str(e))
        return {
            "audio_url": "",
            "language": language,
            "error": str(e),
        }
