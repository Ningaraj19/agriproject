"""Pydantic schemas for the /youtube-videos endpoint."""

from pydantic import BaseModel, Field


class YouTubeVideo(BaseModel):
    """Single YouTube video result."""

    title: str
    video_id: str
    url: str
    thumbnail_url: str = ""
    channel_name: str = ""
    description: str = ""
    published_at: str = ""


class YouTubeRequest(BaseModel):
    """Query for YouTube farming videos."""

    query: str = Field(..., min_length=1, max_length=200, description="Search query")
    language: str = Field("en", description="Language preference")
    max_results: int = Field(5, ge=1, le=20)


class YouTubeResponse(BaseModel):
    """Response from the YouTube videos endpoint."""

    success: bool = True
    videos: list[YouTubeVideo]
    query_used: str = ""
