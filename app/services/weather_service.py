"""Weather service — Open-Meteo integration with farming recommendations."""

import httpx

from app.config import get_settings
from app.core.exceptions import ExternalServiceError
from app.core.logging_config import get_logger

logger = get_logger(__name__)


async def get_weather(latitude: float, longitude: float, crop: str | None = None) -> dict:
    """Fetch current weather from Open-Meteo and generate farming recommendations.

    Open-Meteo is completely free and requires no API key.

    Args:
        latitude: Location latitude.
        longitude: Location longitude.
        crop: Optional crop name for tailored advice.

    Returns:
        dict with current_weather, farming_recommendation, alerts.
    """
    settings = get_settings()

    url = f"{settings.openmeteo_base_url}/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
        "timezone": "auto",
        "forecast_days": 3,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as e:
        logger.error("weather_api_failed", error=str(e))
        raise ExternalServiceError("Open-Meteo", str(e))

    current = data.get("current", {})

    weather_data = {
        "temperature_c": current.get("temperature_2m", 0),
        "humidity_pct": current.get("relative_humidity_2m", 0),
        "precipitation_mm": current.get("precipitation", 0),
        "wind_speed_kmh": current.get("wind_speed_10m", 0),
        "weather_description": _weather_code_to_description(current.get("weather_code", 0)),
    }

    # Generate farming recommendations
    recommendation = _generate_farming_recommendation(weather_data, crop)
    alerts = _generate_weather_alerts(weather_data, data.get("daily", {}))

    logger.info(
        "weather_fetched",
        latitude=latitude,
        longitude=longitude,
        temp=weather_data["temperature_c"],
    )

    return {
        "current_weather": weather_data,
        "farming_recommendation": recommendation,
        "alerts": alerts,
    }


def _weather_code_to_description(code: int) -> str:
    """Convert WMO weather code to human-readable description."""
    descriptions = {
        0: "Clear sky",
        1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snowfall", 73: "Moderate snowfall", 75: "Heavy snowfall",
        80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        95: "Thunderstorm", 96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    }
    return descriptions.get(code, "Unknown")


def _generate_farming_recommendation(weather: dict, crop: str | None) -> str:
    """Generate practical farming recommendations based on current weather."""
    temp = weather["temperature_c"]
    humidity = weather["humidity_pct"]
    precip = weather["precipitation_mm"]
    wind = weather["wind_speed_kmh"]

    recommendations = []

    # Temperature-based advice
    if temp > 40:
        recommendations.append("🌡️ Extreme heat: Increase irrigation frequency. Apply mulch to retain soil moisture. Avoid fieldwork during peak hours.")
    elif temp > 35:
        recommendations.append("🌡️ High temperature: Ensure adequate watering in the morning or evening. Consider shade nets for sensitive crops.")
    elif temp < 5:
        recommendations.append("❄️ Frost risk: Cover tender plants. Delay sowing of warm-season crops.")
    elif 20 <= temp <= 30:
        recommendations.append("✅ Optimal temperature range for most crops. Good conditions for planting and field activities.")

    # Humidity-based advice
    if humidity > 85:
        recommendations.append("💧 High humidity: Watch for fungal diseases. Ensure proper spacing for air circulation.")
    elif humidity < 30:
        recommendations.append("🏜️ Low humidity: Increase irrigation. Consider drip irrigation to reduce water loss.")

    # Precipitation-based advice
    if precip > 20:
        recommendations.append("🌧️ Heavy rainfall: Postpone spraying. Check field drainage. Watch for waterlogging.")
    elif precip > 5:
        recommendations.append("🌦️ Moderate rain: Good for rainfed crops. Delay fertilizer application to avoid runoff.")
    elif precip == 0:
        recommendations.append("☀️ No rain expected: Plan irrigation accordingly.")

    # Wind-based advice
    if wind > 40:
        recommendations.append("💨 Strong winds: Postpone spraying. Secure young plants and trellises.")
    elif wind > 20:
        recommendations.append("🌬️ Moderate wind: Avoid aerial spraying. Good for natural pest control.")

    # Crop-specific advice
    if crop:
        recommendations.append(f"🌱 For {crop}: Monitor local advisory bulletins for variety-specific guidance.")

    return "\n".join(recommendations) if recommendations else "Weather conditions are normal. Continue regular farming activities."


def _generate_weather_alerts(weather: dict, daily: dict) -> list[str]:
    """Generate weather alerts for the next 3 days."""
    alerts = []
    temp = weather["temperature_c"]

    if temp > 42:
        alerts.append("⚠️ HEAT WAVE WARNING: Temperature exceeding 42°C. Take precautions.")
    if weather["precipitation_mm"] > 50:
        alerts.append("⚠️ HEAVY RAIN ALERT: Risk of flooding and waterlogging.")
    if weather["wind_speed_kmh"] > 60:
        alerts.append("⚠️ HIGH WIND ALERT: Secure structures and avoid open field work.")

    # Check daily forecast for upcoming rain
    daily_precip = daily.get("precipitation_sum", [])
    for i, precip in enumerate(daily_precip[:3]):
        if precip and precip > 30:
            alerts.append(f"🌧️ Heavy rain expected in {i} day(s): {precip}mm precipitation forecast.")

    return alerts
