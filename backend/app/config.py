"""Application configuration using pydantic-settings."""

from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Always resolve .env relative to this config.py file's location (backend/)
_BASE_DIR = Path(__file__).resolve().parent.parent  # backend/app/config.py → backend/
_ENV_FILE = _BASE_DIR / ".env"


class Settings(BaseSettings):
    """Central configuration loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────
    app_name: str = "AgriAI"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000

    # ── Groq LLM ─────────────────────────────────────────────────
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # ── Pinecone ──────────────────────────────────────────────────
    pinecone_api_key: str = ""
    pinecone_index_name: str = "agri-knowledge-base"

    # ── Embeddings ───────────────────────────────────────────────
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    # ── Disease Detection ────────────────────────────────────────
    disease_model_path: str = "./data/disease_model/model.pth"
    disease_model_num_classes: int = 38

    # ── Weather ──────────────────────────────────────────────────
    openmeteo_base_url: str = "https://api.open-meteo.com/v1"

    # ── YouTube ──────────────────────────────────────────────────
    youtube_api_key: str = ""

    # ── Translation ──────────────────────────────────────────────
    translation_model_kn_en: str = "Helsinki-NLP/opus-mt-kn-en"
    translation_model_en_kn: str = "Helsinki-NLP/opus-mt-en-kn"

    # ── Voice ────────────────────────────────────────────────────
    whisper_model_size: str = "base"


@lru_cache
def get_settings() -> Settings:
    """Return cached settings singleton."""
    return Settings()
