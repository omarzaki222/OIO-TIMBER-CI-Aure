# OIO Wood & Timber — FastAPI (production image)
# Secrets are injected at runtime. Do not COPY .env.
FROM python:3.12-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 --shell /usr/sbin/nologin oio

COPY pyproject.toml alembic.ini ./
COPY app ./app
COPY alembic ./alembic
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN pip install --upgrade pip \
    && pip install . \
    && chmod +x /docker-entrypoint.sh \
    && chown -R oio:oio /app

USER oio
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health', timeout=3).read()"

ENTRYPOINT ["/docker-entrypoint.sh"]
