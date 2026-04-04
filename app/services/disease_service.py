"""Disease detection service — image upload → CNN inference → recommendations."""

from app.ai.disease_model.inference import predict_disease
from app.core.exceptions import InvalidImageError
from app.core.logging_config import get_logger

logger = get_logger(__name__)


async def detect_disease(image_bytes: bytes, top_k: int = 3) -> dict:
    """Process an uploaded image for disease detection.

    Args:
        image_bytes: Raw bytes of the uploaded image.
        top_k: Number of top predictions to return.

    Returns:
        dict with predictions, crop_name, and recommendation.
    """
    if not image_bytes:
        raise InvalidImageError("No image data provided")

    # Validate it's a real image
    try:
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
    except Exception:
        raise InvalidImageError("Uploaded file is not a valid image")

    logger.info("disease_detection_started", image_size=len(image_bytes))

    import asyncio
    predictions = await asyncio.to_thread(predict_disease, image_bytes, top_k)

    if not predictions:
        return {
            "predictions": [],
            "crop_name": "Unknown",
            "recommendation": "Could not analyze the image. Please try with a clearer photo.",
        }

    top = predictions[0]
    is_healthy = "healthy" in top["class_name"].lower()

    if is_healthy:
        recommendation = (
            f"Your {top['crop_name']} plant appears healthy! "
            "Continue with regular watering, fertilization, and pest monitoring."
        )
    else:
        recommendation = (
            f"Detected {top['disease_name']} on {top['crop_name']}.\n"
            f"Treatment: {top['treatment']}\n"
            "⚠️ Always wear protective gear when applying pesticides."
        )

    return {
        "predictions": predictions,
        "crop_name": top["crop_name"],
        "recommendation": recommendation,
    }
