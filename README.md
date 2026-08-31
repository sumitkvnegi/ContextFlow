# RAG Transcriber

A lightweight, production-ready app that lets you **upload documents or audio/video, transcribe media automatically, and chat with your content using RAG** (Retrieval-Augmented Generation).

It combines two ideas into one focused tool:

- **Transcription** — audio/video is converted to text with Whisper (local or OpenAI).
- **RAG** — all uploaded text (PDF/TXT/MD + transcripts) is chunked, embedded, and stored in Qdrant. A local Ollama LLM answers questions grounded **strictly** in your uploaded content.

There is **no web scraping** — the knowledge base is built entirely from what *you* upload.

## Architecture

```
frontend (React + Vite + Tailwind)
   │  POST /api/upload   (file: pdf | txt | md | audio | video)
   │  POST /api/chat     (message)
   ▼
backend (Express)
   ├─ upload.service   → pdf.service / transcription.service → ingestion.service
   ├─ ingestion.service → chunk → embed (Ollama) → store (Qdrant)
   └─ rag.service      → retrieve + re-rank (MMR) → grounded answer (Ollama)
```

## Prerequisites

- **Node.js 20+** (uses `--env-file` and native fetch)
- **FFmpeg** installed and on your `PATH` (required for audio/video transcription)
- **Docker** (for Qdrant) — or a reachable Qdrant instance
- **[Ollama](https://ollama.com)** running locally with the required models:
  ```bash
  ollama pull llama3.2:1b
  ollama pull nomic-embed-text
  ```

## Setup

### 1. Start Qdrant

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

Open http://localhost:5173, upload a file on the **Upload** tab, then switch to **Chat**.

## Transcription options

Configured in `backend/.env`:

| `TRANSCRIPTION_METHOD` | Behaviour                                                    |
| ---------------------- | ------------------------------------------------------------ |
| `local` (default)      | Uses `nodejs-whisper` on CPU. Model auto-downloads on first run. No API key. |
| `openai`               | Uses OpenAI's Whisper API. Requires `OPENAI_API_KEY`.        |

## API

| Method | Endpoint       | Body                              | Description                              |
| ------ | -------------- | --------------------------------- | ---------------------------------------- |
| GET    | `/api/health`  | —                                 | Health check                             |
| POST   | `/api/upload`  | `multipart/form-data` field `file`| Extract/transcribe + ingest a file       |
| POST   | `/api/chat`    | `{ "message": "..." }`            | Ask a question grounded in your uploads  |

## Production notes

- Set `NODE_ENV=production` and a restrictive `CORS_ORIGIN` in `backend/.env`.
- Build the frontend with `npm run build` and serve `dist/` from any static host.
- Uploads are processed in memory; only transient temp files are written during
  transcription and are cleaned up automatically.
