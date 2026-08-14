import React from "react";
import { motion } from "framer-motion";
import { Check, Clock3, Edit3, X } from "lucide-react";

import { useApp } from "../../context/AppContext.jsx";
import { useToast } from "../Toast.jsx";
import { normalizeName } from "../../utils/validation.js";

const ITEM_KEYS = [
  ["bowl1", "Sabzi Bowl 1"],
  ["bowl2", "Sabzi Bowl 2"],
  ["bread", "Bread"],
  ["rice", "Rice"],
  ["extra", "Extra"],
  ["salad", "Salad"],
];

function formatOrder(order) {
  return ITEM_KEYS.map(([key, label]) => {
    const item = order?.[key];
    if (!item) return null;
    return `${label}: ${item.name || "Item"} × ${Number(item.qty || 0)}`;
  }).filter(Boolean);
}

export default function EditRequests() {
  const {
    editRequests,
    employees,
    approveEditRequest,
    rejectEditRequest,
  } = useApp();
  const toast = useToast();

  const isAdminOrOwnerRequest = (request) =>
    employees.some(
      (employee) =>
        employee.isAdmin &&
        normalizeName(employee.name) === normalizeName(request.employeeName)
    );

  const visibleRequests = editRequests.filter(
    (request) => !isAdminOrOwnerRequest(request)
  );

  const pending = visibleRequests.filter((request) => request.status === "pending");
  const reviewed = visibleRequests
    .filter((request) => request.status !== "pending")
    .slice()
    .reverse()
    .slice(0, 10);

  const approve = (request) => {
    const ok = approveEditRequest(request.id);
    toast(
      ok
        ? `${request.employeeName}'s edit approved. Their order is now Pending again.`
        : "Could not approve this edit request.",
      ok ? "success" : "error"
    );
  };

  const reject = (request) => {
    const ok = rejectEditRequest(request.id);
    toast(
      ok
        ? `${request.employeeName}'s edit request rejected. Their original order remains unchanged.`
        : "Could not reject this edit request.",
      ok ? "info" : "error"
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-400/15 text-amber-500 flex items-center justify-center">
            <Edit3 size={18} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Edit Order Requests</h2>
            <p className="text-xs text-ink-500 dark:text-cream-50/50 mt-1">
              Review employee changes before they become the new pending order.
            </p>
          </div>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-ink-500 dark:text-cream-50/60">
          <Clock3 className="mx-auto mb-3 opacity-60" size={24} />
          No pending edit requests.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-amber-500 font-bold">
                      Edit requested
                    </p>
                    <h3 className="font-display text-lg font-semibold mt-1">
                      {request.employeeName}
                    </h3>
                    <p className="text-xs text-ink-500 dark:text-cream-50/50 mt-1">
                      {request.requestedAt}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-400/15 text-amber-600 dark:text-amber-300 px-3 py-1 text-xs font-semibold">
                    Pending Review
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-ink-900/5 dark:bg-white/5 p-4">
                    <p className="text-xs font-semibold mb-2">Original order</p>
                    <div className="space-y-1 text-xs text-ink-600 dark:text-cream-50/65">
                      {formatOrder(request.originalOrder).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <p className="text-xs font-semibold mb-2 text-emerald-700 dark:text-emerald-300">
                      Requested new order
                    </p>
                    <div className="space-y-1 text-xs text-ink-700 dark:text-cream-50/75">
                      {formatOrder(request.editedOrder).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => reject(request)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10"
                  >
                    <X size={16} />
                    Reject Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => approve(request)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-glow hover:brightness-105"
                  >
                    <Check size={16} />
                    Approve Edit
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold mb-3">Recently reviewed</h3>
          <div className="space-y-2">
            {reviewed.map((request) => (
              <div
                key={request.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-ink-900/5 dark:bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{request.employeeName}</p>
                  <p className="text-xs text-ink-500 dark:text-cream-50/50">
                    {request.reviewedAt || request.requestedAt}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    request.status === "approved"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/15 text-red-500"
                  }`}
                >
                  {request.status === "approved" ? "Edit Approved" : "Edit Rejected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Change Edit order phase