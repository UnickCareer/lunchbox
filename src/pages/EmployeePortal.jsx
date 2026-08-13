import React, {
  useMemo,
  useState,
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

export default function EmployeePortal() {
  const {
    currentUser,

    menu,

    logout,

    submitOrder,

    todaysOrders,

    standards,

    surplusAvailability,

    claimSurplus,
    releaseSurplus,
  } = useApp();

  const toast =
    useToast();

  const weekday =
    todayWeekday();

  const dayMenu =
    menu[weekday];

  const [
    sameBowl,
    setSameBowl,
  ] = useState(false);

  const [
    doubledItem,
    setDoubledItem,
  ] = useState("dry");

  /*
   * Normal food quantities.
   *
   * These NEVER start above
   * the normal daily limits.
   */
  const [
    qty,
    setQty,
  ] = useState({
    bowl1: 1,

    bowl2: 1,

    bread:
      dayMenu?.bread
        ?.baseQty ?? 4,

    rice: 1,

    extra: 1,

    salad: 1,
  });

  /*
   * Hooks are intentionally
   * completed before null guard.
   */
  const safeUserName =
    currentUser?.name || "";

  const alreadySubmitted =
    safeUserName
      ? todaysOrders[
          safeUserName
        ]
      : null;

  const bowl1Name =
    dayMenu
      ? dayMenu.dry
      : "";

  const bowl2Name =
    dayMenu
      ? sameBowl
        ? doubledItem ===
          "dry"
          ? dayMenu.dry
          : dayMenu.gravy
        : dayMenu.gravy
      : "";

  const effectiveBowl1Name =
    dayMenu &&
    sameBowl &&
    doubledItem ===
      "gravy"
      ? dayMenu.gravy
      : bowl1Name;

  /*
   * ==========================================================
   * ITEMS
   * ==========================================================
   */
  const items =
    useMemo(() => {
      if (!dayMenu) {
        return [];
      }

      return [
        {
          label:
            "Veg Bowl 1",

          name:
            effectiveBowl1Name,

          qty:
            qty.bowl1,

          key:
            "bowl1",

          icon:
            Soup,

          color:
            "#12B76A",

          tag:
            sameBowl &&
            doubledItem ===
              "gravy"
              ? "Gravy"
              : "Dry",
        },

        {
          label:
            "Veg Bowl 2",

          name:
            bowl2Name,

          qty:
            qty.bowl2,

          key:
            "bowl2",

          icon:
            Flame,

          color:
            "#2FD98A",

          tag:
            sameBowl
              ? doubledItem ===
                "dry"
                ? "Dry"
                : "Gravy"
              : "Gravy",
        },

        {
          label:
            "Breads",

          name:
            dayMenu.bread
              .name,

          qty:
            qty.bread,

          key:
            "bread",

          icon:
            Wheat,

          color:
            "#F5A524",
        },

        {
          label:
            "Rice",

          name:
            dayMenu.rice,

          qty:
            qty.rice,

          key:
            "rice",

          icon:
            Sandwich,

          color:
            "#C87F0A",
        },

        {
          label:
            dayMenu.extra
              .type,

          name:
            dayMenu.extra
              .name,

          qty:
            qty.extra,

          key:
            "extra",

          icon:
            IceCreamBowl,

          color:
            "#12B76A",
        },

        {
          label:
            "Salad",

          name:
            dayMenu.salad,

          qty:
            qty.salad,

          key:
            "salad",

          icon:
            SaladIcon,

          color:
            "#2FD98A",
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

  /*
   * ==========================================================
   * LOGOUT SAFETY
   * ==========================================================
   */
  if (!currentUser) {
    return null;
  }

  /*
   * ==========================================================
   * FOOD LIMIT LOGIC
   * ==========================================================
   *
   * Normal:
   *
   * bowl1 = 1
   * bowl2 = 1
   * bread = 4/5
   * rice = 1
   * extra = 1
   * salad = 1
   *
   * If surplus is available:
   *
   * max =
   * normal limit + currently available surplus
   *
   * But a surplus can ONLY be
   * obtained through the
   * "Add 1" button.
   *
   * The normal + button cannot
   * consume surplus.
   */
  const getNormalLimit =
    (key) =>
      Number(
        standards[key] ||
          0
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

      /*
       * If the employee had claimed a surplus portion
       * and now presses minus, release that exact surplus
       * portion back into the shared surplus pool.
       *
       * Example: normal limit 1, current quantity 2.
       * Press minus -> quantity 1 + surplus becomes available again.
       */
      if (
        requested < currentValue &&
        currentValue > normalLimit
      ) {
        releaseSurplus(
          currentUser.name,
          key
        );
      }

      /*
       * The normal +/- selector can never exceed the normal
       * daily allowance. Extra portions are obtained only
       * through the surplus Add 1 button.
       */
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
          [key]: safeValue,
        })
      );
    };

  /*
   * ==========================================================
   * CLAIM SURPLUS
   * ==========================================================
   */
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

      /*
       * Ask context to consume
       * one actual surplus portion.
       */
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

      /*
       * Now add ONE portion
       * above the normal limit.
       */
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

  /*
   * ==========================================================
   * MAXIMUM FOR DISPLAY / RING
   * ==========================================================
   */
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

      submitOrder(
        currentUser.name,
        {
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
              dayMenu.bread
                .name,

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
              dayMenu.extra
                .name,

            qty:
              qty.extra,
          },

          salad: {
            name:
              dayMenu.salad,

            qty:
              qty.salad,
          },
        }
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
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ink-700 dark:text-cream-50/70">
            <CalendarDays
              size={16}
            />

            <span className="text-sm font-medium">
              {weekday} ·{" "}
              {todayLabel()}
            </span>
          </div>

          <div className="flex items-center gap-3">
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
        ) : alreadySubmitted ? (
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
              Order already submitted
              ✅
            </p>

            <p className="text-sm text-ink-500 dark:text-cream-50/60">
              Submitted at{" "}
              {
                alreadySubmitted.submittedAt
              }
              . See you at lunch!
            </p>
          </motion.div>
        ) : (
          <>
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
                onClick={() =>
                  setSameBowl(
                    (value) =>
                      !value
                  )
                }
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  sameBowl
                    ? "bg-emerald-500"
                    : "bg-ink-900/10 dark:bg-white/10"
                }`}
                aria-pressed={
                  sameBowl
                }
              >
                <motion.span
                  className="absolute top-1 h-5 w-5 rounded-full bg-white shadow"
                  animate={{
                    x: sameBowl
                      ? 22
                      : 4,
                  }}
                />
              </button>
            </div>

            {sameBowl && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height:
                    "auto",
                }}
                className="mb-4 flex gap-2"
              >
                {[
                  "dry",
                  "gravy",
                ].map(
                  (option) => (
                    <button
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
              </motion.div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {items.map(
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

                    /*
                     * IMPORTANT:
                     *
                     * Ordinary quantity
                     * selector is capped
                     * at the NORMAL limit.
                     *
                     * Surplus must be
                     * claimed separately.
                     */
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

            {/*
             * ==================================================
             * SURPLUS
             * ==================================================
             *
             * The panel disappears automatically
             * when surplusAvailability[key] reaches 0.
             */}
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
              employeeId={
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