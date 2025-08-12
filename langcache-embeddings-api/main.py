import os
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional, Union
from auth import APIKeyMiddleware
from metrics import MetricsMiddleware, metrics_endpoint, PROMPT_TOKENS_LENGTH
import numpy
import uvicorn

from transformers import AutoTokenizer


import asyncio
from concurrent.futures import ProcessPoolExecutor

executor = ProcessPoolExecutor(max_workers=2)


model_name = "redis/langcache-embed-v1"
model = SentenceTransformer(model_name)

embedding_dimensions = model.get_sentence_embedding_dimension()

tokenizer = AutoTokenizer.from_pretrained(model_name)

model_labels = {
    "model_name": model_name,
    "inference_backend": model.get_backend()
}

def count_tokens(texts):
    tokens_count = int(sum(len(tokenizer.encode(text)) for text in texts))

    PROMPT_TOKENS_LENGTH.labels(
        **model_labels).observe(tokens_count)

    return tokens_count


def generate_embeddings(texts):
    return model.encode(texts, normalize_embeddings=True)


class EmbeddingRequest(BaseModel):
    input: Union[str, List[str]]
    encoding_format: Optional[str] = "float"


class EmbeddingData(BaseModel):
    object: str = "embedding"
    embedding: List[float]
    index: int


class EmbeddingsResponse(BaseModel):
    object: str = "list"
    data: List[EmbeddingData]
    usage: Dict[str, int]


app = FastAPI(
    title="Langcache Embeddings API",
    description="OpenAI-compatible API for generating embeddings using sentence-transformers",
    version="0.0.1",
)

# Enable CORS for local dev frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(APIKeyMiddleware)
app.add_middleware(MetricsMiddleware, **model_labels)


@app.post("/v1/embeddings", response_model=EmbeddingsResponse)
async def create_embeddings(request: EmbeddingRequest):
    try:

        if isinstance(request.input, str):
            texts = [request.input]
        else:
            texts = request.input

        # Run model.encode in a separate thread
        embeddings = await asyncio.get_event_loop().run_in_executor(
            executor, generate_embeddings, texts
        )

        data = []
        for i, embedding in enumerate(embeddings):
            embedding_list = embedding.astype(numpy.float32).tolist()
            data.append(EmbeddingData(embedding=embedding_list, index=i))

        total_tokens = count_tokens(texts)

        return EmbeddingsResponse(
            data=data,
            usage={
                "prompt_tokens": int(total_tokens),
                "total_tokens": int(total_tokens),
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "ok",
    }


@app.get("/metrics")
async def metrics():
    return await metrics_endpoint()


@app.get("/")
async def root():
    return {
        "message": "Langcache Embeddings API is running",
        "model": model_name,
        "dimensions": embedding_dimensions,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=11434, reload=False)
