# OIO Wood & Timber — backend (Phase 2)

FastAPI API for catalog, auth, reservations, inquiries, and admin. **Python 3.12**.

Production database is **PostgreSQL 16**. SQLite is used only in automated tests (`:memory:` with a shared connection pool).

## 1. Python version

```bash
python3.12 --version  # 3.12.x
```

## 2–3. Virtualenv and dependencies

```bash
cd application/backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install fastapi "uvicorn[standard]" "sqlalchemy>=2" alembic pydantic pydantic-settings email-validator argon2-cffi PyJWT python-multipart "psycopg[binary]" pytest httpx
```

## 4. PostgreSQL (local development)

Create a database (example):

```bash
createdb oio
# or: psql -c "CREATE USER oio WITH PASSWORD 'oio'; CREATE DATABASE oio OWNER oio;"
```

## 5. Environment

Copy repo-root `.env.example` to `application/backend/.env` (or export vars). Generate a local JWT secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Required:

- `DATABASE_URL=postgresql+psycopg://USER:PASS@localhost:5432/oio`
- `JWT_SECRET=` (output of the command above)

## 6. Migrations (Alembic)

From `application/backend`:

```bash
# apply
alembic upgrade head
# status
alembic current
# rollback one
alembic downgrade -1
# new revision after model changes
alembic revision --autogenerate -m "describe change"
```

Initial revision: `alembic/versions/001_initial.py`.

## 7. Seed data

Fictional placeholders only (not real OIO catalog). Placeholder images via placehold.co.

```bash
PYTHONPATH=. python -m app.db.seed
```

Does **not** create an ADMIN user. Create an admin by inserting a user with `role.code = ADMIN` after hashing a password locally (no hardcoded admin password in the repo).

## 8. Run the API

```bash
PYTHONPATH=. uvicorn app.main:app --reload --port 8080
```

- OpenAPI: http://127.0.0.1:8080/docs  
- ReDoc: http://127.0.0.1:8080/redoc  
- Liveness: `GET /health`  
- Readiness: `GET /ready` (needs a reachable database)

## 9. Tests

```bash
PYTHONPATH=. pytest -q
```

Tests do not require PostgreSQL.

## Future containers (Phase 6 — not created)

- Backend container: this FastAPI app, port 8080, probes `/health` and `/ready`
- PostgreSQL service/container: port 5432

No Dockerfiles in this phase. Kubernetes and Jenkins are unchanged.
