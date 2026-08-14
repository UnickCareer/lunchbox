import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  CheckCheck,
  FileSpreadsheet,
  Loader2,
  Inbox,
  Trash2,
} from "lucide-react";

import {
  useApp,
  todayLabel,
  todayWeekday,
} from "../../context/AppContext.jsx";

import { useToast } from "../Toast.jsx";
import { exportOrdersToExcel } from "../../utils/excelExport.js";

const COLS = [
  ["bowl1", "Veg Bowl 1"],
  ["bowl2", "Veg Bowl 2"],
  ["bread", "Breads"],
  ["rice", "Rice"],
  ["extra", "Sweet/Raita"],
  ["salad", "Salad"],
];

export default function TodaySummary() {
  const {
    menu,
    todaysOrders,
    approveAllToday,
    deleteTodayOrder,
    clearTodayData,
  } = useApp();

  const toast = useToast();
  const [approving, setApproving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const weekday = todayWeekday();
  const dayMenu = menu[weekday];
  const orderList = Object.values(todaysOrders || {});

  const allApproved =
    orderList.length > 0 && orderList.every((order) => order.approved);

  const handleApprove = () => {
    setApproving(true);

    setTimeout(() => {
      approveAllToday();
      setApproving(false);
      toast(`${orderList.length} orders approved`, "success");
    }, 500);
  };

  const handleExport = () => {
    if (orderList.length === 0) {
      toast("No orders to export yet", "error");
      return;
    }

    exportOrdersToExcel(
      orderList,
      todayLabel().replace(/\s+/g, "-")
    );

    toast("Excel file downloaded", "success");
  };

  const handleDelete = (order) => {
    const name = order?.employeeName || "this employee";

    const confirmed = window.confirm(
      `Remove ${name}'s lunch order for today?\n\nThis order will no longer be included when approved orders are sent to WhatsApp.`
    );

    if (!confirmed) return;

    const removed = deleteTodayOrder(name);

    if (removed) {
      toast(`${name}'s lunch order removed`, "info");
    }
  };

  const handleClearAll = () => {
    if (orderList.length === 0) {
      toast("There are no orders to cancel today", "info");
      return;
    }

    const confirmed = window.confirm(
      `Cancel ALL ${orderList.length} lunch orders for today?\n\nThis will remove today's orders, today's surplus claims, and today's edit requests. This cannot be undone.`
    );

    if (!confirmed) return;

    setClearing(true);
    clearTodayData();
    setClearing(false);
    toast("All today's lunch orders have been cancelled", "success");
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-cream-50/50">
            {weekday} · {todayLabel()}
          </p>

          <h3 className="font-display text-lg font-semibold mt-1">
            {dayMenu
              ? `${dayMenu.dry} · ${dayMenu.gravy} · ${dayMenu.bread.name}`
              : "No service today"}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleApprove}
            disabled={approving || orderList.length === 0}
            className="btn-primary"
          >
            {approving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCheck size={16} />
            )}
            {allApproved ? "All approved" : "Approve all"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleExport}
            className="btn-amber"
          >
            <FileSpreadsheet size={16} />
            Export .xlsx
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleClearAll}
            disabled={clearing || orderList.length === 0}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {clearing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Cancel all today
          </motion.button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {orderList.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-ink-500 dark:text-cream-50/50">
            <Inbox size={28} />
            <p className="text-sm">No submissions yet today</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-900/10 dark:border-white/10 text-left text-ink-500 dark:text-cream-50/50">
                  <th className="px-4 py-3 font-medium">Employee</th>

                  {COLS.map(([key, label]) => (
                    <th
                      key={key}
                      className="px-4 py-3 font-medium whitespace-nowrap"
                    >
                      {label}
                    </th>
                  ))}

                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Delete</th>
                </tr>
              </thead>

              <tbody>
                {orderList.map((order, index) => (
                  <motion.tr
                    key={order.employeeName}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-ink-900/5 dark:border-white/5 last:border-0"
                  >
                    <td className="px-4 py-3 font-semibold">
                      {order.employeeName}
                    </td>

                    {COLS.map(([key]) => (
                      <td
                        key={key}
                        className="px-4 py-3 whitespace-nowrap"
                      >
                        {order[key]?.name}{" "}
                        <span className="text-ink-500 dark:text-cream-50/40">
                          ×{order[key]?.qty}
                        </span>
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.approved
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-400/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {order.approved ? "Approved" : "Pending"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(order)}
                        className="h-9 w-9 rounded-xl inline-flex items-center justify-center text-red-500 hover:bg-red-500/10 transition"
                        aria-label={`Remove ${order.employeeName}'s lunch order`}
                        title={`Remove ${order.employeeName}'s order`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
