"""Training pipeline for the crop disease classification model.

Usage:
    python -m app.ai.disease_model.train --data_dir ./data/plantvillage --epochs 15
"""

import argparse
import os
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

from app.ai.disease_model.model import CropDiseaseModel


def get_transforms() -> dict:
    """Return training and validation transforms with augmentation."""
    return {
        "train": transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ]),
        "val": transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ]),
    }


def train_model(
    data_dir: str,
    output_path: str = "./data/disease_model/model.pth",
    num_epochs: int = 15,
    batch_size: int = 32,
    learning_rate: float = 1e-4,
    device: str | None = None,
) -> None:
    """Full training pipeline for the CNN disease classifier.

    Expects data_dir to follow ImageFolder structure:
        data_dir/
            train/
                Apple___Apple_scab/
                    img1.jpg
                    ...
                Apple___Black_rot/
                    ...
            val/
                ...
    """
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    print(f"🌾 Training on device: {device}")

    data_transforms = get_transforms()

    # Build datasets
    train_dataset = datasets.ImageFolder(
        os.path.join(data_dir, "train"), transform=data_transforms["train"]
    )
    val_dataset = datasets.ImageFolder(
        os.path.join(data_dir, "val"), transform=data_transforms["val"]
    )

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=4)

    num_classes = len(train_dataset.classes)
    print(f"📊 Classes: {num_classes}, Train: {len(train_dataset)}, Val: {len(val_dataset)}")

    # Build model
    model = CropDiseaseModel(num_classes=num_classes, pretrained=True).to(device)

    # Freeze early layers, fine-tune later layers
    for param in list(model.model.parameters())[:-20]:
        param.requires_grad = False

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=learning_rate)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.1)

    best_val_acc = 0.0

    for epoch in range(num_epochs):
        # ── Training phase ──
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            _, predicted = outputs.max(1)
            correct += predicted.eq(labels).sum().item()
            total += labels.size(0)

        train_acc = correct / total
        train_loss = running_loss / total

        # ── Validation phase ──
        model.eval()
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = outputs.max(1)
                val_correct += predicted.eq(labels).sum().item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total
        scheduler.step()

        print(
            f"  Epoch [{epoch + 1}/{num_epochs}] "
            f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f} | Val Acc: {val_acc:.4f}"
        )

        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "num_classes": num_classes,
                    "class_names": train_dataset.classes,
                    "val_accuracy": val_acc,
                },
                output_path,
            )
            print(f"  ✅ Best model saved (val_acc={val_acc:.4f})")

    print(f"\n🎉 Training complete! Best validation accuracy: {best_val_acc:.4f}")
    print(f"📁 Model saved to: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train crop disease classification model")
    parser.add_argument("--data_dir", required=True, help="Path to PlantVillage dataset")
    parser.add_argument("--output", default="./data/disease_model/model.pth")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    args = parser.parse_args()

    train_model(
        data_dir=args.data_dir,
        output_path=args.output,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
    )
