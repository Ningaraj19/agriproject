# 🌾 AgriAI — AI-Powered Agriculture Platform

> Production-ready AI application that helps farmers with crop advice, disease detection, weather insights, market prices, and government schemes.

![Python 3.11](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![LangChain](https://img.shields.io/badge/LangChain-RAG-orange)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

| Feature | Description | Technology |
|---------|-------------|------------|
| 🤖 **AI Chatbot** | Agriculture Q&A with RAG | LangChain + Groq (Llama3/Mistral) |
| 🔬 **Disease Detection** | Leaf image → disease classification | PyTorch CNN (ResNet18) |
| 🌤️ **Weather Advice** | Weather-based farming recommendations | Open-Meteo API (free) |
| 📊 **Market Prices** | Crop prices across Indian APMCs | Data-driven analytics |
| 🏛️ **Gov Schemes** | Search agricultural subsidies/programs | RAG + curated database |
| 🎥 **YouTube Videos** | Farming video recommendations | YouTube Data API v3 |
| 🎙️ **Voice Assistant** | Speech-to-text & text-to-speech | faster-whisper + gTTS |
| 🌐 **Multilingual** | English + Kannada (ಕನ್ನಡ) | MarianMT translation |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FastAPI Application                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  API Layer: /ask  /detect-disease  /weather  /market   │  │
│  │             /schemes  /youtube-videos  /voice          │  │
│  └───────────────────────┬────────────────────────────────┘  │
│                          │                                    │
│  ┌───────────────────────▼────────────────────────────────┐  │
│  │             Service Layer (Business Logic)              │  │
│  │  Chat · Disease · Weather · Market · Schemes · Voice    │  │
│  └──────┬──────────┬──────────┬───────────────────────────┘  │
│         │          │          │                               │
│  ┌──────▼──┐ ┌─────▼────┐ ┌──▼──────────┐                  │
│  │ AI/RAG  │ │ CNN Model │ │ Translation │                  │
│  │ Pipeline│ │ (ResNet)  │ │  (MarianMT) │                  │
│  └──┬───┬──┘ └──────────┘ └─────────────┘                  │
│     │   │                                                    │
│  ┌──▼┐ ┌▼────────┐   ┌──────────┐                          │
│  │Groq│ │ChromaDB │   │PostgreSQL│                           │
│  └───┘ └─────────┘   └──────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 16+
- [Ollama](https://ollama.ai) installed and running
- (Optional) Docker & Docker Compose

### 1. Clone & Setup

```bash
git clone https://github.com/your-username/agri-ai.git
cd agri-ai

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
copy .env.example .env
# Edit .env with your database credentials and settings
```

### 3. Setup Groq LLM

```bash
# Get your free API key from https://console.groq.com
# Add it to your .env file:
# GROQ_API_KEY=your_groq_api_key_here
```

### 4. Initialize Database

```bash
# Create PostgreSQL database
# psql -U postgres -c "CREATE DATABASE agridb;"
# psql -U postgres -c "CREATE USER agriuser WITH PASSWORD 'agripass';"
# psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE agridb TO agriuser;"

# The app will auto-create tables on first start
```

### 5. Ingest Knowledge Base

```bash
python -m scripts.ingest_knowledge
```

### 6. Run the Application

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit **http://localhost:8000/docs** for the interactive Swagger UI.

---

## 🐳 Docker Deployment

```bash
# Start all services (app + PostgreSQL)
# Make sure GROQ_API_KEY is set in your .env file
docker-compose up -d

# Check logs
docker-compose logs -f app
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/v1/ask` | AI chatbot (agriculture Q&A) |
| `POST` | `/api/v1/detect-disease` | Disease detection (image upload) |
| `GET` | `/api/v1/weather?latitude=12.97&longitude=77.59` | Weather + farming advice |
| `GET` | `/api/v1/market?crop=Rice` | Market prices |
| `GET` | `/api/v1/schemes?query=crop+insurance` | Government schemes |
| `GET` | `/api/v1/youtube-videos?query=organic+farming` | YouTube videos |
| `POST` | `/api/v1/voice/stt` | Speech to text |
| `POST` | `/api/v1/voice/tts` | Text to speech |

### Example: Ask a Question
```bash
curl -X POST http://localhost:8000/api/v1/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the best season to grow rice in Karnataka?"}'
```

### Example: Get Weather Advice
```bash
curl "http://localhost:8000/api/v1/weather?latitude=12.97&longitude=77.59&crop=Rice"
```

---

## 🧠 ML Model Training

### Disease Detection CNN

```bash
# Download PlantVillage dataset
# Organize into train/val splits

python -m app.ai.disease_model.train \
  --data_dir ./data/plantvillage \
  --epochs 15 \
  --batch_size 32
```

---

## 🧪 Testing

```bash
pytest tests/ -v
```

---

## 📁 Project Structure

```
agriproject/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py             # Pydantic settings
│   ├── api/endpoints/        # API route handlers
│   ├── core/                 # Middleware, exceptions, logging
│   ├── db/models/            # SQLAlchemy ORM models
│   ├── schemas/              # Pydantic request/response models
│   ├── services/             # Business logic layer
│   └── ai/
│       ├── rag/              # LangChain RAG pipeline
│       ├── llm/              # Ollama LLM provider
│       └── disease_model/    # CNN model (ResNet18)
├── data/knowledge_base/      # RAG source documents
├── scripts/                  # Ingestion & seed scripts
├── tests/                    # Pytest test suite
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Full stack deployment
└── requirements.txt          # Python dependencies
```

---

## 🔧 Tech Stack

- **Backend**: Python 3.11 · FastAPI · SQLAlchemy (async)
- **AI/LLM**: Groq (Llama3/Mistral) · LangChain · ChromaDB · HuggingFace
- **ML**: PyTorch · ResNet18 · torchvision
- **Translation**: Helsinki-NLP MarianMT
- **Voice**: faster-whisper · gTTS
- **Database**: PostgreSQL · Alembic
- **Deployment**: Docker · docker-compose

---

## 📄 License

MIT License — free for personal and commercial use.
