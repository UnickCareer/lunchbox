import React from "react";

import { motion } from "framer-motion";

import QuantitySelector from "./QuantitySelector.jsx";

export default function ItemCard({
  icon: Icon,
  label,
  name,
  tag,
  qty,
  onChange,
  max = 20,
  onMaxReached,
  accent = "emerald",
}) {
  const accentClasses =
    accent === "amber"
      ? "bg-amber-400/15 text-amber-500 dark:text-amber-400"
      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -3,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 24,
      }}
      className="glass rounded-2xl p-4 flex items-center gap-4"
    >
      <div
        className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${accentClasses}`}
      >
        <Icon size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.15em] text-ink-500 dark:text-cream-50/50">
          {label}

          {tag ? (
            <span className="ml-1 opacity-70">
              · {tag}
            </span>
          ) : null}
        </p>

        <p className="font-display text-base font-semibold text-ink-900 dark:text-cream-50 truncate">
          {name}
        </p>
      </div>

      <QuantitySelector
        qty={qty}
        onChange={onChange}
        max={max}
        onMaxReached={
          onMaxReached
        }
      />
    </motion.div>
  );
}