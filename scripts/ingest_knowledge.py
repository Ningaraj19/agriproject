"""Knowledge base ingestion script — loads documents into ChromaDB.

Usage:
    python -m scripts.ingest_knowledge
"""

import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_community.document_loaders import PyPDFLoader

from app.ai.rag.vectorstore import add_documents, get_vectorstore
from app.core.logging_config import setup_logging, get_logger

setup_logging(debug=True)
logger = get_logger(__name__)

KNOWLEDGE_DIR = Path(__file__).parent.parent / "data" / "knowledge_base"


def load_documents() -> list[Document]:
    """Load all markdown files from the knowledge base directory."""
    documents = []

    if not KNOWLEDGE_DIR.exists():
        logger.error("knowledge_base_dir_not_found", path=str(KNOWLEDGE_DIR))
        return documents

    for filepath in KNOWLEDGE_DIR.glob("*.md"):
        content = filepath.read_text(encoding="utf-8")
        doc = Document(
            page_content=content,
            metadata={
                "source": filepath.name,
                "title": filepath.stem.replace("_", " ").title(),
            },
        )
        documents.append(doc)
        logger.info("document_loaded", file=filepath.name, length=len(content))

    for filepath in KNOWLEDGE_DIR.glob("*.pdf"):
        logger.info("loading_pdf", file=filepath.name)
        try:
            loader = PyPDFLoader(str(filepath))
            pdf_docs = loader.load()
            for p_doc in pdf_docs:
                p_doc.metadata["source"] = filepath.name
                p_doc.metadata["title"] = filepath.stem.replace("_", " ").title()
                documents.append(p_doc)
            logger.info("pdf_loaded", file=filepath.name, pages=len(pdf_docs))
        except Exception as e:
            logger.error("pdf_load_error", file=filepath.name, error=str(e))

    return documents


def split_documents(documents: list[Document]) -> list[Document]:
    """Split documents into chunks for embedding."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "],
    )

    chunks = splitter.split_documents(documents)
    logger.info("documents_split", total_chunks=len(chunks))
    return chunks


def main() -> None:
    """Main ingestion pipeline."""
    print("🌾 AgriAI Knowledge Base Ingestion")
    print("=" * 50)

    # Step 1: Load documents
    print("\n📂 Loading knowledge base documents...")
    documents = load_documents()
    print(f"   Loaded {len(documents)} document(s)")

    if not documents:
        print("❌ No documents found. Add .md files to data/knowledge_base/")
        return

    # Step 2: Split into chunks
    print("\n✂️  Splitting documents into chunks...")
    chunks = split_documents(documents)
    print(f"   Created {len(chunks)} chunk(s)")

    # Step 3: Initialize vector store
    print("\n🔄 Initializing ChromaDB vector store...")
    _ = get_vectorstore()

    # Step 4: Add to vector store
    print("\n📥 Adding chunks to ChromaDB...")
    add_documents(chunks)

    print(f"\n✅ Successfully ingested {len(chunks)} chunks from {len(documents)} documents!")
    print("   Vector store is ready for RAG queries.")


if __name__ == "__main__":
    main()
