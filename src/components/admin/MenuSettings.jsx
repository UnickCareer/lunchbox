import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { useToast } from "../Toast.jsx";

const EDITABLE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const FIELD = "w-full rounded-xl border border-ink-900/10 dark:border-white/15 bg-white/70 dark:bg-white/[0.05] px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15";

export default function MenuSettings() {
  const { menu, updateMenuDay } = useApp();
  const toast = useToast();
  const [activeDay, setActiveDay] = useState("Monday");
  const [draft, setDraft] = useState(menu[activeDay]);

  const selectDay = (day) => {
    setActiveDay(day);
    setDraft(menu[day]);
  };

  const handleSave = () => {
    updateMenuDay(activeDay, draft);
    toast(`${activeDay}'s menu updated`, "success");
  };

  const update = (path, value) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      if (path.length === 1) next[path[0]] = value;
      else next[path[0]][path[1]] = value;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {EDITABLE_DAYS.map((day) => (
          <button
            key={day}
            onClick={() => selectDay(day)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeDay === day
                ? "bg-emerald-500 text-emerald-950"
                : "glass text-ink-700 dark:text-cream-50/70"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <motion.div
        key={activeDay}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 grid gap-4 sm:grid-cols-2"
      >
        <Field label="Dry Vegetable">
          <input className={FIELD} value={draft.dry} onChange={(e) => update(["dry"], e.target.value)} />
        </Field>
        <Field label="Gravy Dish">
          <input className={FIELD} value={draft.gravy} onChange={(e) => update(["gravy"], e.target.value)} />
        </Field>
        <Field label="Bread Name">
          <input
            className={FIELD}
            value={draft.bread.name}
            onChange={(e) => update(["bread", "name"], e.target.value)}
          />
        </Field>
        <Field label="Bread Base Qty">
          <input
            type="number"
            min={1}
            className={FIELD}
            value={draft.bread.baseQty}
            onChange={(e) => update(["bread", "baseQty"], Number(e.target.value))}
          />
        </Field>
        <Field label="Rice">
          <input className={FIELD} value={draft.rice} onChange={(e) => update(["rice"], e.target.value)} />
        </Field>
        <Field label="Salad">
          <input className={FIELD} value={draft.salad} onChange={(e) => update(["salad"], e.target.value)} />
        </Field>
        <Field label="Extra Item (Sweet / Raita)">
          <input
            className={FIELD}
            value={draft.extra.name}
            onChange={(e) => update(["extra", "name"], e.target.value)}
          />
        </Field>
        <Field label="Extra Type">
          <select
            className={FIELD}
            value={draft.extra.type}
            onChange={(e) => update(["extra", "type"], e.target.value)}
          >
            <option value="Sweet">Sweet</option>
            <option value="Raita">Raita</option>
          </select>
        </Field>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="btn-primary sm:col-span-2 mt-2"
        >
          <Save size={16} /> Save {activeDay}'s menu
        </motion.button>
      </motion.div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-cream-50/50">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
