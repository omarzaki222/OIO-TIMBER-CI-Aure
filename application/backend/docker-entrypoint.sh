#!/bin/sh
set -eu

echo "Waiting for Postgres…"
python - <<'PY'
import os, socket, time, re
url = os.environ.get("DATABASE_URL", "postgresql+psycopg://oio:oio@postgres:5432/oio")
m = re.search(r"@([^/:]+)", url)
host = m.group(1) if m else "postgres"
for i in range(40):
    try:
        socket.create_connection((host, 5432), 2).close()
        break
    except OSError:
        time.sleep(1)
else:
    raise SystemExit(f"Postgres not reachable at {host}:5432")
PY

echo "Running Alembic migrations…"
alembic upgrade head

if [ "${RUN_SEED:-true}" = "true" ]; then
  echo "Seeding catalog (idempotent)…"
  python -m app.db.seed
fi

workers="${WEB_CONCURRENCY:-2}"
echo "Starting Gunicorn (Uvicorn workers=${workers})…"
exec gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8080 \
  --workers "${workers}" \
  --timeout 60 \
  --access-logfile - \
  --error-logfile -
