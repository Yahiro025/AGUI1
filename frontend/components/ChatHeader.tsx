"use client";

import { motion } from "framer-motion";
import { Wifi, Sparkles, Zap } from "lucide-react";

export function ChatHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
      className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-40" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">TripBuddy Agent</h2>
          <p className="text-[11px] text-muted">Online and ready to help</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[11px] text-secondary">
          <Sparkles size={12} className="text-indigo-400" />
          AG-UI Protocol
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[11px] text-secondary">
          <Zap size={12} className="text-amber-400" />
          Real-time
        </div>
      </div>
    </motion.header>
  );
}
