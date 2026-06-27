"""In-memory mock data so the demo runs without any external services."""

from __future__ import annotations


def get_weather(city: str) -> dict:
    """Return a deterministic-ish weather snapshot for ``city``."""
    base_temp = 60 + (sum(ord(c) for c in city) % 15)
    condition = "sunny" if base_temp > 70 else "cloudy"
    return {
        "city": city,
        "temperature_f": base_temp,
        "condition": condition,
        "humidity_pct": 40 + (len(city) % 30),
        "wind_mph": 4 + (len(city) % 12),
    }


def find_flights(origin: str, destination: str, date: str) -> dict:
    """Return a small list of candidate flights."""
    base_price = 220 + (sum(ord(c) for c in origin + destination) % 180)
    return {
        "origin": origin,
        "destination": destination,
        "date": date,
        "flights": [
            {
                "airline": "SkyJet",
                "flight_no": "SJ-" + str(100 + len(origin)),
                "departure": "08:00",
                "arrival": "13:30",
                "duration_hours": 5.5,
                "price_usd": base_price,
            },
            {
                "airline": "BlueLine",
                "flight_no": "BL-" + str(200 + len(destination)),
                "departure": "12:30",
                "arrival": "18:30",
                "duration_hours": 6.0,
                "price_usd": int(base_price * 0.88),
            },
            {
                "airline": "Nimbus",
                "flight_no": "NM-" + str(300 + len(origin + destination)),
                "departure": "18:45",
                "arrival": "01:00",
                "duration_hours": 6.25,
                "price_usd": int(base_price * 0.78),
            },
        ],
    }
