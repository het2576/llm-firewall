"""
main.py — FastAPI application entry point.
Includes CORS, security headers, rate limiting, request ID middleware.
"""
import time
import uuid
import logging

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from config import get_settings
from database import engine, Base

settings = get_settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("llm_firewall")


# ---------------------------------------------------------------------------
# Lifespan — create tables on startup (dev convenience; prod uses Alembic)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting LLM Security Firewall...")
    async with engine.begin() as conn:
        # Import models so Base knows about them
        import models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables ready")
    yield
    logger.info("🛑 Shutting down...")
    await engine.dispose()


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="LLM Security Firewall",
    description="AI-powered middleware that intercepts and analyzes every LLM prompt for security threats.",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Middleware — CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Middleware — Request ID + Timing + Security Headers
# ---------------------------------------------------------------------------
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.perf_counter()

    response: Response = await call_next(request)

    elapsed_ms = (time.perf_counter() - start_time) * 1000

    # Security headers
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Processing-Time-Ms"] = f"{elapsed_ms:.2f}"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline';"
    )

    logger.info(
        f"{request.method} {request.url.path} → {response.status_code} "
        f"({elapsed_ms:.1f}ms) [req={request_id[:8]}]"
    )
    return response


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["System"])
async def health_check():
    """Returns service health status."""
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "service": settings.APP_NAME,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "LLM Security Firewall API",
        "docs": "/docs",
        "health": "/health",
    }


# ---------------------------------------------------------------------------
# Routers — mounted here as phases are completed
# ---------------------------------------------------------------------------
from api.chat import router as chat_router
from api.logs import router as logs_router
from api.analytics import router as analytics_router

app.include_router(chat_router, prefix="/api", tags=["Chat & Firewall"])
app.include_router(logs_router, prefix="/api", tags=["Logs"])
app.include_router(analytics_router, prefix="/api", tags=["Analytics"])
