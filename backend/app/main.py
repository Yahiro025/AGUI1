"""FastAPI app exposing the TripBuddy agent over the AG-UI protocol.

Run locally:
    uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

The AG-UI endpoint is ``POST /agent`` and streams SSE events back to the
client. The CopilotKit Next.js runtime proxies to this URL.
"""

from __future__ import annotations

import logging
import os

from dotenv import load_dotenv

# IMPORTANT: load .env BEFORE we import `agent`, because the model's
# `_build_model()` factory re-reads env vars at module-import time. If we
# imported `agent` first, GOOGLE_API_KEY (and peers) would not yet be
# visible, and the factory would fall back to Pydantic AI TestModel.
load_dotenv()

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic_ai.models.test import TestModel
from pydantic_ai.ui.ag_ui import AGUIAdapter

from .agent import agent as trip_agent

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("tripbuddy")

# No hard requirement on an API key: the agent model factory in `app/agent.py`
# falls back to the offline Pydantic AI TestModel when no provider keys are
# present. Users can set OPENAI_API_KEY, GOOGLE_API_KEY, GEMINI_API_KEY,
# GROQ_API_KEY, OPENROUTER_API_KEY, or TRIPBUDDY_MODEL to switch providers.

app = FastAPI(title="AG-UI TripBuddy", version="0.1.0")


def _allowed_origins() -> list[str]:
    """Resolve the CORS allow-list from the ``ALLOWED_ORIGINS`` env var.

    ``ALLOWED_ORIGINS`` is a comma-separated list of origins, e.g.
    ``https://agui-starter.vercel.app,https://www.example.com``.

    When the env var is empty/unset we fall back to ``["*"]`` so local dev
    (``npm run dev`` + ``uv run uvicorn ...``) keeps working, and we log a
    warning so it's obvious in production logs.
    """
    raw = os.getenv("ALLOWED_ORIGINS", "").strip()
    if not raw:
        log.warning(
            "ALLOWED_ORIGINS is unset — CORS allows all origins. "
            "Set it to your frontend URL (e.g. https://agui-starter.vercel.app) "
            "before shipping."
        )
        return ["*"]
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    log.info("CORS allow-list: %s", origins)
    return origins


# CORS — permissive (`*`) for local dev; override via ALLOWED_ORIGINS env in prod.
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)


@app.get("/healthz")
async def healthz() -> dict:
    # Use isinstance + hasattr so this survives both custom Model subclasses
    # (that may not expose `.model_name`) and Pydantic AI version changes to
    # the literal string `TestModel.model_name` returns.
    model_obj = getattr(trip_agent, "model", None)
    if hasattr(model_obj, "model_name"):
        model_name = model_obj.model_name
    else:
        model_name = f"{type(model_obj).__module__}.{type(model_obj).__name__}"
    return {
        "status": "ok",
        "agent": model_name,
        "is_test_model": isinstance(model_obj, TestModel),
        "provider_configured": bool(
            os.getenv("OPENAI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
            or os.getenv("GEMINI_API_KEY")
            or os.getenv("GROQ_API_KEY")
            or os.getenv("OPENROUTER_API_KEY")
        ),
    }


@app.post("/agent")
async def handle_agent(request: Request) -> Response:
    """AG-UI dispatch endpoint.

    Accepts a Pydantic AI AG-UI request (typically JSON) and returns a
    streaming SSE response containing lifecycle, text, tool-call, and
    state events that the CopilotKit client understands.
    """
    return await AGUIAdapter.dispatch_request(request, agent=trip_agent)
