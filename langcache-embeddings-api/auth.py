from fastapi import Request, Response
from fastapi.security import HTTPBearer
from starlette.middleware.base import BaseHTTPMiddleware
import os


class APIKeyMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, api_key: str = None, allowed_paths: list[str] = None):
        super().__init__(app)
        self.api_key = api_key or os.environ.get("API_KEY")
        self.allowed_paths = allowed_paths or ["/", "/health", "/metrics"]
        self.security = HTTPBearer()

    async def dispatch(self, request: Request, call_next):
        if request.headers.get("X-Require-Auth") != "true":
            return await call_next(request)

        if self.api_key is None or self.api_key == "":
            return await call_next(request)

        if request.url.path in self.allowed_paths:
            return await call_next(request)

        auth = await self.security(request)
        if auth is None or auth.credentials != self.api_key:
            return Response(content="", status_code=401)

        return await call_next(request)
