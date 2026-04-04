"""API endpoint: GET /schemes — Government scheme information retrieval."""

from fastapi import APIRouter, Query

from app.schemas.schemes import SchemesResponse, GovernmentScheme
from app.services.schemes_service import search_schemes
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get(
    "/schemes",
    response_model=SchemesResponse,
    summary="Search government agricultural schemes",
    description="Search for relevant government schemes, subsidies, and farmer welfare programs.",
    tags=["Government Schemes"],
)
async def schemes_endpoint(
    query: str = Query(..., min_length=1, max_length=500, description="Search query"),
    state: str | None = Query(None, description="Filter by state (e.g., Karnataka)"),
):
    """Search for government agricultural schemes and subsidies."""
    result = await search_schemes(query, state)

    schemes = [GovernmentScheme(**s) for s in result["schemes"]]

    return SchemesResponse(
        schemes=schemes,
        summary=result["summary"],
    )
