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
  Send,
} from "lucide-react";

import { useApp } from "../context/AppContext.jsx";

import { useToast } from "../components/Toast.jsx";

import ThemeToggle from "../components/ThemeToggle.jsx";

import TodaySummary from "../components/admin/TodaySummary.jsx";

import EmployeeManagement from "../components/admin/EmployeeManagement.jsx";

import MenuSettings from "../components/admin/MenuSettings.jsx";

import AccessRequests from "../components/admin/AccessRequests.jsx";

import EmployeePortal from "./EmployeePortal.jsx";

// Replace this 10-digit number with the real food sender / kitchen WhatsApp number.
// Country code is intentionally NOT included here.
// For India, wa.me will automatically use +91.
const FOOD_SENDER_PHONE = "9876543210";

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
    todaysOrders,
    standards,
  } = useApp();

  const toast = useToast();

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

  /*
   * ==========================================================
   * SEND APPROVED ORDERS TO WHATSAPP
   * ==========================================================
   *
   * Rules:
   *
   * 1. Employee names are NEVER shown.
   * 2. Special people are P1, P2, P3...
   * 3. A completely normal lunch = Regular.
   * 4. Normal lunch + surplus item = Regular + surplus.
   * 5. Modified quantities = Special.
   * 6. Only Rice = "Only Rice".
   * 7. Bread is displayed as "Roti".
   * 8. Normal/default items are NOT listed for a regular order.
   */

  const sendForOrder = () => {
    const orders = Object.values(
      todaysOrders || {}
    ).filter(
      (order) =>
        order?.approved
    );

    if (
      orders.length === 0
    ) {
      toast(
        "Approve at least one lunch order before sending it to the food sender.",
        "info"
      );

      return;
    }

    /*
     * ----------------------------------------------------------
     * Quantity helper
     * ----------------------------------------------------------
     */
    const getQty = (
      item
    ) =>
      Number(
        item?.qty || 0
      );

    /*
     * ----------------------------------------------------------
     * Food keys
     * ----------------------------------------------------------
     */
    const FOOD_KEYS = [
      "bowl1",
      "bowl2",
      "bread",
      "rice",
      "extra",
      "salad",
    ];

    /*
     * ----------------------------------------------------------
     * Display name
     * ----------------------------------------------------------
     *
     * Bread is always shown as Roti.
     */
    const getDisplayName = (
      key,
      item
    ) => {
      if (
        key === "bread"
      ) {
        return "Roti";
      }

      return (
        item?.name ||
        "Item"
      );
    };

    /*
     * ----------------------------------------------------------
     * Check whether quantity is exactly the normal standard.
     * ----------------------------------------------------------
     */
    const isNormalQuantity =
      (
        key,
        order
      ) => {
        const actual =
          getQty(
            order?.[key]
          );

        const standard =
          Number(
            standards?.[
              key
            ] || 0
          );

        return (
          actual ===
          standard
        );
      };

    /*
     * ----------------------------------------------------------
     * Check whether the two bowls contain the same sabzi.
     * ----------------------------------------------------------
     */
    const hasSameSabzi =
      (order) => {
        const bowl1 =
          String(
            order?.bowl1
              ?.name || ""
          )
            .trim()
            .toLowerCase();

        const bowl2 =
          String(
            order?.bowl2
              ?.name || ""
          )
            .trim()
            .toLowerCase();

        return (
          Boolean(
            bowl1 &&
              bowl2
          ) &&
          bowl1 === bowl2
        );
      };

    /*
     * ----------------------------------------------------------
     * Determine surplus-only changes.
     * ----------------------------------------------------------
     *
     * Example:
     *
     * Standard:
     * Kheer = 1
     *
     * Actual:
     * Kheer = 2
     *
     * Result:
     * +1 Kheer
     *
     * This is NOT considered a normal quantity modification.
     * It is "Regular + surplus".
     */
    const getPositiveExtras =
      (order) => {
        const extras = [];

        FOOD_KEYS.forEach(
          (key) => {
            const actual =
              getQty(
                order?.[key]
              );

            const standard =
              Number(
                standards?.[
                  key
                ] || 0
              );

            const difference =
              actual -
              standard;

            if (
              difference >
              0
            ) {
              extras.push({
                key,
                name:
                  getDisplayName(
                    key,
                    order?.[
                      key
                    ]
                  ),
                amount:
                  difference,
              });
            }
          }
        );

        return extras;
      };

    /*
     * ----------------------------------------------------------
     * Determine whether an order is completely regular.
     * ----------------------------------------------------------
     *
     * A same-sabzi selection is special because the actual food
     * selection has changed, even if quantities remain normal.
     */
    const isCompletelyRegular =
      (order) => {
        if (
          hasSameSabzi(
            order
          )
        ) {
          return false;
        }

        return FOOD_KEYS.every(
          (key) =>
            isNormalQuantity(
              key,
              order
            )
        );
      };

    /*
     * ----------------------------------------------------------
     * Determine whether an order is:
     *
     * A) Regular
     * B) Regular + surplus
     * C) Special
     * ----------------------------------------------------------
     */
    const getOrderCategory =
      (order) => {
        const regular =
          isCompletelyRegular(
            order
          );

        if (
          regular
        ) {
          return "Regular";
        }

        /*
         * A regular lunch with ONLY positive quantity changes
         * represents surplus/additional food.
         *
         * Example:
         *
         * Normal:
         * bowl1 1
         * bowl2 1
         * bread 4
         * rice 1
         * extra 1
         * salad 1
         *
         * Actual:
         * same + Kheer 2
         *
         * => Regular + 1 Kheer extra
         */
        const hasNegativeChange =
          FOOD_KEYS.some(
            (key) => {
              const actual =
                getQty(
                  order?.[
                    key
                  ]
                );

              const standard =
                Number(
                  standards?.[
                    key
                  ] || 0
                );

              return (
                actual <
                standard
              );
            }
          );

        const sameSabzi =
          hasSameSabzi(
            order
          );

        const positiveExtras =
          getPositiveExtras(
            order
          );

        if (
          !hasNegativeChange &&
          !sameSabzi &&
          positiveExtras.length >
            0
        ) {
          return "RegularSurplus";
        }

        return "Special";
      };

    /*
     * ----------------------------------------------------------
     * Split approved orders.
     * ----------------------------------------------------------
     */
    const regularOrders =
      orders.filter(
        (order) =>
          getOrderCategory(
            order
          ) === "Regular"
      );

    const regularSurplusOrders =
      orders.filter(
        (order) =>
          getOrderCategory(
            order
          ) ===
          "RegularSurplus"
      );

    const specialOrders =
      orders.filter(
        (order) =>
          getOrderCategory(
            order
          ) === "Special"
      );

    /*
     * ----------------------------------------------------------
     * Build description for a Regular + Surplus order.
     * ----------------------------------------------------------
     *
     * Example:
     *
     * Regular +1 Kheer extra
     *
     * Multiple surplus items:
     *
     * Regular +1 Kheer, +2 Roti extra
     */
    const getRegularSurplusText =
      (order) => {
        const extras =
          getPositiveExtras(
            order
          );

        if (
          extras.length ===
          0
        ) {
          return "Regular";
        }

        const extraText =
          extras
            .map(
              ({
                name,
                amount,
              }) =>
                `+${amount} ${name}`
            )
            .join(
              ", "
            );

        return `Regular ${extraText} extra`;
      };

    /*
     * ----------------------------------------------------------
     * Build Special order description.
     * ----------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We do NOT show rejected/default items.
     *
     * Example:
     *
     * Employee orders:
     * Rice = 1
     * Everything else = 0
     *
     * Result:
     *
     * P1 : Only Rice
     *
     * Example:
     *
     * Rice = 1
     * Roti = 6
     * Salad = 2
     *
     * Result:
     *
     * P1 : Only Rice, +2 Roti, +1 Salad
     */
    const getSpecialText =
      (order) => {
        const selectedItems =
          [];

        const quantityChanges =
          [];

        FOOD_KEYS.forEach(
          (key) => {
            const actual =
              getQty(
                order?.[
                  key
                ]
              );

            const standard =
              Number(
                standards?.[
                  key
                ] || 0
              );

            const name =
              getDisplayName(
                key,
                order?.[
                  key
                ]
              );

            /*
             * If an item is completely removed from the order,
             * do NOT display "-1 Item".
             *
             * We only care about what the food sender needs
             * to prepare.
             */
            if (
              actual ===
              0
            ) {
              return;
            }

            /*
             * If quantity is above normal:
             *
             * +2 Roti
             */
            if (
              actual >
              standard
            ) {
              const difference =
                actual -
                standard;

              quantityChanges.push(
                `+${difference} ${name}`
              );

              return;
            }

            /*
             * If quantity is below normal but still greater than
             * zero, show what is actually required.
             *
             * Example:
             *
             * Standard Roti = 4
             * Actual Roti = 2
             *
             * Show:
             *
             * Roti × 2
             */
            if (
              actual <
                standard &&
              actual >
                0
            ) {
              selectedItems.push(
                `${name} × ${actual}`
              );

              return;
            }

            /*
             * Normal quantity.
             *
             * For a Special order we need to know what the person
             * still wants.
             */
            if (
              actual ===
              standard
            ) {
              selectedItems.push(
                name
              );
            }
          }
        );

        /*
         * ------------------------------------------------------
         * If only one normal item remains, simplify:
         *
         * Only Rice
         * Only Roti
         * Only Salad
         * ------------------------------------------------------
         */
        if (
          selectedItems.length ===
            1 &&
          quantityChanges.length ===
            0
        ) {
          return `Only ${selectedItems[0]}`;
        }

        /*
         * If the order contains one "Only X" style item plus
         * quantity additions, preserve that compact wording.
         */
        if (
          selectedItems.length ===
            1
        ) {
          return `Only ${selectedItems[0]}, ${quantityChanges.join(
            ", "
          )}`;
        }

        /*
         * Otherwise combine actual selected food and additions.
         */
        const parts = [
          ...selectedItems,
          ...quantityChanges,
        ];

        /*
         * Same sabzi special case.
         */
        if (
          parts.length ===
            0 &&
          hasSameSabzi(
            order
          )
        ) {
          return `Same Sabzi - ${order.bowl1.name}`;
        }

        return parts.join(
          ", "
        );
      };

    /*
     * ----------------------------------------------------------
     * Build final WhatsApp message.
     * ----------------------------------------------------------
     *
     * Regular count:
     * Completely normal orders.
     *
     * Special count:
     * Orders that actually require special preparation.
     *
     * Regular + surplus is shown separately and is NOT counted
     * as Special.
     */
    const lines = [
      "🍱 OFFICE LUNCH ORDER Sparsh Panipat",

      `Date: ${new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )}`,

      `Total approved orders: ${orders.length}`,

      "",

      `Regular: ${
        regularOrders.length
      }`,

      `Special: ${
        regularSurplusOrders.length +
        specialOrders.length
      }`,

      "",
    ];

    /*
     * ----------------------------------------------------------
     * Regular + surplus orders
     * ----------------------------------------------------------
     *
     * These are anonymous P numbers too.
     */
    regularSurplusOrders.forEach(
      (
        order,
        index
      ) => {
        const personNumber =
          index + 1;

        lines.push(
          `P${personNumber} : ${getRegularSurplusText(
            order
          )}`
        );
      }
    );

    /*
     * ----------------------------------------------------------
     * Actual Special orders
     * ----------------------------------------------------------
     *
     * Continue P numbering after Regular + surplus orders.
     */
    specialOrders.forEach(
      (
        order,
        index
      ) => {
        const personNumber =
          regularSurplusOrders.length +
          index +
          1;

        const text =
          getSpecialText(
            order
          );

        if (
          text
        ) {
          lines.push(
            `P${personNumber} : ${text}`
          );
        }
      }
    );

    lines.push("");

    lines.push(
      "Please prepare the above approved lunch orders."
    );

    /*
     * ----------------------------------------------------------
     * WhatsApp deeplink
     * ----------------------------------------------------------
     */
    const phone =
      String(
        FOOD_SENDER_PHONE
      ).replace(
        /\D/g,
        ""
      );

    /*
     * For a normal 10-digit Indian number:
     *
     * 9876543210
     *
     * becomes:
     *
     * 919876543210
     */
    const whatsappPhone =
      phone.length ===
      10
        ? `91${phone}`
        : phone;

    const whatsappUrl =
      `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        lines.join("\n")
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (bookingLunch) {
    return (
      <EmployeePortal
        adminBooking={true}
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
              onClick={
                sendForOrder
              }
              className="hidden sm:flex items-center gap-2 rounded-full bg-amber-400 text-emerald-950 px-4 py-2 text-sm font-semibold shadow-glow hover:brightness-105 transition"
              title="Send approved orders to the food sender on WhatsApp"
            >
              <Send
                size={15}
              />

              Send for Order
            </button>

            <button
              onClick={() =>
                setBookingLunch(
                  true
                )
              }
              className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-500 text-emerald-950 px-4 py-2 text-sm font-semibold shadow-glow hover:brightness-105 transition"
              title="Book your own lunch"
            >
              <Utensils
                size={15}
              />

              Book My Lunch
            </button>

            <button
              onClick={
                sendForOrder
              }
              className="sm:hidden h-10 w-10 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center shadow-glow"
              aria-label="Send for order"
              title="Send approved orders to WhatsApp"
            >
              <Send
                size={16}
              />
            </button>

            <button
              onClick={() =>
                setBookingLunch(
                  true
                )
              }
              className="sm:hidden h-10 w-10 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center shadow-glow"
              aria-label="Book my lunch"
            >
              <Utensils
                size={16}
              />
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
        {tab ===
          "summary" && (
          <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-amber-600 dark:text-amber-300">
                  Food Order Sender
                </p>

                <h2 className="mt-1 text-base font-semibold text-ink-900 dark:text-cream-50">
                  Send approved lunch orders on WhatsApp
                </h2>

                <p className="mt-1 text-xs text-ink-600 dark:text-cream-50/60">
                  WhatsApp: +91{" "}
                  {
                    FOOD_SENDER_PHONE
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={
                  sendForOrder
                }
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-emerald-950 shadow-glow transition hover:brightness-105 active:scale-[0.98]"
              >
                <Send
                  size={17}
                />

                Send for Order
              </button>
            </div>
          </div>
        )}

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

            {tab ===
              "menu" && (
              <MenuSettings />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}