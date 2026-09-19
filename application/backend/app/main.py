from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.db.session import engine

settings = get_settings()

app = FastAPI(
    title="OIO Wood & Timber",
    description="Furniture presentation and reservation API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

if settings.app_env.lower() == "dev":
    allow = settings.cors_origins or ["http://localhost:3000"]
else:
    allow = settings.cors_origins
    if allow == ["*"]:
        allow = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health", tags=["Health"], summary="Liveness")
def health():
    return {"status": "ok"}


@app.get("/ready", tags=["Health"], summary="Readiness")
def ready():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ready"}
