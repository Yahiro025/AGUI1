"use client";

import { motion } from "framer-motion";
import {
  Compass,
  MessageSquare,
  Settings,
  HelpCircle,
  MapPin,
  Plane,
  Calendar,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { icon: MessageSquare, label: "Chat", active: true },
  { icon: Compass, label: "Explore", active: false },
  { icon: TrendingUp, label: "Trips", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className="hidden md:flex w-[260px] min-w-[260px] h-screen glass-strong flex-col sticky top-0 z-20"
      style={{ borderRight: "1px solid var(--border)" }}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--accent), var(--accent-2))",
              boxShadow: "0 4px 14px var(--accent-glow)",
            }}
          >
            <Plane size={18} className="text-white -rotate-45" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight gradient-text">
              TripBuddy
            </h1>
            <p className="text-[10px] text-muted uppercase tracking-widest font-medium">
              AI Travel Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? "bg-white/[0.06] text-text border border-white/5"
                  : "text-secondary hover:text-text hover:bg-white/[0.03]"
              }`}
            >
              <Icon size={17} />
              {item.label}
              {item.active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Trip Context Card */}
      <div className="p-3">
        <div className="rounded-xl p-4 border border-white/5 bg-white/[0.02]">
          <h4 className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-3">
            Current Context
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-indigo-400" />
              <span className="text-xs text-secondary truncate">
                No destination set
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-indigo-400" />
              <span className="text-xs text-secondary">—</span>
            </div>
            <div className="flex items-center gap-2">
              <Plane size={13} className="text-indigo-400" />
              <span className="text-xs text-secondary">No flights yet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button className="flex items-center gap-2 text-xs text-muted hover:text-secondary transition-colors">
          <HelpCircle size={14} />
          Help & Support
        </button>
      </div>
    </motion.aside>
  );
}
