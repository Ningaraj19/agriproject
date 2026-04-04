"""ResNet18-based CNN model for crop disease classification."""

import torch
import torch.nn as nn
from torchvision import models


# 38 classes from the PlantVillage dataset
DISEASE_CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust",
    "Apple___healthy", "Blueberry___healthy", "Cherry___Powdery_mildew",
    "Cherry___healthy", "Corn___Cercospora_leaf_spot", "Corn___Common_rust",
    "Corn___Northern_Leaf_Blight", "Corn___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot",
    "Peach___healthy", "Pepper_bell___Bacterial_spot", "Pepper_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy", "Rice___Brown_spot", "Rice___Leaf_blast",
    "Rice___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew", "Strawberry___Leaf_scorch",
    "Strawberry___healthy", "Tomato___Bacterial_spot", "Tomato___Early_blight",
    "Tomato___Late_blight", "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites", "Tomato___healthy",
]

DISEASE_TREATMENTS = {
    "Apple___Apple_scab": "Apply fungicide (captan or myclobutanil). Remove fallen leaves. Prune for air circulation.",
    "Apple___Black_rot": "Remove mummified fruits. Apply fungicide during bloom. Practice good sanitation.",
    "Corn___Common_rust": "Apply fungicide if severe. Plant resistant varieties. Monitor humidity levels.",
    "Potato___Early_blight": "Apply chlorothalonil or mancozeb fungicide. Rotate crops. Remove infected debris.",
    "Potato___Late_blight": "Apply metalaxyl-based fungicide. Destroy infected plants. Avoid overhead irrigation.",
    "Rice___Brown_spot": "Apply fungicide (mancozeb). Ensure balanced nitrogen fertilization. Use resistant varieties.",
    "Rice___Leaf_blast": "Apply tricyclazole fungicide. Avoid excess nitrogen. Use resistant varieties.",
    "Tomato___Bacterial_spot": "Apply copper-based fungicide. Avoid overhead watering. Use certified disease-free seeds.",
    "Tomato___Early_blight": "Apply chlorothalonil fungicide. Mulch around plants. Practice crop rotation.",
    "Tomato___Late_blight": "Apply mancozeb or chlorothalonil. Remove infected plants. Improve air circulation.",
    "Tomato___Leaf_Mold": "Improve ventilation. Reduce humidity. Apply fungicide if needed.",
    "Tomato___Septoria_leaf_spot": "Apply fungicide. Remove lower infected leaves. Practice crop rotation.",
}


class CropDiseaseModel(nn.Module):
    """ResNet18-based model for crop disease classification.

    Uses transfer learning from ImageNet pretrained weights.
    The final fully connected layer is replaced to output `num_classes` predictions.
    """

    def __init__(self, num_classes: int = 38, pretrained: bool = True):
        super().__init__()
        self.model = models.resnet18(
            weights=models.ResNet18_Weights.DEFAULT if pretrained else None
        )
        # Replace final FC layer
        in_features = self.model.fc.in_features
        self.model.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)

    @staticmethod
    def get_disease_name(class_idx: int) -> str:
        """Convert class index to human-readable disease name."""
        if 0 <= class_idx < len(DISEASE_CLASSES):
            return DISEASE_CLASSES[class_idx].replace("___", " — ").replace("_", " ")
        return "Unknown"

    @staticmethod
    def get_treatment(class_name: str) -> str:
        """Get treatment recommendation for a disease."""
        return DISEASE_TREATMENTS.get(class_name, "Consult a local agricultural extension officer for specific treatment advice.")

    @staticmethod
    def get_crop_name(class_name: str) -> str:
        """Extract crop name from the class label."""
        return class_name.split("___")[0] if "___" in class_name else "Unknown"
