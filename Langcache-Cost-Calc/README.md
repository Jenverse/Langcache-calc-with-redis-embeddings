# Redis LangCache Calculator

A web-based calculator for estimating potential cost savings when using semantic caching for LLM applications.

## Features

- Calculate potential cache hit rates using the Redis LangCache embedding model
- Estimate cost savings based on query volume and cache effectiveness
- Uses the high-performance `redis/langcache-embed-v1` embedding model
- Interactive cost analysis and visualization
- CSV/Excel file upload for query analysis
- Integration with LangCache Embeddings API

## Quick Start (local)

- Terminal A (Embeddings API)
  - cd langcache-embeddings-api
  - python3 -m venv .venv
  - source .venv/bin/activate
  - pip install -r requirements.txt
  - huggingface-cli login  # paste your HF token
  - pip install --upgrade "sentence-transformers==4.1.0"
  - uvicorn main:app --host 0.0.0.0 --port 11434

- Terminal B (Frontend)
  - cd Langcache-Cost-Calc
  - echo "VITE_LANGCACHE_API_URL=http://localhost:11434" > .env
  - npm install
  - npm run dev
  - Open http://localhost:3000

## Local Endpoints
- API health: GET http://localhost:11434/health
- Embeddings: POST http://localhost:11434/v1/embeddings
- Frontend: http://localhost:3000

Example:
```bash
curl -X POST http://localhost:11434/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input":"hello world"}'
```

## Detailed Setup

1) Embeddings API (backend)
- Create venv, install deps, login to Hugging Face, start server
- First run downloads model weights (~600MB)
- CORS is enabled for http://localhost:3000 by default

2) Frontend (calculator)
- Set VITE_LANGCACHE_API_URL in .env to your API URL
- npm install && npm run dev
- The app uses only the real model (no fallback)


## Environment Variables

- `VITE_LANGCACHE_API_URL`: URL of the LangCache Embeddings API (default: http://localhost:11434)
- `VITE_LANGCACHE_API_KEY`: API key for the LangCache Embeddings API (optional)

No Google/AWS keys are needed. The calculator only uses the local embeddings API.

## Building for Production

```bash
npm run build
```

## Docker Support

Build the container:
```bash
docker build -t redis-langcache-calculator .
```

Run the container:
```bash
docker run -p 8081:8081 redis-langcache-calculator
```

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Redis LangCache embeddings (redis/langcache-embed-v1)

## License

MIT
