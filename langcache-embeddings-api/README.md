# Langcache Embeddings API

API that allows generating text embeddings using the [Langcache model](https://huggingface.co/redis/langcache-embed-v1)


## Install

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```sh
python main.py
```

## Use

the API should be compatible with OpenAPI's API, any client that can generate embeddings via OpenAI should work.

```sh
curl -X POST "http://localhost:11434/v1/embeddings" -H "Content-Type: application/json" -d '{"input": "hello world"}'
```

## Run Tests

```sh
pytest -v
```
