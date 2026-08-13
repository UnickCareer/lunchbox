import React from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({
  qty,
  onChange,
  min = 0,
  max = 20,
  onMaxReached,
}) {
  const atMax = qty >= max;

  const handleIncrease = () => {
    if (atMax) {
      onMaxReached?.();
      return;
    }
    onChange(qty + 1);
  };

  return (
    <div className="flex items-center gap-1 rounded-full bg-ink-900/5 dark:bg-white/5 p-1">
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        disabled={qty <= min}
        onClick={() => onChange(Math.max(min, qty - 1))}
        className="h-8 w-8 rounded-full flex items-center justify-center bg-white dark:bg-white/10 text-ink-900 dark:text-cream-50 shadow-sm disabled:opacity-30 transition"
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </motion.button>

      <motion.span
        key={qty}
        initial={{ scale: 1.3, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="w-8 text-center font-mono text-sm font-semibold tabular-nums"
      >
        {qty}
      </motion.span>

      <motion.button
        type="button"
        whileTap={{ scale: atMax ? [1, 1.15, 1] : 0.85 }}
        onClick={handleIncrease}
        className={`h-8 w-8 rounded-full flex items-center justify-center shadow-sm transition ${
          atMax
            ? "bg-amber-400/40 text-amber-700 dark:text-amber-300 cursor-not-allowed"
            : "bg-emerald-500 text-emerald-950"
        }`}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </motion.button>
    </div>
  );
}
