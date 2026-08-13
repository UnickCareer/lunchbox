import React from "react";
import { motion } from "framer-motion";

// Signature visual: the day's thali rendered as six arc "bowls" around a
// ring. Each arc fills proportionally to that item's quantity, so the plate
// visibly "fills up" as the employee customizes their order — a literal
// reading of a thali rather than a generic progress bar.
export default function ThaliRing({ segments, size = 220 }) {
  const strokeWidth = 14;
  const radius = size / 2 - strokeWidth;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = 6; // deg gap between segments
  const segAngle = 360 / segments.length;

  const totalQty = segments.reduce((s, seg) => s + seg.qty, 0);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* track */}
        {segments.map((seg, i) => {
          const startAngle = i * segAngle + gap / 2;
          const sweep = segAngle - gap;
          const dash = (sweep / 360) * circumference;
          return (
            <circle
              key={`track-${seg.label}`}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-ink-900/10 dark:text-white/10"
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-((startAngle / 360) * circumference)}
              strokeLinecap="round"
            />
          );
        })}
        {/* fill */}
        {segments.map((seg, i) => {
          const startAngle = i * segAngle + gap / 2;
          const sweep = segAngle - gap;
          const filledRatio = Math.min(1, seg.qty / (seg.max || 1));
          const dash = (sweep / 360) * circumference * filledRatio;
          const fullDash = (sweep / 360) * circumference;
          return (
            <motion.circle
              key={`fill-${seg.label}`}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={false}
              animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
              strokeDashoffset={-((startAngle / 360) * circumference)}
              opacity={seg.qty > 0 ? 1 : 0.25}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={totalQty}
          initial={{ scale: 1.2, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display text-3xl font-semibold text-ink-900 dark:text-cream-50"
        >
          {totalQty}
        </motion.span>
        <span className="text-[11px] uppercase tracking-[0.2em] text-ink-500 dark:text-cream-50/50">
          items today
        </span>
      </div>
    </div>
  );
}
