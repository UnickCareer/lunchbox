import React, {
  useMemo,
  useState,
  useEffect,
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

  const alreadySubmitted =
    safeUserName
      ? todaysOrders[safeUserName]
      : null;

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
    () => {
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

          submitOrder(
            currentUser.name,
            nextOrder
          );

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
      submitOrder(
        currentUser.name,
        nextOrder
      );

      toast(
        "Your thali order is locked in for today",
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

        ) : alreadySubmitted &&
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
              Order Submitted Successfully
              ✅
            </p>

            <p className="text-sm text-ink-500 dark:text-cream-50/60 mb-5">
              Submitted at{" "}
              {
                alreadySubmitted.submittedAt
              }
              .
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
                  onClick={() =>
                    setEditingOrder(
                      true
                    )
                  }
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
                onClick={() =>
                  setSameBowl(
                    (value) =>
                      !value
                  )
                }
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
                !dayMenu
              }
            />
          </>
        )}
      </main>
    </div>
  );
}