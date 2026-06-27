# TripBuddy backend — used by Render.
# Pin a slim base; matches backend/.python-version (3.12).
FROM python:3.12-slim AS runtime

# Don't write .pyc files; flush stdout so logs stream to Render.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

# Install uv (fast, deterministic installer). Pin to a known-good version.
RUN pip install --no-cache-dir "uv==0.5.11"

# Copy only the project metadata first so dependency install is cached
# across rebuilds when only source files change.
COPY pyproject.toml uv.lock ./

# Install dependencies into the system environment (no venv in container).
# --frozen uses uv.lock; --no-dev skips pytest etc.
RUN uv sync --frozen --no-install-project --no-dev

# Now copy the source and install the project itself (editable-ish, but flat).
COPY app ./app
RUN uv sync --frozen --no-dev

# Run as a non-root user for least-privilege.
RUN useradd --create-home --uid 10001 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Render sets $PORT; we listen on it. Default 8000 matches the EXPOSE above.
CMD ["sh", "-c", "uv run --no-sync uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
