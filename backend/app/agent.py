"""TripBuddy — a friendly travel-planning agent that exposes an AG-UI endpoint.

The model is chosen by `_build_model()` based on environment variables.

Default behaviour: if no provider keys are configured, the agent falls back to
Pydantic AI's offline `TestModel`, which exercises the registered tools and
returns scripted text — useful for local UI testing with **zero API spend**.
"""

from __future__ import annotations

import logging
import os

from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

from .tools import find_flights_tool, get_weather_tool

log = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are TripBuddy, a friendly travel-planning assistant.

You have two BACKEND tools you can call:
  • get_weather(city) — current weather for a city
  • find_flights(origin, destination, date) — list of candidate flights
    (date must be ISO YYYY-MM-DD)

There is also a CLIENT-SIDE tool called `book_trip(origin, destination, date)`.
That tool is *not* yours to execute silently — when you call it, the user
will see an approval card in the UI and must explicitly approve or cancel.
NEVER book a trip in text alone, and NEVER confirm a booking without the
user clicking Approve.

Workflow:
  1. Greet the user and ask where they want to go / when, if not given.
  2. Use `get_weather` and `find_flights` to gather information they care
     about.
  3. Summarize what you found concisely.
  4. Only if the user expresses they want to proceed, call `book_trip`.
     The result will arrive in your next turn with a `confirmed` flag.

Be concise, friendly, and helpful.
""".strip()


def _offline_test_model() -> TestModel:
    """Return the offline TestModel used as a deterministic $0 fallback.

    Centralised so the `call_tools` and messaging stay in sync between the
    explicit `TRIPBUDDY_MODEL=test` branch and the no-keys-detected branch.
    """
    return TestModel(
        call_tools=["get_weather", "find_flights"],
        custom_output_text=(
            "Offline mode (TestModel) — the Generative UI cards below render "
            "with mock data. The client-side book_trip HITL card needs a real "
            "LLM. Set GOOGLE_API_KEY, GROQ_API_KEY or OPENAI_API_KEY to upgrade."
        ),
    )


def _build_model():
    """Resolve a model object from environment variables.

    Precedence:
      1. ``TRIPBUDDY_MODEL`` — explicit override (e.g. ``"test"``,
         ``"openai:gpt-4o-mini"``, ``"google:gemini-2.0-flash"``).
      2. Auto-detect a free cloud provider by env var.
      3. Fall back to Pydantic AI TestModel (offline, scripted, $0).
    """
    explicit = os.getenv("TRIPBUDDY_MODEL", "").strip()
    if explicit:
        if explicit.lower() == "test":
            log.warning(
                "TRIPBUDDY_MODEL=test → using Pydantic AI TestModel "
                "(offline scripted responses, zero API spend)."
            )
            return _offline_test_model()
        log.info("Using TRIPBUDDY_MODEL=%s.", explicit)
        return explicit

    # Auto-detect free cloud providers (in order of "least friction").
    if os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"):
        model = "google:gemini-2.0-flash"
        log.info("Detected GOOGLE_API_KEY → using %s (free tier).", model)
        return model
    if os.getenv("GROQ_API_KEY"):
        model = "groq:llama-3.3-70b-versatile"
        log.info("Detected GROQ_API_KEY → using %s (free tier).", model)
        return model
    if os.getenv("OPENROUTER_API_KEY"):
        model = "openrouter:meta-llama/llama-3.1-8b-instruct:free"
        log.info("Detected OPENROUTER_API_KEY → using %s (free tier).", model)
        return model

    if os.getenv("OPENAI_API_KEY"):
        model = "openai:gpt-4o-mini"
        log.info("Detected OPENAI_API_KEY → using %s.", model)
        return model

    log.warning(
        "No LLM provider keys detected and TRIPBUDDY_MODEL is unset → falling "
        "back to Pydantic AI TestModel (offline scripted responses). To use "
        "a real model, set GOOGLE_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY or "
        "OPENAI_API_KEY in backend/.env, or set TRIPBUDDY_MODEL explicitly."
    )
    return _offline_test_model()


agent = Agent(
    _build_model(),
    system_prompt=SYSTEM_PROMPT,
    tools=[get_weather_tool, find_flights_tool],
)
