"""Pydantic schemas for the /market endpoint."""

from pydantic import BaseModel, Field


class CropPrice(BaseModel):
    """Price info for a single crop."""

    crop_name: str
    market: str
    price_per_quintal: float
    unit: str = "INR"
    trend: str = Field(default="stable", description="up / down / stable")
    last_updated: str = ""


class MarketRequest(BaseModel):
    """Query for market prices."""

    crop: str | None = Field(None, description="Filter by crop name")
    state: str | None = Field(None, description="Filter by state")


class MarketResponse(BaseModel):
    """Response from the market prices endpoint."""

    success: bool = True
    prices: list[CropPrice]
    analysis: str = ""
