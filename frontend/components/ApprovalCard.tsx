"use client";

import { motion } from "framer-motion";
import { Check, X, Plane, Calendar, MapPin } from "lucide-react";

export function ApprovalCard({
  origin,
  destination,
  date,
  onApprove,
  onCancel,
}: {
  origin: string;
  destination: string;
  date: string;
  onApprove: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="glass gradient-border rounded-2xl p-5 relative overflow-hidden"
      style={{ margin: "10px 0" }}
      role="alertdialog"
      aria-labelledby="apv-title"
    >
      {/* Subtle gradient glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(129, 140, 248, 0.1)" }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Plane size={16} className="text-indigo-400" />
          </div>
          <h3
            id="apv-title"
            className="text-sm font-semibold tracking-wide uppercase text-secondary"
          >
            Confirm Booking
          </h3>
        </div>

        {/* Trip route visual */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex flex-col items-center">
            <MapPin size={14} className="text-emerald-400" />
            <div className="w-px h-4 bg-white/10 my-1" />
            <MapPin size={14} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{origin}</span>
              <span className="text-xs text-muted">Origin</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{destination}</span>
              <span className="text-xs text-muted">Destination</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-secondary">
          <Calendar size={14} className="text-indigo-400" />
          <span>Departure: {date}</span>
        </div>

        <p className="text-xs text-muted mb-5 leading-relaxed">
          Approval is required. Nothing will be booked until you confirm below.
        </p>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-shadow"
            style={{
              background:
                "linear-gradient(135deg, #34d399, #10b981)",
              boxShadow: "0 4px 14px rgba(52, 211, 153, 0.25)",
            }}
          >
            <Check size={16} />
            Approve & Book
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border border-white/10 bg-white/[0.03] text-secondary hover:bg-white/[0.06] hover:text-text"
          >
            <X size={16} />
            Cancel
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
