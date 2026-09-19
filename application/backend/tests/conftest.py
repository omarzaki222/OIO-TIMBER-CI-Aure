import os

os.environ["DATABASE_URL"] = "sqlite+pysqlite:///:memory:"
os.environ["JWT_SECRET"] = "test-secret-not-for-production"
os.environ["APP_ENV"] = "test"

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.base import Base
from app.db.seed import run_seed
from app.db.session import SessionLocal, engine
from app.main import app

get_settings.cache_clear()


@pytest.fixture(autouse=True)
def _db() -> Generator[None, None, None]:
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        run_seed(session)
    finally:
        session.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
