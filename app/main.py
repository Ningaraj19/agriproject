"""AgriAI — FastAPI Application Entry Point.

Production-ready AI platform for agriculture:
- AI chatbot with RAG (Retrieval Augmented Generation)
- Crop disease detection (CNN)
- Weather-based farming recommendations
- Market price analysis
- Government scheme search
- YouTube farming video recommendations
- Voice assistant (STT/TTS)
- Multilingual support (English + Kannada)
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.core.exceptions import AgriAIException
from app.core.logging_config import setup_logging, get_logger
from app.core.middleware import RequestLoggingMiddleware, agri_exception_handler
from app.api.router import api_router

settings = get_settings()
setup_logging(debug=settings.debug)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info(
        "application_starting",
        app=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
    )

    # Initialize database tables (dev mode)
    try:
        from app.db.session import init_db
        await init_db()
        logger.info("database_initialized")
    except Exception as e:
        logger.warning("database_init_skipped", error=str(e))

    logger.info("application_ready", app=settings.app_name)

    yield  # Application runs here

    logger.info("application_shutting_down")


# ── Create FastAPI app ──────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    description=(
        "🌾 **AgriAI** — AI-powered platform for Indian farmers.\n\n"
        "Features:\n"
        "- 🤖 AI Chatbot with RAG for agriculture Q&A\n"
        "- 🔬 Crop disease detection from leaf images\n"
        "- 🌤️ Weather-based farming recommendations\n"
        "- 📊 Market price analysis\n"
        "- 🏛️ Government scheme search\n"
        "- 🎥 YouTube farming video recommendations\n"
        "- 🎙️ Voice assistant (STT/TTS)\n"
        "- 🌐 Multilingual support (English + ಕನ್ನಡ)\n"
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

# ── Exception handlers ─────────────────────────────────────────────
app.add_exception_handler(AgriAIException, agri_exception_handler)

# ── Include API routes ─────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Health check ───────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint — application health check."""
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "healthy",
        "message": "🌾 AgriAI is running! Visit /docs for API documentation.",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "services": {
            "api": "up",
            "database": "check /docs for status",
            "llm": "Groq Cloud API",
            "model": settings.groq_model,
        },
    }
