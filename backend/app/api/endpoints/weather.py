"""API endpoint: GET /weather — Weather-based farming recommendations."""

from fastapi import APIRouter, Query

from app.schemas.weather import WeatherResponse, WeatherData
from app.services.weather_service import get_weather
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get(
    "/weather",
    response_model=WeatherResponse,
    summary="Get weather and farming recommendations",
    description="Fetches current weather from Open-Meteo (free) and generates farming advice.",
    tags=["Weather"],
)
async def weather_endpoint(
    latitude: float = Query(..., ge=-90, le=90, description="Location latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Location longitude"),
    crop: str | None = Query(None, description="Crop name for tailored advice"),
):
    """Get current weather conditions with agriculture-specific recommendations."""
    result = await get_weather(latitude, longitude, crop)

    current = result.get("current_weather", {})
    weather_data = WeatherData(**current) if current else None

    return WeatherResponse(
        current_weather=weather_data,
        farming_recommendation=result["farming_recommendation"],
        alerts=result.get("alerts", []),
    )
