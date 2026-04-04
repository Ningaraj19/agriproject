from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str
    language: str | None = "en"
    farmer_id: str | None = "default_user"

class ChatResponse(BaseModel):
    success: bool = True
    answer: str
    language: str | None = "en"
    sources: list[str] = []
