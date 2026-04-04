"""YouTube farming video recommendation service.

Uses YouTube Data API v3 (free tier: 10,000 units/day).
Falls back to curated recommendations if no API key is configured.
"""

from app.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)

# Curated fallback video recommendations
CURATED_VIDEOS = [
    {
        "title": "Complete Guide to Organic Farming - Step by Step",
        "video_id": "organic_farming_guide",
        "url": "https://www.youtube.com/results?search_query=organic+farming+complete+guide",
        "thumbnail_url": "/hero-bg.jpg",
        "channel_name": "Agriculture Videos",
        "description": "Learn organic farming techniques from soil preparation to harvesting.",
        "published_at": "2025-01-15",
    },
    {
        "title": "Drip Irrigation System Setup for Small Farms",
        "video_id": "drip_irrigation_setup",
        "url": "https://www.youtube.com/results?search_query=drip+irrigation+setup+farm",
        "thumbnail_url": "/disease-bg.jpg",
        "channel_name": "Farm Technology",
        "description": "How to set up an efficient drip irrigation system for water conservation.",
        "published_at": "2025-02-10",
    },
    {
        "title": "Crop Disease Identification and Prevention",
        "video_id": "crop_disease_prevention",
        "url": "https://www.youtube.com/results?search_query=crop+disease+identification+prevention",
        "thumbnail_url": "/youtube-bg.jpg",
        "channel_name": "Agricultural Science",
        "description": "Learn to identify common crop diseases and organic prevention methods.",
        "published_at": "2025-03-01",
    },
    {
        "title": "Government Agricultural Schemes 2025-26 Explained",
        "video_id": "govt_agri_schemes",
        "url": "https://www.youtube.com/results?search_query=government+agriculture+schemes+2025+India",
        "thumbnail_url": "/weather-bg.jpg",
        "channel_name": "Farmer Help",
        "description": "Complete guide to PM-KISAN, PMFBY, KCC and other farmer welfare schemes.",
        "published_at": "2025-04-01",
    },
    {
        "title": "Ragi Cultivation - Seed to Harvest Guide (Kannada)",
        "video_id": "ragi_cultivation_kannada",
        "url": "https://www.youtube.com/results?search_query=ragi+cultivation+guide+kannada",
        "thumbnail_url": "/hero-bg.jpg",
        "channel_name": "Karnataka Krishi",
        "description": "ರಾಗಿ ಬೆಳೆಯುವ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶಿ - ಬಿತ್ತನೆಯಿಂದ ಕೊಯ್ಲಿನವರೆಗೆ.",
        "published_at": "2025-05-01",
    },
]


async def search_videos(query: str, language: str = "en", max_results: int = 5) -> dict:
    """Search for farming-related YouTube videos.

    Uses YouTube Data API v3 if API key is configured, otherwise returns curated results.

    Args:
        query: Search query for farming videos.
        language: Preferred language.
        max_results: Maximum number of results.

    Returns:
        dict with videos list and query_used.
    """
    settings = get_settings()

    # Enhance query with agriculture context
    enhanced_query = f"{query} farming agriculture"
    if language == "kn":
        enhanced_query += " ಕನ್ನಡ kannada"

    # Try YouTube API if key is configured
    if settings.youtube_api_key and settings.youtube_api_key != "your_youtube_api_key_here":
        try:
            return await _search_youtube_api(enhanced_query, max_results, settings.youtube_api_key)
        except Exception as e:
            logger.warning("youtube_api_failed", error=str(e))

    # Fallback to curated recommendations
    logger.info("using_curated_videos", query=query)

    # Filter curated videos by relevance
    query_lower = query.lower()
    relevant = [
        v for v in CURATED_VIDEOS
        if any(word in v["title"].lower() or word in v["description"].lower()
               for word in query_lower.split())
    ]

    # If no relevant matches, return all curated videos
    if not relevant:
        relevant = CURATED_VIDEOS

    videos = relevant[:max_results]

    return {
        "videos": videos,
        "query_used": enhanced_query,
    }


async def _search_youtube_api(query: str, max_results: int, api_key: str) -> dict:
    """Search YouTube using the Data API v3."""
    from googleapiclient.discovery import build

    import asyncio

    def _search():
        youtube = build("youtube", "v3", developerKey=api_key)
        request = youtube.search().list(
            part="snippet",
            q=query,
            type="video",
            maxResults=max_results,
            relevanceLanguage="en",
            safeSearch="strict",
        )
        return request.execute()

    response = await asyncio.to_thread(_search)

    videos = []
    for item in response.get("items", []):
        snippet = item["snippet"]
        video_id = item["id"]["videoId"]
        videos.append({
            "title": snippet["title"],
            "video_id": video_id,
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "thumbnail_url": snippet["thumbnails"]["medium"]["url"],
            "channel_name": snippet["channelTitle"],
            "description": snippet["description"][:200],
            "published_at": snippet["publishedAt"],
        })

    logger.info("youtube_api_results", count=len(videos))

    return {
        "videos": videos,
        "query_used": query,
    }
