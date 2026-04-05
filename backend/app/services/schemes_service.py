"""Government schemes service — RAG-based scheme information retrieval."""

from app.ai.rag.vectorstore import get_vectorstore
from app.core.logging_config import get_logger

logger = get_logger(__name__)

# Fallback scheme data when RAG knowledge base is empty
FALLBACK_SCHEMES = [
    {
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "description": "Direct income support of ₹6,000 per year to all landholding farmer families.",
        "eligibility": "All landholding farmer families with cultivable land.",
        "benefits": "₹6,000 per year in three equal installments of ₹2,000.",
        "how_to_apply": "Apply through local CSC center, or online at pmkisan.gov.in.",
        "website": "https://pmkisan.gov.in",
    },
    {
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "description": "Crop insurance scheme to provide financial support to farmers suffering crop loss due to natural calamities.",
        "eligibility": "All farmers growing notified crops in notified areas.",
        "benefits": "Insurance coverage for crop loss due to drought, flood, hailstorm, cyclone, and pest attacks.",
        "how_to_apply": "Apply through bank branches, CSC centers, or the PMFBY portal.",
        "website": "https://pmfby.gov.in",
    },
    {
        "name": "Kisan Credit Card (KCC)",
        "description": "Provides affordable credit to farmers for agricultural needs.",
        "eligibility": "All farmers, sharecroppers, tenant farmers, and self-help groups.",
        "benefits": "Credit at 4% interest (with subsidy). Loan up to ₹3 lakh.",
        "how_to_apply": "Apply at any bank branch with land documents and ID proof.",
        "website": "https://www.nabard.org",
    },
    {
        "name": "Soil Health Card Scheme",
        "description": "Provides soil health cards to farmers with nutrient status and fertilizer recommendations.",
        "eligibility": "All farmers across India.",
        "benefits": "Free soil testing and personalized fertilizer recommendations.",
        "how_to_apply": "Contact nearest Krishi Vigyan Kendra or agriculture department.",
        "website": "https://soilhealth.dac.gov.in",
    },
    {
        "name": "Raita Siri (Karnataka State Scheme)",
        "description": "Karnataka state scheme providing financial assistance to farmers.",
        "eligibility": "Farmers in Karnataka with landholding.",
        "benefits": "Financial assistance for crop inputs and farm equipment.",
        "how_to_apply": "Apply through the Karnataka agriculture department portal.",
        "website": "https://raitamitra.karnataka.gov.in",
    },
    {
        "name": "National Mission on Sustainable Agriculture (NMSA)",
        "description": "Promotes sustainable agriculture through climate-resilient practices.",
        "eligibility": "All farmers, with priority to smallholders.",
        "benefits": "Support for micro-irrigation, organic farming, soil health management, and water conservation.",
        "how_to_apply": "Contact district agriculture office or apply through state agriculture portal.",
        "website": "https://nmsa.dac.gov.in",
    },
]


async def search_schemes(query: str, state: str | None = None) -> dict:
    """Search for relevant government schemes.

    First tries RAG-based search. Falls back to keyword matching on built-in data.

    Args:
        query: Search query.
        state: Optional state filter.

    Returns:
        dict with schemes list and summary.
    """
    logger.info("scheme_search", query=query, state=state)

    schemes = []

    # Try RAG-based search first
    try:
        vectorstore = get_vectorstore()
        docs = vectorstore.similarity_search(query, k=3)
        if docs:
            for doc in docs:
                content = doc.page_content
                # Only use if it looks like scheme-related content
                if any(kw in content.lower() for kw in ["scheme", "yojana", "subsidy", "benefit", "eligible"]):
                    schemes.append({
                        "name": doc.metadata.get("title", "Government Scheme"),
                        "description": content[:500],
                        "eligibility": "",
                        "benefits": "",
                        "how_to_apply": "",
                        "website": doc.metadata.get("source", ""),
                    })
    except Exception as e:
        logger.warning("rag_scheme_search_failed", error=str(e))

    # Fallback to built-in scheme data
    if not schemes:
        query_lower = query.lower()
        for scheme in FALLBACK_SCHEMES:
            # Filter by state if provided
            if state and state.lower() == "karnataka" and "karnataka" not in scheme["name"].lower():
                # Include national schemes + Karnataka schemes
                if "karnataka" not in scheme["description"].lower() and "pm" not in scheme["name"].lower() and "pradhan" not in scheme["name"].lower() and "national" not in scheme["name"].lower() and "kisan" not in scheme["name"].lower():
                    continue

            # Simple keyword matching
            searchable = f"{scheme['name']} {scheme['description']} {scheme['benefits']}".lower()
            if any(word in searchable for word in query_lower.split()) or not query_lower.strip():
                schemes.append(scheme)

    # If still empty, return all fallback schemes
    if not schemes:
        schemes = FALLBACK_SCHEMES

    summary = f"Found {len(schemes)} relevant government scheme(s) for your query: '{query}'."
    if state:
        summary += f" Filtered for: {state}."

    logger.info("schemes_returned", count=len(schemes))

    return {
        "schemes": schemes,
        "summary": summary,
    }
