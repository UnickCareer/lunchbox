import React from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  BellRing,
  Check,
  Clock3,
  UserRound,
  X,
} from "lucide-react";

import { useApp } from "../../context/AppContext.jsx";
import { useToast } from "../Toast.jsx";

export default function AccessRequests() {
  const {
    loginRequests,
    approveAccessRequest,
    dismissAccessRequest,
  } = useApp();

  const toast = useToast();

  const handleApprove = (
    request,
    temporary
  ) => {
    approveAccessRequest(
      request.id,
      temporary
    );

    toast(
      `${request.name} added as ${
        temporary
          ? "temporary"
          : "permanent"
      } employee`,
      "success"
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-400/15 text-amber-500 dark:text-amber-400 flex items-center justify-center">
            <BellRing size={20} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400 font-semibold">
              Admin approval
            </p>

            <h2 className="font-display text-2xl font-semibold mt-1">
              Unknown-name requests
            </h2>

            <p className="text-sm text-ink-500 dark:text-cream-50/60 mt-1 max-w-2xl">
              When an unapproved person enters a
              name, the request appears here. Add
              them for today only or approve them
              permanently.
            </p>
          </div>
        </div>
      </div>

      {loginRequests.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <UserRound
            size={30}
            className="mx-auto text-ink-500 dark:text-cream-50/30"
          />

          <h3 className="font-display text-lg font-semibold mt-3">
            No pending requests
          </h3>

          <p className="text-sm text-ink-500 dark:text-cream-50/50 mt-1">
            New unknown names will appear
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {loginRequests.map(
              (request) => (
                <motion.div
                  key={request.id}
                  layout
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
                    x: 30,
                  }}
                  className="glass rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <UserRound size={16} />
                      </div>

                      <p className="font-display text-lg font-semibold truncate">
                        {request.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-500 dark:text-cream-50/45">
                      <Clock3 size={13} />
                      Requested{" "}
                      {request.requestedAt}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleApprove(
                          request,
                          true
                        )
                      }
                      className="btn-amber"
                    >
                      <Clock3 size={15} />
                      Add for today
                    </button>

                    <button
                      onClick={() =>
                        handleApprove(
                          request,
                          false
                        )
                      }
                      className="btn-primary"
                    >
                      <Check size={15} />
                      Add permanently
                    </button>

                    <button
                      onClick={() =>
                        dismissAccessRequest(
                          request.id
                        )
                      }
                      className="h-10 w-10 rounded-xl glass inline-flex items-center justify-center text-red-400 hover:bg-red-400/10 transition"
                      aria-label={`Dismiss ${request.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}