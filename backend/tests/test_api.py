"""Tests for API endpoints."""

import pytest


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test the root health check endpoint."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AgriAI" in data["app"]


@pytest.mark.asyncio
async def test_health_endpoint(client):
    """Test the /health endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data


@pytest.mark.asyncio
async def test_weather_endpoint_validation(client):
    """Test weather endpoint parameter validation."""
    # Missing required parameters
    response = await client.get("/api/v1/weather")
    assert response.status_code == 422  # Validation error

    # Invalid latitude
    response = await client.get("/api/v1/weather?latitude=100&longitude=77")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_market_endpoint(client):
    """Test market prices endpoint."""
    response = await client.get("/api/v1/market")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "prices" in data
    assert len(data["prices"]) > 0


@pytest.mark.asyncio
async def test_market_endpoint_filter_crop(client):
    """Test market prices with crop filter."""
    response = await client.get("/api/v1/market?crop=Rice")
    assert response.status_code == 200
    data = response.json()
    assert all("Rice" in p["crop_name"] for p in data["prices"])


@pytest.mark.asyncio
async def test_schemes_endpoint(client):
    """Test government schemes endpoint."""
    response = await client.get("/api/v1/schemes?query=crop insurance")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "schemes" in data


@pytest.mark.asyncio
async def test_youtube_endpoint(client):
    """Test YouTube videos endpoint."""
    response = await client.get("/api/v1/youtube-videos?query=organic farming")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "videos" in data


@pytest.mark.asyncio
async def test_detect_disease_no_file(client):
    """Test disease detection without file upload."""
    response = await client.post("/api/v1/detect-disease")
    assert response.status_code == 422  # Missing file
