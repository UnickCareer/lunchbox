import React, {
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  LayoutDashboard,
  Users,
  CalendarClock,
  LogOut,
  ShieldCheck,
  Crown,
  BellRing,
  Utensils,
} from "lucide-react";

import { useApp } from "../context/AppContext.jsx";

import ThemeToggle from "../components/ThemeToggle.jsx";

import TodaySummary from "../components/admin/TodaySummary.jsx";

import EmployeeManagement from "../components/admin/EmployeeManagement.jsx";

import MenuSettings from "../components/admin/MenuSettings.jsx";

import AccessRequests from "../components/admin/AccessRequests.jsx";

import EmployeePortal from "./EmployeePortal.jsx";

const TABS = [
  {
    key: "summary",
    label: "Today's Summary",
    icon: LayoutDashboard,
  },

  {
    key: "employees",
    label: "Employees & Admins",
    icon: Users,
  },

  {
    key: "requests",
    label: "Access Requests",
    icon: BellRing,
  },

  {
    key: "menu",
    label: "Menu Settings",
    icon: CalendarClock,
  },
];

export default function AdminDashboard() {
  const {
    currentUser,
    logout,
    loginRequests,
  } = useApp();

  const [
    tab,
    setTab,
  ] = useState("summary");

  const [
    bookingLunch,
    setBookingLunch,
  ] = useState(false);

  if (!currentUser) {
    return null;
  }

  const isOwner =
    Boolean(
      currentUser.isOwner
    );

  const requestCount =
    loginRequests.length;

  if (bookingLunch) {
    return (
      <EmployeePortal
        onBackToAdmin={() =>
          setBookingLunch(false)
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-emerald-950">
      <header className="sticky top-0 z-30 glass border-b border-white/20 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-glow ${
                isOwner
                  ? "bg-amber-400"
                  : "bg-emerald-500"
              }`}
            >
              {isOwner ? (
                <Crown
                  size={18}
                  className="text-emerald-950"
                />
              ) : (
                <ShieldCheck
                  size={18}
                  className="text-emerald-950"
                />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink-500 dark:text-cream-50/50">
                  {isOwner
                    ? "Owner"
                    : "Admin / HR"}
                </p>

                {isOwner && (
                  <span className="rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                    OWNER
                  </span>
                )}
              </div>

              <h1 className="font-display text-lg font-semibold leading-tight">
                {currentUser.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setBookingLunch(true)
              }
              className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-500 text-emerald-950 px-4 py-2 text-sm font-semibold shadow-glow hover:brightness-105 transition"
              title="Book your own lunch"
            >
              <Utensils size={15} />
              Book My Lunch
            </button>

            <button
              onClick={() =>
                setBookingLunch(true)
              }
              className="sm:hidden h-10 w-10 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center shadow-glow"
              aria-label="Book my lunch"
            >
              <Utensils size={16} />
            </button>

            <ThemeToggle />

            <button
              onClick={
                logout
              }
              className="h-10 w-10 rounded-full glass flex items-center justify-center text-ink-700 dark:text-cream-50/70"
              aria-label="Log out"
            >
              <LogOut
                size={16}
              />
            </button>
          </div>
        </div>

        <nav className="max-w-5xl mx-auto px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {TABS.map(
            ({
              key,
              label,
              icon: Icon,
            }) => (
              <button
                key={key}
                onClick={() =>
                  setTab(key)
                }
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                  tab === key
                    ? "bg-emerald-500 text-emerald-950"
                    : "text-ink-700 dark:text-cream-50/70 hover:bg-ink-900/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon
                  size={15}
                />

                {label}

                {key ===
                  "requests" &&
                  requestCount >
                    0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-bold flex items-center justify-center">
                      {
                        requestCount
                      }
                    </span>
                  )}
              </button>
            )
          )}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <AnimatePresence
          mode="wait"
        >
          <motion.div
            key={tab}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -12,
            }}
            transition={{
              duration: 0.25,
            }}
          >
            {tab ===
              "summary" && (
              <TodaySummary />
            )}

            {tab ===
              "employees" && (
              <EmployeeManagement />
            )}

            {tab ===
              "requests" && (
              <AccessRequests />
            )}

            {tab === "menu" && (
              <MenuSettings />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}