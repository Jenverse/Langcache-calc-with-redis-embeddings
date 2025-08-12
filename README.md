# LangCache Calc with Redis Embeddings

Run the Redis LangCache embedding model locally and use it from a web calculator app. This setup uses only the real model (no backup/fallback).

## What’s in this repo
- `langcache-embeddings-api/`: FastAPI service exposing an OpenAI-compatible embeddings endpoint powered by `redis/langcache-embed-v1`
- `Langcache-Cost-Calc/`: React calculator that calls the API to compute cache-hit estimates with real embeddings

---

## Prerequisites
- Python 3.10+ (3.12 recommended)
- Node.js 18+ and npm
- A Hugging Face token with access to `redis/langcache-embed-v1`
  - Create one at https://huggingface.co/settings/tokens

---

## Quick Start

Open two terminals.

### Terminal A (Embeddings API)
```bash
cd langcache-embeddings-api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
huggingface-cli login   # paste your HF token when prompted
pip install --upgrade "sentence-transformers==4.1.0"
uvicorn main:app --host 0.0.0.0 --port 11434
```
Notes:
- First run downloads ~600MB of model weights (one-time).
- CORS is enabled for http://localhost:3000 by default.

### Terminal B (Frontend)
```bash
cd Langcache-Cost-Calc
echo "VITE_LANGCACHE_API_URL=http://localhost:11434" > .env
npm install
npm run dev
```
Open http://localhost:3000

---

## Local Endpoints
- API health: `GET http://localhost:11434/health`
- Embeddings: `POST http://localhost:11434/v1/embeddings`
- Frontend: `http://localhost:3000`

Example:
```bash
curl -X POST http://localhost:11434/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input":"hello world"}'
```

---

## Troubleshooting
- 401 Unauthorized when starting API:
  - Run `huggingface-cli login` and paste a token with access to `redis/langcache-embed-v1`.
- 422 on POST /v1/embeddings:
  - Ensure `Content-Type: application/json` and a valid JSON body like `{ "input": "text" }` or `{ "input": ["text1", "text2"] }`.
- CORS errors in the browser:
  - API allows http://localhost:3000. If using a different origin/port, add it to `CORSMiddleware` in `langcache-embeddings-api/main.py`.
- Port in use:
  - Start API on another port: `uvicorn main:app --port 11435`, and set `VITE_LANGCACHE_API_URL=http://localhost:11435` in `Langcache-Cost-Calc/.env`.
- Slow first request:
  - Model weights download is expected on first run.

---

## Design note: No fallback
The calculator only uses real embeddings from the local API. If the API fails, the UI surfaces the error instead of simulating vectors.

For more UI details, see `Langcache-Cost-Calc/README.md`.
