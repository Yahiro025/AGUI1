"""Pydantic AI tools exposed to the TripBuddy agent."""

from pydantic_ai import RunContext

from . import data


async def get_weather_tool(ctx: RunContext, city: str) -> dict:
    """Return the current weather for ``city``.

    Use this whenever the user asks about weather, packing tips, or best
    time of year. The result is deterministic for the demo.
    """
    return data.get_weather(city)


async def find_flights_tool(
    ctx: RunContext,
    origin: str,
    destination: str,
    date: str,
) -> dict:
    """Return candidate flights from ``origin`` to ``destination`` on ``date``.

    ``date`` must be ISO ``YYYY-MM-DD``.
    """
    return data.find_flights(origin, destination, date)
