import React from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Gift,
  Plus,
  Sparkles,
} from "lucide-react";

export default function SurplusPanel({
  items,
  standards,
  getAvailable,
  onClaim,
}) {
  const availableItems = items
    .map((item) => ({
      ...item,
      standard:
        standards[item.key] ?? 1,

      available:
        getAvailable(item.key),
    }))
    .filter(
      (item) => item.available > 0
    );

  return (
    <AnimatePresence>
      {availableItems.length > 0 && (
        <motion.section
          initial={{
            opacity: 0,
            y: 14,
            height: 0,
          }}
          animate={{
            opacity: 1,
            y: 0,
            height: "auto",
          }}
          exit={{
            opacity: 0,
            y: -10,
            height: 0,
          }}
          className="mt-6 overflow-hidden"
        >
          <div className="relative glass rounded-3xl p-5 border border-amber-400/20">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-400/15 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                <Gift size={18} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">
                    Today&apos;s surplus
                  </h2>

                  <Sparkles
                    size={15}
                    className="text-amber-500"
                  />
                </div>

                <p className="text-xs text-ink-500 dark:text-cream-50/50 mt-0.5">
                  Someone chose less than their
                  standard allowance. You can claim
                  the extra — even if your own
                  allowance is already full.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {availableItems.map(
                (item) => (
                  <motion.div
                    key={item.key}
                    layout
                    className="flex items-center justify-between gap-3 rounded-2xl bg-amber-400/10 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {item.name}
                      </p>

                      <p className="text-[11px] text-amber-600 dark:text-amber-400">
                        {item.available}{" "}
                        {item.available === 1
                          ? "extra portion"
                          : "extra portions"}{" "}
                        available
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onClaim(item.key)
                      }
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-2 text-xs font-bold text-emerald-950 shadow-sm hover:scale-[1.02] active:scale-95 transition"
                    >
                      <Plus size={14} />
                      Add 1
                    </button>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}