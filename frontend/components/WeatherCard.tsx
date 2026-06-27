"use client";

import { motion } from "framer-motion";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
} from "lucide-react";

type Weather = {
  city: string;
  temperature_f: number;
  condition: string;
  humidity_pct: number;
  wind_mph: number;
};

function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("storm")) return CloudRain;
  if (c.includes("snow") || c.includes("frost")) return CloudSnow;
  if (c.includes("cloud") || c.includes("overcast")) return Cloud;
  return Sun;
}

export function WeatherCard({ city, data }: { city: string; data: Weather }) {
  const WeatherIcon = getWeatherIcon(data.condition);
  const isSunny = data.condition.toLowerCase().includes("sun");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="glass gradient-border rounded-2xl p-5 relative overflow-hidden"
      style={{ margin: "10px 0" }}
    >
      {/* Ambient glow behind the icon */}
      <div
        className="absolute top-4 right-4 w-24 h-24 rounded-full blur-3xl pointer-events-none"
        style={{
          background: isSunny
            ? "rgba(251, 191, 36, 0.15)"
            : "rgba(129, 140, 248, 0.15)",
        }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={isSunny ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <WeatherIcon
                size={22}
                className={isSunny ? "text-amber-400" : "text-indigo-400"}
              />
            </motion.div>
            <span className="text-sm font-semibold tracking-wide uppercase text-secondary">
              {city}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-5xl font-bold tracking-tighter">
              {data.temperature_f}
            </span>
            <span className="text-xl text-secondary font-light">°F</span>
          </div>
          <p className="text-sm text-secondary mt-1 capitalize">
            {data.condition}
          </p>
        </div>

        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mt-2"
        >
          <WeatherIcon
            size={56}
            strokeWidth={1.2}
            className={
              isSunny
                ? "text-amber-400/40 animate-spin-slow"
                : "text-indigo-400/40"
            }
            style={isSunny ? { animationDuration: "12s" } : undefined}
          />
        </motion.div>
      </div>

      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Droplets size={14} className="text-indigo-400" />
          <span className="text-xs text-secondary">
            {data.humidity_pct}% humidity
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Wind size={14} className="text-indigo-400" />
          <span className="text-xs text-secondary">
            {data.wind_mph} mph wind
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer size={14} className="text-indigo-400" />
          <span className="text-xs text-secondary">
            Feels like {data.temperature_f + 2}°F
          </span>
        </div>
      </div>
    </motion.div>
  );
}
