"""Database models package."""

from app.db.models.user import FarmerProfile
from app.db.models.query import QueryLog

__all__ = ["FarmerProfile", "QueryLog"]
