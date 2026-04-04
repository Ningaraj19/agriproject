"""Pydantic schemas for the /schemes endpoint."""

from pydantic import BaseModel, Field


class GovernmentScheme(BaseModel):
    """Government scheme details."""

    name: str
    description: str
    eligibility: str = ""
    benefits: str = ""
    how_to_apply: str = ""
    website: str = ""


class SchemesRequest(BaseModel):
    """Query for government schemes."""

    query: str = Field(..., min_length=1, max_length=500, description="Search query")
    state: str | None = Field(None, description="Filter by state")


class SchemesResponse(BaseModel):
    """Response from the schemes endpoint."""

    success: bool = True
    schemes: list[GovernmentScheme]
    summary: str = ""
