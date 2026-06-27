"use client";

import type { ReactNode } from "react";
import { CopilotKit } from "@copilotkit/react-core";

/**
 * Client-side boundary that wires the React tree to the AG-UI backend.
 *
 * CopilotKit is itself an AG-UI client, so for a vanilla AG-UI server
 * (e.g. the Pydantic AI /agent endpoint exposed by FastAPI) we just point
 * `runtimeUrl` at it directly — no separate CopilotKit runtime layer needed.
 *
 * Override with NEXT_PUBLIC_AGUI_AGENT_URL in `.env.local` when the
 * backend is on a different host/port.
 */
export function Providers({ children }: { children: ReactNode }) {
  const runtimeUrl =
    process.env.NEXT_PUBLIC_AGUI_AGENT_URL ?? "http://localhost:8000/agent";

  return (
    <CopilotKit runtimeUrl={runtimeUrl} agent="tripBuddy">
      {children}
    </CopilotKit>
  );
}
