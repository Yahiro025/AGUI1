"use client";

import { motion } from "framer-motion";
import {
  Plane,
  Clock,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Star,
} from "lucide-react";

type Flight = {
  airline: string;
  flight_no: string;
  departure: string;
  arrival: string;
  duration_hours: number;
  price_usd: number;
};

type FlightResults = {
  origin: string;
  destination: string;
  date: string;
  flights: Flight[];
};

const airlineColors: Record<string, string> = {
  SkyJet: "from-sky-500/20 to-blue-500/20",
  BlueLine: "from-blue-500/20 to-indigo-500/20",
  Nimbus: "from-violet-500/20 to-purple-500/20",
};

const airlineAccents: Record<string, string> = {
  SkyJet: "text-sky-400",
  BlueLine: "text-blue-400",
  Nimbus: "text-violet-400",
};

function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m > 0 ? `${m}m` : ""}`;
}

export function FlightResultsCard({ data }: { data: FlightResults }) {
  const cheapest = data.flights.reduce((min, f) =>
    f.price_usd < min.price_usd ? f : min
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="glass gradient-border rounded-2xl p-5 relative overflow-hidden"
      style={{ margin: "10px 0" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Plane size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-secondary">
              Flight Results
            </h3>
            <p className="text-xs text-muted">
              {data.origin} → {data.destination} · {data.date}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded-full">
          {data.flights.length} options
        </span>
      </div>

      {/* Flight cards */}
      <div className="space-y-3">
        {data.flights.map((flight, i) => {
          const isCheapest = flight.price_usd === cheapest.price_usd;
          const gradient =
            airlineColors[flight.airline] ??
            "from-indigo-500/20 to-purple-500/20";
          const accent =
            airlineAccents[flight.airline] ?? "text-indigo-400";

          return (
            <motion.div
              key={flight.flight_no}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
              className={`relative rounded-xl p-4 border border-white/5 bg-gradient-to-r ${gradient} hover:border-white/10 transition-all group`}
            >
              {isCheapest && (
                <div className="absolute -top-2 right-3 flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingDown size={10} />
                  Best Price
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                    <Plane
                      size={18}
                      className={`${accent} -rotate-45`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {flight.airline}
                      </span>
                      <span className="text-xs text-muted">
                        {flight.flight_no}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDuration(flight.duration_hours)}
                      </span>
                      <span className="flex items-center gap-1">
                        {flight.departure} <ArrowRight size={10} />{" "}
                        {flight.arrival}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold">
                    <DollarSign size={14} className="text-muted" />
                    {flight.price_usd}
                  </div>
                  <span className="text-[10px] text-muted">per person</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-muted">
        <Star size={12} className="text-amber-400" />
        Prices include taxes and fees. Ask TripBuddy to book any flight.
      </div>
    </motion.div>
  );
}
