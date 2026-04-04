"""Pydantic schemas for the /weather endpoint."""

from pydantic import BaseModel, Field


class WeatherData(BaseModel):
    """Current weather data."""

    temperature_c: float
    humidity_pct: float
    precipitation_mm: float
    wind_speed_kmh: float
    weather_description: str = ""


class WeatherRequest(BaseModel):
    """Query parameters for weather endpoint."""

    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    crop: str | None = Field(None, description="Crop name for tailored recommendations")


class WeatherResponse(BaseModel):
    """Response from the weather endpoint."""

    success: bool = True
    location: str = ""
    current_weather: WeatherData | None = None
    farming_recommendation: str = ""
    alerts: list[str] = Field(default_factory=list)
