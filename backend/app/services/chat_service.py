import time
import asyncio
from app.ai.rag.pipeline import get_rag_chain
from app.ai.rag.vectorstore import get_vectorstore
from app.core.logging_config import get_logger

logger = get_logger(__name__)

async def ask_question(question: str, language: str | None = "en", farmer_id: str | None = "default_user") -> dict:
    start_time = time.perf_counter()

    logger.info("chat_processing", original_length=len(question), session_id=farmer_id)

    # Combine custom retrieval with sync model threading
    def _execute():
        vectorstore = get_vectorstore()
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        
        context_docs = retriever.invoke(question)
        context = "\n".join([doc.page_content for doc in context_docs])
        
        rag_chain = get_rag_chain()
        response = rag_chain.invoke(
            {
                "question": question,
                "context": context
            },
            config={"configurable": {"session_id": farmer_id or "default_user"}}
        )
        
        return response.content, []
        
    answer, sources = await asyncio.to_thread(_execute)
    
    duration_ms = (time.perf_counter() - start_time) * 1000

    logger.info("chat_completed", duration_ms=round(duration_ms, 2))

    return {
        "success": True,
        "answer": answer,
        "language": language or "en",
        "sources": sources,
    }
