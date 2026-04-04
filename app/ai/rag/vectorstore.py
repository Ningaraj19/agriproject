import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from app.core.logging_config import get_logger
from app.config import get_settings
from pathlib import Path

logger = get_logger(__name__)

_vectorstore = None
_embeddings = None


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        settings = get_settings()
        model_name = settings.embedding_model or "sentence-transformers/all-MiniLM-L6-v2"
        _embeddings = HuggingFaceEmbeddings(model_name=model_name)
    return _embeddings


def _ensure_pinecone_index(pclient: Pinecone, index_name: str, dimension: int = 384):
    """Create the Pinecone serverless index if it does not already exist."""
    if not pclient.has_index(index_name):
        logger.info("creating_pinecone_index", index_name=index_name)
        pclient.create_index(
            name=index_name,
            dimension=dimension,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
    else:
        logger.info("pinecone_index_already_exists", index_name=index_name)


def get_vectorstore():
    global _vectorstore

    if _vectorstore is not None:
        return _vectorstore

    # ── Load settings (reads .env via pydantic-settings) ──────────
    settings = get_settings()
    pinecone_api_key = settings.pinecone_api_key
    index_name = settings.pinecone_index_name

    if not pinecone_api_key:
        raise ValueError(
            "PINECONE_API_KEY is not set. Add it to your .env file as PINECONE_API_KEY=<your key>"
        )

    # Also expose to os.environ so the langchain-pinecone SDK can find it
    os.environ["PINECONE_API_KEY"] = pinecone_api_key

    embeddings = get_embeddings()
    pclient = Pinecone(api_key=pinecone_api_key)

    # ── Ensure the index exists ────────────────────────────────────
    _ensure_pinecone_index(pclient, index_name)

    index = pclient.Index(index_name)
    stats = index.describe_index_stats()
    total_vectors = stats.get("total_vector_count", 0)

    if total_vectors > 0:
        # Index already populated — just connect
        logger.info("loading_existing_pinecone_vectorstore", vectors=total_vectors)
        _vectorstore = PineconeVectorStore.from_existing_index(
            index_name=index_name,
            embedding=embeddings,
        )
    else:
        # Index is empty — load PDF, chunk and upsert
        logger.info("populating_pinecone_vectorstore_from_pdf")

        BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
        pdf_path = str(BASE_DIR / "data" / "knowledge_base" / "farmerbook.pdf")

        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"Knowledge base PDF not found at {pdf_path}")

        loader = PyPDFLoader(pdf_path)
        docs = loader.load()

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(docs)

        logger.info("upserting_chunks_to_pinecone", count=len(chunks))
        _vectorstore = PineconeVectorStore.from_documents(
            documents=chunks,
            embedding=embeddings,
            index_name=index_name,
        )

    return _vectorstore
