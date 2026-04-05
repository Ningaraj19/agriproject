"""API endpoint: GET /youtube-videos — Farming video recommendations."""

from fastapi import APIRouter, Query

from app.schemas.youtube import YouTubeResponse, YouTubeVideo
from app.services.youtube_service import search_videos
from app.core.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get(
    "/youtube-videos",
    response_model=YouTubeResponse,
    summary="Get farming video recommendations",
    description="Search for relevant farming/agriculture YouTube videos.",
    tags=["YouTube"],
)
async def youtube_videos_endpoint(
    query: str = Query(..., min_length=1, max_length=200, description="Video search query"),
    language: str = Query("en", description="Language preference: en or kn"),
    max_results: int = Query(5, ge=1, le=20, description="Max results to return"),
):
    """Get YouTube farming video recommendations."""
    result = await search_videos(query, language, max_results)

    videos = [YouTubeVideo(**v) for v in result["videos"]]

    return YouTubeResponse(
        videos=videos,
        query_used=result["query_used"],
    )
