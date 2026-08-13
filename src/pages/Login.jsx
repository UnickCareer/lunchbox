import React, {
  useEffect,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useApp } from "../context/AppContext.jsx";

import { useToast } from "../components/Toast.jsx";

import ThemeToggle from "../components/ThemeToggle.jsx";

import QRPanel from "../components/QRPanel.jsx";

import {
  isValidName,
  normalizeName,
} from "../utils/validation.js";

export default function Login() {
  const {
    login,
    employees,
  } = useApp();

  const toast =
    useToast();

  const [
    name,
    setName,
  ] = useState("");

  const [
    pin,
    setPin,
  ] = useState("");

  const [
    requiresPin,
    setRequiresPin,
  ] = useState(false);

  const [
    shake,
    setShake,
  ] = useState(false);

  useEffect(() => {
    const normalized =
      normalizeName(name);

    const match =
      employees.find(
        (employee) =>
          normalizeName(
            employee.name
          ) === normalized
      );

    setRequiresPin(
      Boolean(
        match?.isAdmin
      )
    );

    if (!match?.isAdmin) {
      setPin("");
    }
  }, [
    name,
    employees,
  ]);

  const triggerShake =
    () => {
      setShake(true);

      window.setTimeout(
        () =>
          setShake(false),
        500
      );
    };

  const handleSubmit =
    (event) => {
      event.preventDefault();

      if (
        !isValidName(name)
      ) {
        triggerShake();

        toast(
          "Enter your employee name",
          "error"
        );

        return;
      }

      if (
        requiresPin &&
        !pin
      ) {
        triggerShake();

        toast(
          "Enter your admin PIN",
          "error"
        );

        return;
      }

      const result =
        login(
          name,
          pin
        );

      if (!result.ok) {
        triggerShake();

        if (
          result.reason ===
          "invalid_pin"
        ) {
          toast(
            "Incorrect admin PIN",
            "error"
          );
        } else if (
          result.requested
        ) {
          toast(
            "Name not registered — request sent to admin",
            "info"
          );
        } else {
          toast(
            "Access denied — name not registered",
            "error"
          );
        }

        return;
      }

      if (
        result.isOwner
      ) {
        toast(
          "Welcome, Mohit — Owner access granted",
          "success"
        );
      } else if (
        result.isAdmin
      ) {
        toast(
          `Welcome, ${name} — Admin access granted`,
          "success"
        );
      } else {
        toast(
          `Welcome, ${name}`,
          "success"
        );
      }
    };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-cream-100 dark:bg-emerald-950">
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-float"
        />

        <motion.div
          className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl animate-float"
          style={{
            animationDelay:
              "2s",
          }}
        />
      </div>

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl grid gap-6 md:grid-cols-[1.1fr_0.9fr] items-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          className="glass-strong rounded-3xl p-8 sm:p-10 order-2 md:order-1"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="h-11 w-11 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-glow">
              <UtensilsCrossed
                size={20}
                className="text-emerald-950"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-amber-500 dark:text-amber-400 font-semibold">
                Sparsh CCTV
              </p>

              <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-cream-50">
                Order Panipat
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm text-ink-500 dark:text-cream-50/60 max-w-sm">
            Enter your registered
            employee name to view
            today's thali and place
            your order.
          </p>

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 space-y-4"
          >
            <motion.div
              animate={
                shake
                  ? {
                      x: [
                        0,
                        -10,
                        10,
                        -8,
                        8,
                        0,
                      ],
                    }
                  : {}
              }
            >
              <label
                htmlFor="employeeName"
                className="sr-only"
              >
                Employee Name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 dark:text-cream-50/40"
                />

                <input
                  id="employeeName"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="words"
                  placeholder="e.g. Aman"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target
                        .value
                    )
                  }
                  className="input-field !pl-11"
                />
              </div>
            </motion.div>

            {requiresPin && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                  />

                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Admin PIN"
                    value={pin}
                    onChange={(event) =>
                      setPin(
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            8
                          )
                      )
                    }
                    className="input-field !pl-11"
                  />
                </div>

                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Admin access detected.
                  PIN required.
                </p>
              </motion.div>
            )}

            <motion.button
              whileTap={{
                scale: 0.97,
              }}
              type="submit"
              className="btn-primary w-full"
            >
              Continue

              <ArrowRight
                size={18}
              />
            </motion.button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-ink-500 dark:text-cream-50/40">
            <ShieldCheck
              size={14}
            />

            <p className="text-[11px]">
              Employee access uses
              registered names. Admin
              access additionally
              requires a PIN.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: "easeOut",
          }}
          className="order-1 md:order-2"
        >
          <QRPanel />
        </motion.div>
      </div>
    </div>
  );
}