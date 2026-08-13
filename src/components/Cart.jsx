import React, { useState } from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ShoppingBasket,
  X,
  CheckCircle2,
  Send,
} from "lucide-react";

export default function Cart({
  employeeName,
  items,
  onSubmit,
  disabled,
}) {
  const [open, setOpen] =
    useState(false);

  const [justSubmitted, setJustSubmitted] =
    useState(false);

  const total = items.reduce(
    (sum, item) =>
      sum + item.qty,
    0
  );

  const handleSubmit = () => {
    onSubmit();

    setJustSubmitted(true);
    setOpen(false);

    setTimeout(() => {
      setJustSubmitted(false);
    }, 2600);
  };

  return (
    <>
      <motion.button
        onClick={() =>
          setOpen(true)
        }
        whileTap={{
          scale: 0.94,
        }}
        className="fixed bottom-5 right-5 z-40 glass-strong flex items-center gap-3 rounded-full px-5 py-3 shadow-glow"
      >
        <div className="relative">
          <ShoppingBasket
            size={20}
            className="text-emerald-500"
          />

          <AnimatePresence>
            {total > 0 && (
              <motion.span
                key={total}
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                exit={{
                  scale: 0,
                }}
                className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-amber-400 text-[10px] font-bold text-emerald-950 flex items-center justify-center"
              >
                {total}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <span className="text-sm font-mono font-semibold">
          {employeeName}
        </span>
      </motion.button>

      <AnimatePresence>
        {justSubmitted && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.7,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.7,
            }}
            className="fixed bottom-24 right-5 z-40 glass-strong rounded-2xl px-5 py-4 flex items-center gap-3"
          >
            <motion.div
              initial={{
                scale: 0,
                rotate: -90,
              }}
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
            >
              <CheckCircle2
                size={26}
                className="text-emerald-500"
              />
            </motion.div>

            <div>
              <p className="font-semibold text-sm">
                Order submitted
              </p>

              <p className="text-xs text-ink-500 dark:text-cream-50/50">
                Locked for today
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setOpen(false)
              }
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                y: "100%",
              }}
              animate={{
                y: 0,
              }}
              exit={{
                y: "100%",
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 34,
              }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg glass-strong rounded-t-3xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-cream-50/50">
                    Your order ·{" "}
                    {employeeName}
                  </p>

                  <h3 className="font-display text-xl font-semibold">
                    Review thali
                  </h3>
                </div>

                <button
                  onClick={() =>
                    setOpen(false)
                  }
                  className="h-9 w-9 rounded-full flex items-center justify-center bg-ink-900/5 dark:bg-white/10"
                  aria-label="Close cart"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none pr-1">
                {items.map(
                  (item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl bg-ink-900/[0.03] dark:bg-white/5 px-4 py-3"
                    >
                      <span className="text-sm font-body">
                        {item.label}
                      </span>

                      <span className="font-mono text-sm font-semibold">
                        {item.name} ×{" "}
                        {item.qty}
                      </span>
                    </div>
                  )
                )}
              </div>

              <motion.button
                whileTap={{
                  scale: 0.97,
                }}
                disabled={
                  disabled ||
                  total === 0
                }
                onClick={
                  handleSubmit
                }
                className="btn-primary w-full mt-6"
              >
                <Send size={16} />
                Submit order
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}