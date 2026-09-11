import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";

import { motion } from "framer-motion";

import {
  Soup,
  Flame,
  Wheat,
  Sandwich,
  IceCreamBowl,
  Salad as SaladIcon,
  LogOut,
  ArrowLeft,
  Repeat,
  CalendarDays,
  Clock3,
} from "lucide-react";

import {
  useApp,
  todayWeekday,
  todayLabel,
} from "../context/AppContext.jsx";

import { useToast } from "../components/Toast.jsx";

import ThemeToggle from "../components/ThemeToggle.jsx";

import ThaliRing from "../components/ThaliRing.jsx";

import ItemCard from "../components/ItemCard.jsx";

import Cart from "../components/Cart.jsx";

import SurplusPanel from "../components/SurplusPanel.jsx";

export default function EmployeePortal({
  adminBooking = false,
  onBackToAdmin = null,
}) {
  const {
    currentUser,
    menu,
    logout,
    navigateTo,
    submitOrder,
    todaysOrders,
    standards,
    surplusAvailability,
    claimSurplus,
    releaseSurplus,
    requestEdit,
    clearEditRequestsForEmployee,
    editRequests,
    cloudStatus,
    getBookingDeadline,
  } = useApp();

  const toast = useToast();

  const weekday = todayWeekday();

  const dayMenu = menu[weekday];

  const [sameBowl, setSameBowl] =
    useState(false);

  const [doubledItem, setDoubledItem] =
    useState("dry");

  const [editingOrder, setEditingOrder] =
    useState(false);

  const [qty, setQty] = useState({
    bowl1: 1,
    bowl2: 1,
    bread:
      dayMenu?.bread?.baseQty ?? 4,
    rice: 1,
    extra: 1,
    salad: 1,
  });

  const safeUserName =
    currentUser?.name || "";

  const isUnlimitedUser =
    Boolean(currentUser?.isAdmin) ||
    currentUser?.userType === "guest" ||
    currentUser?.role === "guest";

  const deadlineTime = getBookingDeadline();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (isUnlimitedUser) return undefined;
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [isUnlimitedUser]);

  const getDeadlineDate = () => {
    const [hours, minutes] = String(deadlineTime || "11:30")
      .split(":")
      .map(Number);
    const deadline = new Date();
    deadline.setHours(hours, minutes, 0, 0);
    return deadline;
  };

  const deadlineDate = getDeadlineDate();
  const remainingMs = Math.max(0, deadlineDate.getTime() - now.getTime());
  const isBookingClosed = !isUnlimitedUser && remainingMs <= 0;
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const countdownHours = String(Math.floor(remainingSeconds / 3600)).padStart(2, "0");
  const countdownMinutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, "0");
  const countdownSeconds = String(remainingSeconds % 60).padStart(2, "0");
  const tenMinuteWarning =
    !isUnlimitedUser &&
    remainingMs > 0 &&
    remainingMs <= 10 * 60 * 1000;

  // Use the live countdown to calculate the warning text as well.
  // ceil() means 3:21:00 -> 10 minutes, 3:22:00 -> 9 minutes,
  // ... 3:30:00 -> 1 minute, and at the deadline the warning disappears.
  const warningMinutes = tenMinuteWarning
    ? Math.min(10, Math.max(1, Math.ceil(remainingMs / 60000)))
    : 0;

  const lastWarningMinuteRef = useRef(null);

  useEffect(() => {
    if (isUnlimitedUser || warningMinutes <= 0) {
      lastWarningMinuteRef.current = null;
      return;
    }

    // Notify once whenever the displayed remaining-minute value changes.
    if (lastWarningMinuteRef.current !== warningMinutes) {
      lastWarningMinuteRef.current = warningMinutes;
      toast(
        `Only ${warningMinutes} minute${warningMinutes === 1 ? "" : "s"} left to book your food. Hurry up and place your order!`,
        "info"
      );
    }
  }, [isUnlimitedUser, warningMinutes, toast]);

  const formatDeadline = (value) => {
    const [hours, minutes] = String(value || "11:30").split(":").map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const alreadySubmitted =
    safeUserName
      ? todaysOrders[safeUserName]
      : null;

  // A late employee attempt is visible to Admin/HR for approval,
  // but it must never look like a successful employee booking.
  const lateOrderPendingApproval =
    Boolean(alreadySubmitted?.outOfTime && !alreadySubmitted?.approved);

  /*
   * Admin/Owner never gets an employee edit request.
   */
  const pendingEditRequest =
    currentUser?.isAdmin
      ? null
      : safeUserName
        ? editRequests.find(
            (request) =>
              request.employeeName ===
                safeUserName &&
              request.dateKey ===
                new Date()
                  .toISOString()
                  .slice(0, 10) &&
              request.status ===
                "pending"
          )
        : null;

  useEffect(() => {
    if (
      !editingOrder ||
      !alreadySubmitted
    ) {
      return;
    }

    setQty({
      bowl1: Number(
        alreadySubmitted.bowl1?.qty || 0
      ),
      bowl2: Number(
        alreadySubmitted.bowl2?.qty || 0
      ),
      bread: Number(
        alreadySubmitted.bread?.qty || 0
      ),
      rice: Number(
        alreadySubmitted.rice?.qty || 0
      ),
      extra: Number(
        alreadySubmitted.extra?.qty || 0
      ),
      salad: Number(
        alreadySubmitted.salad?.qty || 0
      ),
    });

    const bowl1 = String(
      alreadySubmitted.bowl1?.name || ""
    );

    const bowl2 = String(
      alreadySubmitted.bowl2?.name || ""
    );

    setSameBowl(
      Boolean(
        bowl1 &&
          bowl1 === bowl2
      )
    );

    setDoubledItem(
      bowl1 ===
        String(
          dayMenu?.gravy || ""
        )
        ? "gravy"
        : "dry"
    );
  }, [
    editingOrder,
    alreadySubmitted,
    dayMenu,
  ]);

  const bowl1Name =
    dayMenu
      ? dayMenu.dry
      : "";

  const bowl2Name =
    dayMenu
      ? sameBowl
        ? doubledItem === "dry"
          ? dayMenu.dry
          : dayMenu.gravy
        : dayMenu.gravy
      : "";

  const effectiveBowl1Name =
    dayMenu &&
    sameBowl &&
    doubledItem === "gravy"
      ? dayMenu.gravy
      : bowl1Name;

  const items = useMemo(() => {
    if (!dayMenu) {
      return [];
    }

    return [
      {
        label: "Veg Bowl 1",
        name: effectiveBowl1Name,
        qty: qty.bowl1,
        key: "bowl1",
        icon: Soup,
        color: "#12B76A",
        tag:
          sameBowl &&
          doubledItem === "gravy"
            ? "Gravy"
            : "Dry",
      },

      {
        label: "Veg Bowl 2",
        name: bowl2Name,
        qty: qty.bowl2,
        key: "bowl2",
        icon: Flame,
        color: "#2FD98A",
        tag: sameBowl
          ? doubledItem === "dry"
            ? "Dry"
            : "Gravy"
          : "Gravy",
      },

      {
        label: "Breads",
        name: dayMenu.bread.name,
        qty: qty.bread,
        key: "bread",
        icon: Wheat,
        color: "#F5A524",
      },

      {
        label: "Rice",
        name: dayMenu.rice,
        qty: qty.rice,
        key: "rice",
        icon: Sandwich,
        color: "#C87F0A",
      },

      {
        label: dayMenu.extra.type,
        name: dayMenu.extra.name,
        qty: qty.extra,
        key: "extra",
        icon: IceCreamBowl,
        color: "#12B76A",
      },

      {
        label: "Salad",
        name: dayMenu.salad,
        qty: qty.salad,
        key: "salad",
        icon: SaladIcon,
        color: "#2FD98A",
      },
    ];
  }, [
    dayMenu,
    qty,
    sameBowl,
    doubledItem,
    effectiveBowl1Name,
    bowl2Name,
  ]);

  const visibleItems =
    sameBowl
      ? items.filter(
          (item) =>
            item.key !==
              "bowl1" &&
            item.key !==
              "bowl2"
        )
      : items;

  if (!currentUser) {
    return null;
  }

  const getNormalLimit =
    (key) =>
      Number(
        standards[key] || 0
      );

  const setQtyFor =
    (key) =>
    (value) => {
      const requested =
        Number(value) || 0;

      const normalLimit =
        getNormalLimit(key);

      const currentValue =
        Number(qty[key] || 0);

      if (
        requested <
          currentValue &&
        currentValue >
          normalLimit
      ) {
        releaseSurplus(
          currentUser.name,
          key
        );
      }

      const safeValue =
        Math.min(
          Math.max(
            requested,
            0
          ),
          normalLimit
        );

      setQty(
        (previous) => ({
          ...previous,
          [key]:
            safeValue,
        })
      );
    };

  const handleClaim =
    (key) => {
      const available =
        Number(
          surplusAvailability[
            key
          ] || 0
        );

      if (
        available <= 0
      ) {
        toast(
          "No surplus is available for this item.",
          "info"
        );

        return;
      }

      const claimed =
        claimSurplus(
          currentUser.name,
          key
        );

      if (!claimed) {
        toast(
          "That surplus was just claimed by someone else.",
          "info"
        );

        return;
      }

      setQty(
        (previous) => ({
          ...previous,
          [key]:
            Number(
              previous[key] ||
                0
            ) + 1,
        })
      );

      toast(
        "1 surplus portion added to your thali.",
        "success"
      );
    };

  const getDisplayMax =
    (key) => {
      const normal =
        getNormalLimit(key);

      const surplus =
        Number(
          surplusAvailability[
            key
          ] || 0
        );

      return (
        normal +
        surplus
      );
    };

  const ringSegments =
    items.map(
      (item) => ({
        label:
          item.label,
        qty:
          item.qty,
        max:
          getDisplayMax(
            item.key
          ),
        color:
          item.color,
      })
    );

  /*
   * ==========================================================
   * SUBMIT ORDER
   * ==========================================================
   */
  const handleSubmit =
    async () => {
      if (!dayMenu) {
        return;
      }

      const nextOrder = {
        bowl1: {
          name:
            effectiveBowl1Name,
          qty:
            qty.bowl1,
        },

        bowl2: {
          name:
            bowl2Name,
          qty:
            qty.bowl2,
        },

        bread: {
          name:
            dayMenu.bread.name,
          qty:
            qty.bread,
        },

        rice: {
          name:
            dayMenu.rice,
          qty:
            qty.rice,
        },

        extra: {
          name:
            dayMenu.extra.name,
          qty:
            qty.extra,
        },

        salad: {
          name:
            dayMenu.salad,
          qty:
            qty.salad,
        },
      };

      if (isBookingClosed) {
        // Keep a non-booked late attempt so HR/Admin can see and approve it.
        const savedLate = await submitOrder(
          currentUser.name,
          nextOrder,
          { approved: false, outOfTime: true }
        );

        toast(
          "Time is up to book your order. Please connect to HR.",
          "error"
        );

        if (!savedLate) {
          console.error("Late order attempt could not be recorded for HR.");
        }
        return;
      }

      /*
       * EDITING AN EXISTING ORDER
       */
      if (
        editingOrder &&
        alreadySubmitted
      ) {
        /*
         * ADMIN / OWNER:
         *
         * Direct update.
         * No edit request.
         * No approval.
         */
        if (
          currentUser.isAdmin
        ) {
          clearEditRequestsForEmployee(
            currentUser.name
          );

          const saved = await submitOrder(
            currentUser.name,
            nextOrder,
            { approved: true }
          );

          if (!saved) {
            toast(
              "Could not save your order. Please try again.",
              "error"
            );
            return;
          }

          setEditingOrder(false);

          toast(
            "Order edited successfully. No edit approval is required for Admin/Owner.",
            "success"
          );

          return;
        }

        /*
         * NORMAL EMPLOYEE:
         *
         * Send edit request to Admin/Owner.
         */
        const created =
          requestEdit(
            currentUser.name,
            alreadySubmitted,
            nextOrder
          );

        if (!created) {
          toast(
            "An edit request is already pending for your order.",
            "info"
          );

          return;
        }

        setEditingOrder(false);

        toast(
          "Order edit request submitted successfully. Please wait for admin approval.",
          "success"
        );

        return;
      }

      /*
       * FIRST-TIME ORDER
       */
      const saved = await submitOrder(
        currentUser.name,
        nextOrder,
        { approved: Boolean(currentUser.isAdmin) }
      );

      if (!saved) {
        toast(
          "Could not save your order. Please try again.",
          "error"
        );
        return;
      }

      toast(
        "Order submitted successfully!",
        "success"
      );
    };

  const handleLogout =
    () => {
      logout();
    };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-emerald-950 pb-28">
      <header className="sticky top-0 z-30 glass border-b border-white/20 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">

            {adminBooking && (
              <motion.button
                type="button"
                whileTap={{
                  scale: 0.95,
                }}
                onClick={() => {
                  if (
                    onBackToAdmin
                  ) {
                    onBackToAdmin();
                    return;
                  }

                  navigateTo(
                    "admin"
                  );
                }}
                className="inline-flex items-center gap-2 rounded-full glass px-3 py-2 text-sm font-semibold text-ink-700 dark:text-cream-50/80 hover:bg-ink-900/5 dark:hover:bg-white/10 transition shrink-0"
                aria-label="Back to Admin Dashboard"
              >
                <ArrowLeft
                  size={16}
                />

                <span className="hidden sm:inline">
                  Back to Dashboard
                </span>

                <span className="sm:hidden">
                  Back
                </span>
              </motion.button>
            )}

            <div className="flex items-center gap-2 text-ink-700 dark:text-cream-50/70 min-w-0">
              <CalendarDays
                size={16}
              />

              <span className="text-sm font-medium truncate">
                {weekday} ·{" "}
                {todayLabel()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">

            <span className="hidden sm:inline text-xs font-medium text-ink-500 dark:text-cream-50/50">
              {currentUser.name}
            </span>

            <ThemeToggle />

            <button
              onClick={
                handleLogout
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
      </header>

      <main className="max-w-3xl mx-auto px-5 pt-8">

        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center mb-8"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-amber-500 dark:text-amber-400 font-semibold">
            Today's Thali
          </p>

          <h1 className="font-display text-3xl font-semibold mt-1">
            {dayMenu
              ? `${dayMenu.dry} & ${dayMenu.gravy}`
              : "Office closed today"}
          </h1>

          {!isUnlimitedUser && dayMenu && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 inline-flex flex-col sm:flex-row items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                isBookingClosed
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : tenMinuteWarning
                    ? "bg-amber-400/15 text-amber-600 dark:text-amber-400"
                    : "glass text-ink-700 dark:text-cream-50/80"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Clock3 size={16} />
                {isBookingClosed
                  ? `Booking closed at ${formatDeadline(deadlineTime)}`
                  : `Book by ${formatDeadline(deadlineTime)}`}
              </span>
              <span className="font-mono tracking-wider">
                {countdownHours}:{countdownMinutes}:{countdownSeconds}
              </span>
            </motion.div>
          )}

          {tenMinuteWarning && !isBookingClosed && (
            <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Only {warningMinutes} minute{warningMinutes === 1 ? "" : "s"} left to book your food. Hurry up and place your order!
            </p>
          )}

          {isUnlimitedUser && dayMenu && (
            <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              No booking time limit for Admin/HR and Guest accounts.
            </p>
          )}
        </motion.div>

        {!dayMenu ? (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="glass rounded-3xl p-10 text-center text-ink-500 dark:text-cream-50/60"
          >
            No meal service is
            scheduled for{" "}
            {weekday}. Enjoy your
            day off!
          </motion.div>

        ) : lateOrderPendingApproval &&
          !editingOrder ? (

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="glass-strong rounded-3xl p-8 text-center"
          >
            <p className="font-display text-xl font-semibold mb-1">
              Booking Time Expired
            </p>

            <p className="text-sm text-ink-500 dark:text-cream-50/60 mb-5">
              Submitted at{" "}
              {
                alreadySubmitted.submittedAt
              }
              .
            </p>

            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-4">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Time is up to book your order. Please connect to HR.
              </p>
              <p className="mt-1 text-xs text-ink-500 dark:text-cream-50/60">
                HR/Admin can review this late request from the dashboard.
              </p>
            </div>
          </motion.div>

        ) : alreadySubmitted &&
          !editingOrder ? (

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-3xl p-8 text-center"
          >
            <p className="font-display text-xl font-semibold mb-1">
              Order Submitted Successfully ✅
            </p>

            <p className="text-sm text-ink-500 dark:text-cream-50/60 mb-5">
              Submitted at {alreadySubmitted.submittedAt}.
            </p>

            {pendingEditRequest ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-4">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Edit Request Pending ⏳
                </p>
                <p className="mt-1 text-xs text-ink-500 dark:text-cream-50/60">
                  Admin needs to approve or reject your requested change.
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditingOrder(true)}
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-glow hover:brightness-105 transition"
                >
                  Edit Order
                </button>

                <p className="mt-3 text-xs text-ink-500 dark:text-cream-50/50">
                  {currentUser?.isAdmin
                    ? "Admin/Owner changes are applied directly."
                    : "Changes are sent to Admin for approval."}
                </p>
              </>
            )}
          </motion.div>

        ) : (

          <>
            {editingOrder && (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">

                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    Editing your submitted order
                  </p>

                  <p className="text-xs text-ink-500 dark:text-cream-50/60">
                    {currentUser?.isAdmin
                      ? "Submit the change to update your order directly."
                      : "Submit the change to send an Edit Request to Admin."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingOrder(
                      false
                    )
                  }
                  className="rounded-lg glass px-3 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex justify-center mb-8">
              <ThaliRing
                segments={
                  ringSegments
                }
              />
            </div>

            <div className="flex items-center justify-between glass rounded-2xl p-4 mb-4">

              <div className="flex items-center gap-2">
                <Repeat
                  size={16}
                  className="text-emerald-500"
                />

                <span className="text-sm font-medium">
                  Same vegetable in
                  both bowls
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSameBowl((value) => {
                    const next = !value;

                    if (next) {
                      setQty((previous) => ({
                        ...previous,
                        bowl1: 1,
                        bowl2: 1,
                      }));
                    }

                    return next;
                  });
                }}
                className={`relative flex-none h-8 w-14 rounded-full p-1 overflow-hidden transition-colors duration-200 ${
                  sameBowl
                    ? "bg-emerald-500"
                    : "bg-ink-900/10 dark:bg-white/10"
                }`}
                aria-pressed={
                  sameBowl
                }
                aria-label="Same vegetable in both bowls"
              >
                <motion.span
                  className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-md"
                  animate={{
                    x: sameBowl
                      ? 24
                      : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              </button>
            </div>

            {sameBowl && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mb-4 space-y-3"
              >

                <div className="flex gap-2">
                  {[
                    "dry",
                    "gravy",
                  ].map(
                    (option) => (
                      <button
                        type="button"
                        key={
                          option
                        }
                        onClick={() =>
                          setDoubledItem(
                            option
                          )
                        }
                        className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
                          doubledItem ===
                          option
                            ? "bg-emerald-500 text-emerald-950"
                            : "glass text-ink-700 dark:text-cream-50/70"
                        }`}
                      >
                        Double{" "}
                        {option ===
                        "dry"
                          ? dayMenu.dry
                          : dayMenu.gravy}
                      </button>
                    )
                  )}
                </div>

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center"
                >
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    You added both sabzi bowls the same.
                  </p>

                  <p className="mt-1 text-xs text-ink-500 dark:text-cream-50/50">
                    Both bowls will contain{" "}
                    {
                      doubledItem ===
                      "dry"
                        ? dayMenu.dry
                        : dayMenu.gravy
                    }.
                  </p>
                </motion.div>
              </motion.div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {visibleItems.map(
                (item) => (
                  <ItemCard
                    key={
                      item.key
                    }
                    icon={
                      item.icon
                    }
                    label={
                      item.label
                    }
                    tag={
                      item.tag
                    }
                    name={
                      item.name
                    }
                    qty={
                      item.qty
                    }
                    onChange={setQtyFor(
                      item.key
                    )}
                    max={
                      getNormalLimit(
                        item.key
                      )
                    }
                    accent={
                      item.key ===
                        "bread" ||
                      item.key ===
                        "rice"
                        ? "amber"
                        : "emerald"
                    }
                  />
                )
              )}
            </div>

            <SurplusPanel
              items={
                items
              }
              standards={
                standards
              }
              getAvailable={(
                key
              ) =>
                Number(
                  surplusAvailability[
                    key
                  ] || 0
                )
              }
              onClaim={
                handleClaim
              }
            />

            {cloudStatus === "connecting" && (
              <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-sm text-amber-700 dark:text-amber-300">
                Connecting to LunchBox… please wait before submitting your order.
              </div>
            )}

            {cloudStatus === "error" && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-center text-sm text-red-700 dark:text-red-300">
                LunchBox server connection failed. Please refresh and try again.
              </div>
            )}

            <Cart
              employeeName={
                currentUser.name
              }
              items={
                items
              }
              onSubmit={
                handleSubmit
              }
              disabled={
                !dayMenu ||
                cloudStatus === "connecting" ||
                cloudStatus === "error"
              }
            />
          </>
        )}
      </main>
    </div>
  );
}