#!/usr/bin/env bash
# Local CI checks (no Docker push, no CD update).
# Run from the Azure monorepo root:  bash CI/scripts/ci-local.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "== backend pytest =="
cd "$ROOT/application/backend"
python3.12 -m venv .venv-ci
# shellcheck disable=SC1091
. .venv-ci/bin/activate
pip install -q fastapi "uvicorn[standard]" "sqlalchemy>=2" alembic pydantic pydantic-settings \
  email-validator argon2-cffi PyJWT python-multipart "psycopg[binary]" pytest httpx gunicorn
PYTHONPATH=. pytest -q
deactivate

echo "== frontend =="
cd "$ROOT/application/frontend"
npm ci
npm test && npm run typecheck && npm run lint && npm run build

echo "== admin =="
cd "$ROOT/application/admin-panel"
npm ci
npm test && npm run typecheck && npm run lint && npm run build

echo "CI LOCAL OK"
