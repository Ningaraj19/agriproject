"""Aggregated API router — combines all endpoint routers."""

from fastapi import APIRouter

from app.api.endpoints import chat, disease, weather, market, schemes, youtube, voice

api_router = APIRouter()

api_router.include_router(chat.router)
api_router.include_router(disease.router)
api_router.include_router(weather.router)
api_router.include_router(market.router)
api_router.include_router(schemes.router)
api_router.include_router(youtube.router)
api_router.include_router(voice.router)
