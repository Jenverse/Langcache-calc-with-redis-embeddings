import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from auth import APIKeyMiddleware


@pytest.fixture
def app():
    app = FastAPI()

    @app.get("/")
    async def root():
        return {"message": "hello world"}

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    @app.post("/v1/embeddings")
    async def protected():
        return {"message": "Protected content"}

    return app


@pytest.fixture
def app_with_key(app):
    app.add_middleware(APIKeyMiddleware, api_key="test-api-key")
    return app


def test_that_all_endpoints_are_allowed_when_key_is_not_configured_in_middleware(app):
    client = TestClient(app)

    response = client.get("/")
    assert response.status_code == 200

    response = client.get("/health")
    assert response.status_code == 200

    response = client.post("/v1/embeddings")
    assert response.status_code == 200

# @todo - test if public paths are allowed even if header is set


def test_that_all_endpoints_are_allowed_when_key_is_configured_in_middleware_but_header_is_not_set(app_with_key):
    client = TestClient(app_with_key)
    response = client.get("/")
    assert response.status_code == 200

    response = client.get("/health")
    assert response.status_code == 200

    response = client.post("/v1/embeddings")
    assert response.status_code == 200


def test_that_endpoints_are_allowed_when_key_is_configured_and_header_is_set_and_key_is_valid(app_with_key):
    client = TestClient(app_with_key)
    response = client.get("/")
    assert response.status_code == 200

    response = client.get("/health")
    assert response.status_code == 200

    response = client.post(
        "/v1/embeddings", headers={
            "X-Require-Auth": "true",
            "Authorization": "Bearer test-api-key"})
    assert response.status_code == 200


def test_that_endpoints_are_forbidden_when_key_is_configured_and_header_is_set_but_the_key_is_invalid(app_with_key):
    client = TestClient(app_with_key)
    response = client.get("/")
    assert response.status_code == 200

    response = client.get("/health")
    assert response.status_code == 200

    response = client.post(
        "/v1/embeddings", headers={
            "X-Require-Auth": "true",
            "Authorization": "Bearer test-api-key1"})
    assert response.status_code == 401
