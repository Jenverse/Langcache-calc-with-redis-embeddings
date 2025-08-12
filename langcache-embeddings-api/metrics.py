from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response
import time

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP Requests Count',
    ['method', 'endpoint', 'status_code', 'model_name', 'inference_backend'],
)

RESPONSE_TIME = Histogram(
    'http_request_duration_milliseconds',
    'HTTP Request Latency',
    ['method', 'endpoint', 'model_name', 'inference_backend'],
)

# Currently, our model max context length is 8192
PROMPT_TOKENS_LENGTH = Histogram(
    'prompt_tokens_length',
    'Number of tokens in a prompt',
    ['model_name', 'inference_backend'],
    buckets=(10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120, float('inf')),
)


class MetricsMiddleware(BaseHTTPMiddleware):
    model_name: str
    backend: str

    def __init__(self, app, model_name, inference_backend, dispatch=None):
        self.model_name = model_name
        self.inference_backend = inference_backend

        super().__init__(app, dispatch)

    async def dispatch(self, request: Request, call_next):
        start_time = time.time_ns()

        method = request.method
        endpoint = request.url.path

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise e
        finally:
            labels = {
                'method': method,
                'endpoint': endpoint,
                'model_name': self.model_name,
                'inference_backend': self.inference_backend,
            }

            REQUEST_COUNT.labels(status_code=status_code, **labels).inc()

            duration = (time.time_ns() - start_time) // 1_000_000
            RESPONSE_TIME.labels(**labels).observe(duration)

        return response


async def metrics_endpoint():
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST
    )
