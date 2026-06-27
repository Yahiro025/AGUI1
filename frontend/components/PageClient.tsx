"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction, useRenderToolCall } from "@copilotkit/react-core";

import { WeatherCard } from "./WeatherCard";
import { ApprovalCard } from "./ApprovalCard";
import { FlightResultsCard } from "./FlightResultsCard";
import { Sidebar } from "./Sidebar";
import { ChatHeader } from "./ChatHeader";

type WeatherData = {
  city: string;
  temperature_f: number;
  condition: string;
  humidity_pct: number;
  wind_mph: number;
};

type Flight = {
  airline: string;
  flight_no: string;
  departure: string;
  arrival: string;
  duration_hours: number;
  price_usd: number;
};

type FlightResultsData = {
  origin: string;
  destination: string;
  date: string;
  flights: Flight[];
};

type BookTripArgs = {
  origin: string;
  destination: string;
  date: string;
};

type BookTripResult = { confirmed: boolean };

export function PageClient() {
  const resolveBookTrip = useRef<((value: BookTripResult) => void) | null>(null);

  // ---- Generative UI: WeatherCard
  useRenderToolCall({
    name: "get_weather",
    render: ({ status, args, result }) => {
      if (status === "inProgress" || status === "executing") {
        return (
          <div className="ck-loading" style={{ margin: "10px 0" }}>
            Fetching weather for {String(args.city)}…
          </div>
        );
      }
      if (status === "complete" && result) {
        return (
          <WeatherCard
            city={String(args.city)}
            data={result as WeatherData}
          />
        );
      }
      return <></>;
    },
  });

  // ---- Generative UI: FlightResultsCard
  useRenderToolCall({
    name: "find_flights",
    render: ({ status, args, result }) => {
      if (status === "inProgress" || status === "executing") {
        return (
          <div className="ck-loading" style={{ margin: "10px 0" }}>
            Searching flights from {String(args.origin)} to{" "}
            {String(args.destination)}…
          </div>
        );
      }
      if (status === "complete" && result) {
        return <FlightResultsCard data={result as FlightResultsData} />;
      }
      return <></>;
    },
  });

  // ---- HITL: book_trip approval card
  useCopilotAction({
    name: "book_trip",
    description:
      "Book a trip from origin to destination on the given date. Triggers an approval card in the UI; the user must click Approve to actually confirm.",
    parameters: [
      { name: "origin", type: "string", required: true, description: "Departure city" },
      { name: "destination", type: "string", required: true, description: "Arrival city" },
      { name: "date", type: "string", required: true, description: "Departure date (YYYY-MM-DD)" },
    ],
    handler: () =>
      new Promise<BookTripResult>((resolve) => {
        resolveBookTrip.current = resolve;
      }),
    render: ({ status, args, result }) => {
      const a = args as Partial<BookTripArgs>;
      const r = result as BookTripResult | undefined;

      if (status === "executing") {
        return (
          <ApprovalCard
            origin={a.origin ?? ""}
            destination={a.destination ?? ""}
            date={a.date ?? ""}
            onApprove={() => resolveBookTrip.current?.({ confirmed: true })}
            onCancel={() => resolveBookTrip.current?.({ confirmed: false })}
          />
        );
      }
      if (status === "complete" && r?.confirmed) {
        return (
          <div className="ck-success" style={{ margin: "10px 0" }}>
            <b>{a.origin}</b> → <b>{a.destination}</b> on <b>{a.date}</b> confirmed.
          </div>
        );
      }
      if (status === "complete" && r && !r.confirmed) {
        return (
          <div className="ck-warning" style={{ margin: "10px 0" }}>
            Booking cancelled by user.
          </div>
        );
      }
      return <></>;
    },
  });

  return (
    <div className="flex h-[100dvh] min-h-[500px] w-full overflow-x-hidden overflow-y-auto bg-[var(--bg)]">
      <Sidebar />
      {/* Mobile logo bar */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 glass-strong border-b border-white/5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
            boxShadow: "0 4px 14px var(--accent-glow)",
          }}
        >
          <Plane size={16} className="text-white -rotate-45" />
        </div>
        <span className="text-sm font-bold gradient-text">TripBuddy</span>
      </div>

      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        <ChatHeader />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <CopilotChat
              labels={{
                title: "TripBuddy",
                initial: "Hi! Where do you want to go, and when?",
              }}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
