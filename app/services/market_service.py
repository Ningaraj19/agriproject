"""Market price service — crop market price data and analysis.

Uses a data-driven approach with realistic Indian market data.
Can be extended to integrate with real APIs like data.gov.in or Agmarknet.
"""

from app.core.logging_config import get_logger

logger = get_logger(__name__)

# Realistic Indian crop market data (can be replaced with live API)
MARKET_DATA = {
    "Rice": [
        {"market": "Raichur (Karnataka)", "price_per_quintal": 2200, "trend": "up", "last_updated": "2026-03-15"},
        {"market": "Davangere (Karnataka)", "price_per_quintal": 2150, "trend": "stable", "last_updated": "2026-03-15"},
        {"market": "Guntur (Andhra Pradesh)", "price_per_quintal": 2300, "trend": "up", "last_updated": "2026-03-15"},
    ],
    "Wheat": [
        {"market": "Hubli (Karnataka)", "price_per_quintal": 2400, "trend": "stable", "last_updated": "2026-03-15"},
        {"market": "Delhi (NCR)", "price_per_quintal": 2600, "trend": "up", "last_updated": "2026-03-15"},
        {"market": "Indore (MP)", "price_per_quintal": 2500, "trend": "down", "last_updated": "2026-03-15"},
    ],
    "Tomato": [
        {"market": "Kolar (Karnataka)", "price_per_quintal": 1800, "trend": "up", "last_updated": "2026-03-15"},
        {"market": "Bangalore APMC", "price_per_quintal": 2000, "trend": "up", "last_updated": "2026-03-15"},
        {"market": "Madanapalle (AP)", "price_per_quintal": 1600, "trend": "stable", "last_updated": "2026-03-15"},
    ],
    "Onion": [
        {"market": "Hubli (Karnataka)", "price_per_quintal": 1200, "trend": "down", "last_updated": "2026-03-15"},
        {"market": "Nashik (Maharashtra)", "price_per_quintal": 1100, "trend": "down", "last_updated": "2026-03-15"},
        {"market": "Lasalgaon (Maharashtra)", "price_per_quintal": 1050, "trend": "stable", "last_updated": "2026-03-15"},
    ],
    "Ragi": [
        {"market": "Hassan (Karnataka)", "price_per_quintal": 3500, "trend": "up", "last_updated": "2026-03-15"},
        {"market": "Tumkur (Karnataka)", "price_per_quintal": 3400, "trend": "stable", "last_updated": "2026-03-15"},
    ],
    "Sugarcane": [
        {"market": "Belgaum (Karnataka)", "price_per_quintal": 350, "trend": "stable", "last_updated": "2026-03-15"},
        {"market": "Kolhapur (Maharashtra)", "price_per_quintal": 370, "trend": "up", "last_updated": "2026-03-15"},
    ],
    "Cotton": [
        {"market": "Hubli (Karnataka)", "price_per_quintal": 6500, "trend": "up", "last_updated": "2026-03-15"},
        {"market": "Rajkot (Gujarat)", "price_per_quintal": 6800, "trend": "up", "last_updated": "2026-03-15"},
    ],
    "Potato": [
        {"market": "Bangalore APMC", "price_per_quintal": 1500, "trend": "stable", "last_updated": "2026-03-15"},
        {"market": "Agra (UP)", "price_per_quintal": 1200, "trend": "down", "last_updated": "2026-03-15"},
    ],
}


async def get_market_prices(crop: str | None = None, state: str | None = None) -> dict:
    """Get crop market prices with optional filtering.

    Args:
        crop: Filter by crop name.
        state: Filter by state name.

    Returns:
        dict with prices list and analysis summary.
    """
    logger.info("market_price_query", crop=crop, state=state)

    prices = []

    for crop_name, markets in MARKET_DATA.items():
        # Filter by crop
        if crop and crop.lower() not in crop_name.lower():
            continue

        for entry in markets:
            # Filter by state
            if state and state.lower() not in entry["market"].lower():
                continue

            prices.append({
                "crop_name": crop_name,
                "market": entry["market"],
                "price_per_quintal": entry["price_per_quintal"],
                "unit": "INR",
                "trend": entry["trend"],
                "last_updated": entry["last_updated"],
            })

    # Generate analysis
    analysis = _generate_market_analysis(prices, crop)

    logger.info("market_prices_returned", count=len(prices))

    return {
        "prices": prices,
        "analysis": analysis,
    }


def _generate_market_analysis(prices: list[dict], crop: str | None) -> str:
    """Generate a market analysis summary."""
    if not prices:
        return "No market data available for the specified criteria."

    up_count = sum(1 for p in prices if p["trend"] == "up")
    down_count = sum(1 for p in prices if p["trend"] == "down")
    avg_price = sum(p["price_per_quintal"] for p in prices) / len(prices)

    parts = [f"📊 Showing {len(prices)} market entries."]
    parts.append(f"Average price: ₹{avg_price:,.0f}/quintal.")

    if up_count > down_count:
        parts.append("📈 Overall market trend is upward — good time to sell.")
    elif down_count > up_count:
        parts.append("📉 Overall market trend is downward — consider holding if storage is available.")
    else:
        parts.append("➡️ Market is stable. Monitor for changes before selling.")

    if crop:
        highest = max(prices, key=lambda p: p["price_per_quintal"])
        parts.append(f"💰 Best price for {crop}: ₹{highest['price_per_quintal']:,}/quintal at {highest['market']}.")

    return " ".join(parts)
