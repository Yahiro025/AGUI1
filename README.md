# AG-UI + CopilotKit Starter

Minimal end-to-end demo of the **AG-UI protocol** wired up to a **Next.js + CopilotKit** client.

It implements **two of the most distinctive patterns** AG-UI unlocks:

1. **Generative UI** — when the agent calls the backend tool `get_weather`, a custom `<WeatherCard>` mounts inside the chat instead of returning raw JSON.
2. **Human-in-the-loop** — when the agent calls `book_trip`, a custom `<ApprovalCard>` appears and the user must explicitly Approve or Cancel before the agent receives a result.

```
                     ┌──────────────────── Next.js (3000) ────────────────────┐
   User message ───►│ <CopilotKit runtimeUrl="…/agent"> → AG-UI client stream │
                     └──────────────────────────────────────────┬─────────────┘
                                                                │ AG-UI
                                                                ▼
                   ┌──────────── Python FastAPI (8000) ────────────────┐
                   │ POST /agent → AGUIAdapter.dispatch_request(...)  │
                   │   ↳ Pydantic AI TripBuddy agent                  │
                   │      ↳ backend tools: get_weather, find_flights │
                   │      ↳ client-side tool: book_trip (HITL gate)   │
                   └──────────────────────────────────────────────────┘
```

## Tech stack

| Layer | Choice |
|---|---|
| Agent framework | **Pydantic AI** (`pydantic-ai[ag-ui]`) — 1st-party AG-UI adapter, clean tool API |
| Agent transport | **AG-UI protocol** over Server-Sent Events on `POST /agent` |
| Agent server | FastAPI + Uvicorn |
| Frontend framework | Next.js 14 (App Router) + React 18 |
| Chat framework | **CopilotKit** (`@copilotkit/react-core`, `@copilotkit/react-ui`) — CopilotKit itself is a native AG-UI client |
| Generative UI | `useRenderToolCall` → custom `<WeatherCard>` |
| HITL | `useCopilotAction` (client-declared `book_trip`) → custom `<ApprovalCard>` |

## Prerequisites

- Python **3.11+**
- Node **20+**
- [`uv`](https://github.com/astral-sh/uv) (recommended) or `pip`
- An OpenAI API key (the agent model is `openai:gpt-4o-mini` by default)

## Setup & run

### 1. Backend

```bash
cd backend
uv sync                                       # install backend deps
cp .env.example backend/.env                  # actually: cp backend/.env.example .env
# then edit backend/.env and set OPENAI_API_KEY=sk-…
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend now lives at `http://localhost:8000` with:

- `GET /healthz` — sanity check
- `POST /agent` — AG-UI streaming endpoint (Consumes JSON, returns SSE)

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local                    # adjust NEXT_PUBLIC_AGUI_AGENT_URL if needed
npm run dev
```

Open http://localhost:3000.

> **CORS note**: the backend allows `*` for local dev. Lock it down before shipping.

## What to try in the chat

- *"Weather in Tokyo"* — the agent calls `get_weather` and the `<WeatherCard>` renders inline.
- *"Find flights from SFO to NYC on 2026-08-15"* — backend returns three options.
- *"Plan a trip from SFO to NYC on 2026-08-15 and book it"* — agent retrieves weather + flights then calls `book_trip`, which pops the `<ApprovalCard>` for you to Approve or Cancel.

## Project layout

```
.
├── backend/                       # Python agent + AG-UI endpoint
│   ├── pyproject.toml
│   ├── .env.example
│   └── app/
│       ├── agent.py              # Pydantic AI agent + system prompt
│       ├── tools.py              # Backend tools the agent can call
│       ├── data.py               # In-memory mock weather/flight data
│       └── main.py               # FastAPI app, POST /agent → AGUIAdapter
└── frontend/                      # Next.js + CopilotKit client
    ├── package.json
    ├── app/
    │   ├── layout.tsx            # Server layout with <Providers> wrapper
    │   ├── page.tsx              # Mounts <PageClient>
    │   └── globals.css
    └── components/
        ├── Providers.tsx         # "use client" CopilotKit provider
        ├── PageClient.tsx        # Chat + useRenderToolCall + useCopilotAction
        ├── WeatherCard.tsx       # Generative UI for get_weather
        └── ApprovalCard.tsx      # HITL surface for book_trip
```

## Why these patterns?

- **Generative UI** keeps the LLM from leaking raw JSON into the chat and lets the *app* decide how to render — type-safe, hallucination-bounded.
- **HITL via a client-declared `useCopilotAction`** is the simplest way to gate a sensitive backend action. Because the tool is *defined* on the client, the agent can call it but only the user can complete it. The pending resolver is captured in `useRef` so we don't burn a window global or break SSR.

## Caveats & next steps

- The agent relies on CopilotKit's runtime stitching the client-declared `book_trip` tool definition into the AG-UI stream so the LLM knows its schema. If, on your installed version, the LLM hallucinates arguments, mirror the schema into `backend/app/tools.py` and use a `DeferredToolRequest` pattern so the client-side approval still gates the call.
- This is a starter — for prod, lock down CORS, add auth, add logging, and validate tool inputs.

## Deploy

The two services are deployable independently. The frontend talks to the backend over AG-UI (SSE), so the backend must be a long-lived process — don't put it on a serverless platform with a 30-60s timeout, it will chop the agent stream mid-thought.

### Frontend → Vercel

1. Push the repo to GitHub.
2. In Vercel: **New Project → Import** the repo, set **Root Directory** to `frontend`.
3. Framework preset is auto-detected as Next.js. Build/Output settings can stay at defaults.
4. **Environment Variables** (set for *Production*, *Preview*, and *Development*):
   - `NEXT_PUBLIC_AGUI_AGENT_URL` — `https://<your-backend>.onrender.com/agent` (paste this *after* you've deployed the backend in step 2 below; Vercel will rebuild on env-var change).
5. **Deploy**.

Each push to `main` auto-deploys. Pull requests get preview URLs.

### Backend → Render (Blueprint, auto-deploy from GitHub)

A Blueprint is committed at `render.yaml`; it provisions the backend on push to `main`.

1. Push the repo to GitHub.
2. In Render: **New → Blueprint** → connect the repo. Render reads `render.yaml` and provisions a `web` service.
3. In the new service's **Environment** tab, set:
   - `OPENAI_API_KEY` (or any of `GOOGLE_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` — see `backend/.env.example`).
   - `ALLOWED_ORIGINS` — your Vercel URL, e.g. `https://agui-starter.vercel.app`. If you add a custom domain later, append it here (comma-separated) and the backend will allow both.
4. Once the first deploy succeeds, copy the `*.onrender.com` URL.
5. Go back to Vercel, paste it into `NEXT_PUBLIC_AGUI_AGENT_URL`, and **Redeploy**.

Both services auto-deploy on subsequent pushes to `main`.

### Cost notes

- **Vercel free tier** is fine for a hobby demo (100 GB bandwidth/mo, plenty for a chat UI).
- **Render free tier** runs the web service but sleeps after 15 min idle; first request after a sleep is a cold start (~30-60s). For an always-on backend, upgrade Render to the \$7/mo Starter plan, or move to Fly.io (also has a generous free tier and global edge).

### Custom domains

- **Vercel:** Project → Settings → Domains.
- **Render:** Service → Settings → Custom Domain.
- **Remember to** add the Vercel custom domain to `ALLOWED_ORIGINS` on Render (comma-separated) and to set `NEXT_PUBLIC_AGUI_AGENT_URL` to the production backend URL (not the `*.onrender.com` preview).

### Smoke-test after deploy

```bash
# Backend
curl https://<backend>.onrender.com/healthz

# Frontend — open the Vercel URL in a browser and try:
#   "Weather in Tokyo"
#   "Find flights from SFO to NYC on 2026-08-15"
#   "Plan a trip from SFO to NYC on 2026-08-15 and book it"
```
