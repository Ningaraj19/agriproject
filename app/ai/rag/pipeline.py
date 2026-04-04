import os
from langchain_core.prompts import MessagesPlaceholder, ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from app.ai.rag.vectorstore import get_vectorstore
from app.config import get_settings

settings = get_settings()

# Store chat history in memory per session ID
_store = {}

def get_session_history(session_id: str):
    if session_id not in _store:
        _store[session_id] = ChatMessageHistory()
    return _store[session_id]

def get_rag_chain():
    # Remove stale SSL_CERT_FILE env var that causes httpx SSL context to fail
    import os
    os.environ.pop("SSL_CERT_FILE", None)

    # Setup the LLM
    api_key = settings.groq_api_key or os.getenv("GROQ_API_KEY")
    model = ChatGroq(model=settings.groq_model or "llama3-8b-8192", api_key=api_key)

    # Contextualize prompt mapping (directly from user reference)
    contextualize_s_prompt = (
        "Given a chat history and the latest user question "
        "Which might reference context in the chat history. "
        "Formulate a standalone question which can be understood "
        "without the chat history. Do Not answer the question "
        "Just reformulate it if needed and otherwise return it as it is."
    )

    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", contextualize_s_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}") # Note: Langchain standard retriever explicitly expects input instead of question
    ])
    
    retriever = get_vectorstore().as_retriever(search_kwargs={"k": 3})
    
    history_aware_retriever = create_history_aware_retriever(
        model, retriever, contextualize_q_prompt
    )

    # Standard QA system mapping
    system_prompt = (
        "You are an expert AI Farming Assistant. Your sole purpose is to "
        "answer questions related to agriculture, farming techniques, crops, "
        "market prices, agricultural weather conditions, and government farming schemes. "
        "If the user asks a question that is NOT related to agriculture or farming, "
        "you MUST politely refuse to answer and remind them that you are a Farming Assistant. "
        "Use the following pieces of retrieved context to answer the question. "
        "If you don't know the answer, say that you don't know. "
        "Use three sentences maximum and keep the answer concise."
        "\n\n"
        "Context:\n"
        "{context}"
    )

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}")
    ])

    chain = qa_prompt | model
    
    conversational_rag_chain = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="question",
        history_messages_key="chat_history"
    )
    
    return conversational_rag_chain
