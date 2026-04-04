"""Seed database with sample farmer profiles.

Usage:
    python -m scripts.seed_data
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import async_session_factory, init_db
from app.db.models.user import FarmerProfile
from app.core.logging_config import setup_logging

setup_logging(debug=True)

SAMPLE_FARMERS = [
    {
        "name": "Ramesh Kumar",
        "phone": "+919876543210",
        "location": "Mandya, Karnataka",
        "state": "Karnataka",
        "preferred_language": "kn",
    },
    {
        "name": "Lakshmi Devi",
        "phone": "+919876543211",
        "location": "Raichur, Karnataka",
        "state": "Karnataka",
        "preferred_language": "kn",
    },
    {
        "name": "Suresh Patil",
        "phone": "+919876543212",
        "location": "Hubli, Karnataka",
        "state": "Karnataka",
        "preferred_language": "en",
    },
    {
        "name": "Priya Sharma",
        "phone": "+919876543213",
        "location": "Bangalore Rural, Karnataka",
        "state": "Karnataka",
        "preferred_language": "en",
    },
]


async def seed():
    """Seed database with sample data."""
    print("🌱 Seeding database with sample farmer profiles...")

    await init_db()

    async with async_session_factory() as session:
        for farmer_data in SAMPLE_FARMERS:
            farmer = FarmerProfile(**farmer_data)
            session.add(farmer)
            print(f"   Added: {farmer_data['name']} ({farmer_data['location']})")

        await session.commit()

    print(f"\n✅ Seeded {len(SAMPLE_FARMERS)} farmer profiles!")


if __name__ == "__main__":
    asyncio.run(seed())
