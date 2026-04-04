"""API endpoint: GET /market — Crop market price analysis."""

from fastapi import APIRouter, Query

from app.schemas.market import MarketResponse, CropPrice
from app.services.market_service import get_market_prices
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get(
    "/market",
    response_model=MarketResponse,
    summary="Get crop market prices",
    description="Returns current market prices for major crops across Indian APMCs.",
    tags=["Market"],
)
async def market_endpoint(
    crop: str | None = Query(None, description="Filter by crop name (e.g., Rice, Tomato)"),
    state: str | None = Query(None, description="Filter by state name"),
):
    """Get market prices for crops with trend analysis."""
    result = await get_market_prices(crop, state)

    prices = [CropPrice(**p) for p in result["prices"]]

    return MarketResponse(
        prices=prices,
        analysis=result["analysis"],
    )
