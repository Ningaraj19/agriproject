from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import ask_question
from app.core.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Chat"])

@router.post(
    "/ask",
    response_model=ChatResponse,
    summary="Ask an agriculture question",
    description="AI chatbot powered by Groq and ChromaDB RAG. Returns sources and tracks history natively.",
)
async def ask(request: ChatRequest):
    """Process a farmer's agriculture question and return an AI-generated answer."""
    result = await ask_question(
        question=request.question,
        language=request.language,
        farmer_id=request.farmer_id
    )

    return ChatResponse(
        success=result["success"],
        answer=result["answer"],
        language=result["language"],
        sources=result.get("sources", []),
    )
