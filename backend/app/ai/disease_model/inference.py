"""Inference service for the crop disease CNN model."""

import io
from pathlib import Path

import torch
from PIL import Image
from torchvision import transforms

from app.ai.disease_model.model import CropDiseaseModel, DISEASE_CLASSES
from app.config import get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)

_model: CropDiseaseModel | None = None
_device: str = "cpu"


# Inference pre-processing (matches training validation transforms)
INFERENCE_TRANSFORM = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def load_model() -> CropDiseaseModel | None:
    """Load the trained model from disk. Returns None if model file doesn't exist."""
    global _model, _device

    if _model is not None:
        return _model

    settings = get_settings()
    model_path = Path(settings.disease_model_path)

    if not model_path.exists():
        logger.warning("disease_model_not_found", path=str(model_path))
        return None

    _device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info("loading_disease_model", path=str(model_path), device=_device)

    checkpoint = torch.load(model_path, map_location=_device, weights_only=False)
    num_classes = checkpoint.get("num_classes", settings.disease_model_num_classes)

    _model = CropDiseaseModel(num_classes=num_classes, pretrained=False)
    _model.load_state_dict(checkpoint["model_state_dict"])
    _model.to(_device)
    _model.eval()

    logger.info("disease_model_loaded", num_classes=num_classes)
    return _model


def predict_disease(image_bytes: bytes, top_k: int = 3) -> list[dict]:
    """Run inference on an image and return top-k predictions.

    Args:
        image_bytes: Raw image bytes.
        top_k: Number of top predictions to return.

    Returns:
        List of dicts with keys: class_name, disease_name, confidence, crop_name, treatment
    """
    model = load_model()

    if model is None:
        # Return a demo/fallback prediction if model isn't trained yet
        logger.warning("using_demo_prediction")
        return [
            {
                "class_name": "Tomato___Late_blight",
                "disease_name": "Tomato — Late blight",
                "confidence": 0.0,
                "crop_name": "Tomato",
                "treatment": CropDiseaseModel.get_treatment("Tomato___Late_blight"),
                "note": "Demo prediction — model not yet trained. Run the training pipeline first.",
            }
        ]

    # Preprocess image
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    input_tensor = INFERENCE_TRANSFORM(image).unsqueeze(0).to(_device)

    # Run inference
    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        top_probs, top_indices = torch.topk(probabilities, top_k)

    results = []
    for prob, idx in zip(top_probs[0], top_indices[0]):
        class_idx = idx.item()
        class_name = DISEASE_CLASSES[class_idx] if class_idx < len(DISEASE_CLASSES) else "Unknown"
        results.append({
            "class_name": class_name,
            "disease_name": CropDiseaseModel.get_disease_name(class_idx),
            "confidence": round(prob.item(), 4),
            "crop_name": CropDiseaseModel.get_crop_name(class_name),
            "treatment": CropDiseaseModel.get_treatment(class_name),
        })

    logger.info(
        "disease_prediction",
        top_result=results[0]["disease_name"] if results else "none",
        confidence=results[0]["confidence"] if results else 0,
    )

    return results
