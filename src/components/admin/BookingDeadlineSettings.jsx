import React, { useEffect, useMemo, useState } from "react";
import { Clock3, RotateCcw, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useApp, todayDateKey } from "../../context/AppContext.jsx";
import { useToast } from "../Toast.jsx";

const QUICK_TIMES = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00"];

function formatTime(value) {
  const [h, m] = String(value || "11:30").split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function BookingDeadlineSettings() {
  const { getBookingDeadline, setBookingDeadline, resetBookingDeadline } = useApp();
  const toast = useToast();
  const today = todayDateKey();
  const current = getBookingDeadline(today);
  const [time, setTime] = useState(current);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTime(current);
  }, [current]);

  const dirty = useMemo(() => time !== current, [time, current]);

  const save = async () => {
    setSaving(true);
    const ok = await setBookingDeadline(time, today);
    setSaving(false);
    toast(ok ? `Today's employee deadline is ${formatTime(time)}` : "Could not save the booking deadline", ok ? "success" : "error");
  };

  const reset = async () => {
    setSaving(true);
    const ok = await resetBookingDeadline(today);
    setSaving(false);
    if (ok) {
      setTime("11:30");
      toast("Today's deadline reset to 11:30 AM", "success");
    } else {
      toast("Could not reset the booking deadline", "error");
    }
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-cream-50/50">
            Employee Booking Deadline
          </p>
          <h3 className="font-display text-lg font-semibold mt-1">
            Today: {formatTime(current)}
          </h3>
          <p className="text-sm text-ink-500 dark:text-cream-50/60 mt-1">
            Use this relaxation when the office is starting late. Admin/Owner and Guest accounts are never restricted by this deadline.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 px-3 py-2 text-sm font-semibold">
          <Clock3 size={16} />
          {formatTime(time)}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {QUICK_TIMES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTime(value)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              time === value
                ? "bg-emerald-500 text-white"
                : "glass text-ink-700 dark:text-cream-50/75 hover:bg-ink-900/5 dark:hover:bg-white/10"
            }`}
          >
            {formatTime(value)}
          </button>
        ))}

        <label className="inline-flex items-center gap-2 rounded-xl glass px-3 py-2 text-sm font-semibold">
          Custom
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-transparent outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save today's deadline"}
        </motion.button>

        <button
          type="button"
          onClick={reset}
          disabled={saving || current === "11:30"}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold glass disabled:opacity-40"
        >
          <RotateCcw size={16} />
          Reset 11:30 AM
        </button>
      </div>
    </div>
  );
}
