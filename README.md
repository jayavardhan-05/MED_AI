# 🏥 MED AI — Universal Clinical Intelligence Suite

A full-stack, AI-powered universal medical assistant and clinical decision support system. MED AI combines a high-performance **FastAPI** backend with a modern **React + TypeScript** frontend to deliver accurate, structured, and evidence-grounded medical guidance across all clinical specialties.

![MED AI](https://img.shields.io/badge/MED%20AI-Clinical%20Intelligence-0284c7?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)
![Groq](https://img.shields.io/badge/LLM-Groq%20AI%20(Free)-f55036?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ⚡ Quick Start

Run both backend and frontend with simple commands:

```bash
# Terminal 1 — Start Backend API (Port 8000)
cd backend
python run.py

# Terminal 2 — Start Frontend App (Port 8080)
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#️-system-architecture)
- [Clinical Intent Engine](#-clinical-intent-engine)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration (.env)](#-configuration-env)
- [API Endpoints](#-api-endpoints)
- [Short Running Commands](#-short-running-commands)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

Unlike traditional single-source textbook lookups, **MED AI** is a universal clinical assistant capable of answering questions across **all medical disciplines**:

- **Universal Medical Synthesis**: Answers any medical inquiry, from everyday patient questions to complex pathology.
- **Evidence-Based Knowledge Grounding**: RAG vector database (FAISS) indexing *Robbins & Cotran: Pathologic Basis of Disease* and the *Clinical Pharmacology & Therapeutics Manual*.
- **Dynamic File Ingestion**: Drag-and-drop any custom medical PDF or text file into active memory.
- **Clinical Intent Classification**: Detects the query domain (Pharmacology, Diagnostics, Pathology, Patient Relief, Surgery) and tailors the clinical structure automatically.
- **Safety Triage Guardrails**: Flags life-threatening emergencies (e.g., myocardial infarction, stroke, anaphylaxis) with instant alert protocols.
- **Multi-Turn Clinical Memory**: Retains conversational context across back-and-forth consultation turns.

---

## ✨ Key Features

### 1. 🤖 Universal Multi-Provider LLM Engine
- **Groq AI (Default & Free)**: Ultra-fast inference with `openai/gpt-oss-120b` and `qwen/qwen3.8-27b`.
- **Multi-Provider Fallback**: Built-in support for Google Gemini (`gemini-1.5-flash`), Together AI, and OpenAI (`gpt-4o-mini`).
- **Offline Extractive Synthesizer**: Pure Python fallback synthesizing cited evidence if offline.

### 2. 📄 Dynamic Medical Document Ingestion
- Upload any medical research paper, clinical protocol, or textbook in **PDF, TXT, or MD** format.
- Automatically parsed with `PyPDF2`, chunked with `RecursiveCharacterTextSplitter`, and vectorized into FAISS in real time.

### 3. 🧠 Smart Clinical Intent Classifier & Routing
Automatically classifies queries into specialized domains:
- 💊 **Pharmacology & Drug Therapy**: MOA, clinical dosing tables, adverse reactions, and contraindications.
- 🩺 **Differential Diagnosis & Symptoms**: Presentation, emergency workup, and common vs. can't-miss diagnoses.
- 🔬 **Pathology & Disease Mechanisms**: Stepwise cellular pathogenesis, etiology, and histomorphology.
- 🩹 **Clinical Management & Interventions**: First-line regimens, surgical timing, and monitoring protocols.
- 🌡️ **Patient Care & Symptom Relief**: Plain-language, friendly home care guidance, OTC dosing, and red flags.

### 4. 🚨 Emergency Red-Flag Triage System
- Real-time detection of life-threatening clinical presentations:
  - Acute Coronary Syndrome (ACS / Heart Attack)
  - Acute Stroke (FAST signs)
  - Severe Anaphylaxis
  - Thunderclap Headache (SAH)
  - Acute Poisoning & Toxic Ingestions
  - Crisis Intervention / Mental Health
- Renders high-priority alert cards instructing immediate emergency evaluation (911 / 112 / 999).

### 5. 💬 Multi-Turn Clinical Context Memory
- Maintains full conversational memory across consultation turns.
- Supports follow-ups such as: *"What if the patient is a child?"* or *"Can this be combined with metformin?"*.
- Includes a **"New Case"** button to reset consultation state.

### 6. 🎙️ Voice Dictation (Web Speech API)
- Click the microphone button in the chat input bar to speak complex medical terms hands-free.

### 7. 📑 Clinical Case Summary Export
- **Print / Save as PDF**: Formats a clinic-ready consultation summary report.
- **Markdown Export (`.md`)**: Downloads a timestamped consultation file with dialogue turns, detected intents, and cited references.

### 8. 📊 Structured Table Boxes
- Integrates `react-markdown` and `remark-gfm` to render clinical comparison tables into styled, responsive card boxes with zebra shading.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   MED AI Frontend                      │
│             React 18 + TypeScript + Vite               │
│  • Voice Dictation (🎙️)      • GFM Table Boxes (📊)     │
│  • Intent Badges (💊/🩺)    • PDF/MD Case Export (📑)   │
└───────────────────────────▲────────────────────────────┘
                            │ HTTP / Reverse Proxy (:8080)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend                      │
│                 Python 3.10+ (:8000)                   │
├────────────────────────────────────────────────────────┤
│  1. Emergency Red-Flag Triage Detector                 │
│  2. Clinical Intent Classifier & Prompt Routing        │
│  3. Multi-Turn Context Assembler                       │
│  4. FAISS Semantic Retriever (MiniLM-L6-v2)            │
│  5. Dynamic PDF/TXT Ingestor & Text Splitter           │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
                ▼                        ▼
┌───────────────────────────────┐ ┌──────────────────────┐
│       Vector Database         │ │    LLM Providers     │
│       FAISS (Local)           │ │ • Groq (Fast & Free) │
│ • Robbins Pathology Core      │ │ • Google Gemini      │
│ • Clinical Pharmacology Core  │ │ • Together AI        │
│ • User-Uploaded Documents     │ │ • OpenAI             │
└───────────────────────────────┘ └──────────────────────┘
```

---

## 🩺 Clinical Intent Engine

| Intent Domain | Icon | Key Focus Areas | Output Structure |
| :--- | :---: | :--- | :--- |
| **Patient Care & Relief** | 🌡️ | Home care, temperature reduction, comfort | Friendly plain-language steps, OTC dosing, red flags |
| **Pharmacology & Drugs** | 💊 | Drug mechanism, dosing, adverse effects | MOA, approved indications, side effects, drug interactions |
| **Diagnostics & Symptoms** | 🩺 | Clinical presentation, workup, differentials | Common causes, differential table, diagnostic workup |
| **Pathology & Mechanisms** | 🔬 | Cellular injury, morphology, etiology | Stepwise pathogenesis, histomorphology, clinical correlation |
| **Clinical Management** | 🩹 | Medical regimens, surgical interventions | First-line therapies, procedural timing, complications |

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Asynchronous ASGI)
- **Language**: Python 3.10+
- **Server**: Uvicorn (with live reload)
- **Vector Search**: FAISS (`faiss-cpu`)
- **Embeddings**: HuggingFace `all-MiniLM-L6-v2` via `sentence-transformers`
- **Text Processing**: `langchain-text-splitters`, `PyPDF2`
- **Primary LLM**: Groq Cloud API (`openai/gpt-oss-120b`, `qwen/qwen3.8-27b`)

### Frontend
- **Framework**: React 18.3
- **Language**: TypeScript
- **Bundler**: Vite 5.4
- **Styling**: Tailwind CSS + `@tailwindcss/typography`
- **Components**: shadcn/ui + Radix UI primitives
- **Markdown & Tables**: `react-markdown` + `remark-gfm`
- **Icons**: Lucide React
- **Notifications**: Sonner

---

## 📁 Project Structure

```
MED_AI/
│
├── backend/                             # FastAPI Backend Service
│   ├── data/
│   │   ├── clinical_pharmacology_guide.txt  # Core pharmacology knowledge
│   │   └── uploads/                         # User-uploaded PDFs/documents
│   ├── my_faiss_index/                  # Local FAISS vector index
│   ├── app.py                           # Core API server & clinical logic
│   ├── run.py                           # Short backend runner
│   ├── requirements.txt                 # Python dependencies
│   ├── .env                             # Private API keys (git-ignored)
│   ├── .env.example                     # Environment template
│   └── .gitignore                       # Backend ignore rules
│
├── frontend/                            # React + TypeScript + Vite UI
│   ├── public/
│   │   ├── med-ai-logo.svg              # Custom MED AI vector logo
│   │   └── favicon.svg                  # Website vector favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx        # Chat UI, voice, memory, triage
│   │   │   ├── Header.tsx               # Top navigation bar
│   │   │   ├── MarkdownRenderer.tsx     # GFM table boxes & card formatting
│   │   │   ├── SourceDisplay.tsx        # Cited sources & active libraries
│   │   │   └── ui/                      # shadcn/ui component primitives
│   │   ├── lib/
│   │   │   ├── api.ts                   # Typed API service client
│   │   │   ├── config.ts                # API configuration & endpoints
│   │   │   └── utils.ts                 # Utility functions
│   │   ├── pages/
│   │   │   └── Index.tsx                # Main application page
│   │   ├── App.tsx                      # App root component
│   │   ├── index.css                    # Tailwind design system
│   │   └── main.tsx                     # React DOM entry point
│   ├── package.json                     # Frontend dependencies & scripts
│   ├── vite.config.ts                   # Vite config with API proxy
│   └── .gitignore                       # Frontend ignore rules
│
├── package.json                         # Root project proxy scripts
├── .gitignore                           # Repository master gitignore
└── README.md                            # Documentation
```

---

## 📦 Installation & Setup

### Prerequisites
- **Python**: 3.10, 3.11, or 3.12
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher

### 1. Clone the Repository
```bash
git clone https://github.com/jayavardhan-05/MED_AI.git
cd MED_AI
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env
```

Open `backend/.env` and add your free Groq API key:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install Node dependencies
npm install
```

---

## ⚙️ Configuration (.env)

In `backend/.env`:

```env
# Primary LLM — 100% Free at https://console.groq.com
GROQ_API_KEY=gsk_your_groq_key_here

# Optional Alternative Providers
GEMINI_API_KEY=
TOGETHER_API_KEY=
OPENAI_API_KEY=
```

---

## 🚀 Short Running Commands

### Run Everything from Project Root

| Task | Command |
| :--- | :--- |
| **Start Backend** | `npm run backend` *(or `cd backend && python run.py`)* |
| **Start Frontend** | `npm run dev` |
| **Build Frontend** | `npm run build` |

### Run from Specific Directories

```bash
# Inside backend/
python run.py
# (or python app.py)

# Inside frontend/
npm run dev
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root health check & greeting |
| `GET` | `/health` | Server status (`{"status": "healthy"}`) |
| `GET` | `/documents` | Lists active knowledge bases & indexed documents |
| `POST` | `/upload` | Multipart file upload for PDF, TXT, or MD ingestion |
| `POST` | `/ask` | Primary clinical Q&A endpoint (accepts question & multi-turn history) |

### Sample `/ask` Request
```json
POST /ask
Content-Type: application/json

{
  "question": "What is the mechanism of action and dose of Lisinopril?",
  "conversation_history": [
    { "role": "user", "content": "What are the first-line treatments for hypertension?" },
    { "role": "assistant", "content": "First-line agents include ACE inhibitors..." }
  ]
}
```

### Sample `/ask` Response
```json
{
  "answer": "**💊 Drug Class & Mechanism of Action**\n...",
  "sources": [
    {
      "content": "Lisinopril is a competitive ACE inhibitor...",
      "metadata": { "source": "Clinical Pharmacology & Therapeutics Manual" }
    }
  ],
  "intent": {
    "category": "Pharmacology & Drug Therapy",
    "icon": "💊",
    "focus": "Mechanism of Action (MOA), Clinical Dosing, Adverse Reactions & Interactions"
  },
  "red_flag": null
}
```

---

## ⚠️ Medical Disclaimer

**MED AI** is intended for educational, research, and clinical decision support purposes only. It is **not** a substitute for professional medical advice, clinical diagnosis, or hospital emergency protocols. Always seek the advice of a qualified healthcare provider with any questions regarding medical conditions or treatments.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
