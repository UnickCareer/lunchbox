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
  Edit3,
} from "lucide-react";

import { useApp } from "../context/AppContext.jsx";

import { useToast } from "../components/Toast.jsx";

import ThemeToggle from "../components/ThemeToggle.jsx";

import TodaySummary from "../components/admin/TodaySummary.jsx";

import EmployeeManagement from "../components/admin/EmployeeManagement.jsx";

import MenuSettings from "../components/admin/MenuSettings.jsx";

import AccessRequests from "../components/admin/AccessRequests.jsx";

import EditRequests from "../components/admin/EditRequests.jsx";

import EmployeePortal from "./EmployeePortal.jsx";

// Replace this 10-digit number with the real food sender / kitchen WhatsApp number.
// Country code is intentionally NOT included here.
// For India, wa.me will use +91 automatically.
const FOOD_SENDER_PHONE = "9896510890";

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
    key: "edit-requests",
    label: "Edit Order Requests",
    icon: Edit3,
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
    editRequests,
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

  const pendingEditRequestCount =
    editRequests.filter(
      (request) =>
        request.status === "pending"
    ).length;

  /*
   * ==========================================================
   * SEND APPROVED ORDERS TO WHATSAPP
   * ==========================================================
   *
   * Rules:
   *
   * Regular:
   * Employee ordered the complete normal lunch.
   *
   * Special:
   * Employee changed anything:
   * - removed food
   * - added surplus
   * - selected same sabzi
   *
   * Employee names are NEVER shown.
   *
   * Special employees are shown as:
   *
   * P1 : Only Rice
   * P2 : +1 Kheer
   * P3 : Roti × 2, Rice, Salad
   *
   * If an employee has a normal lunch + extra item:
   *
   * P1 : Regular + 1 Kheer extra
   */

  const sendForOrder = () => {
    const orders =
      Object.values(
        todaysOrders || {}
      ).filter(
        (order) =>
          order?.approved
      );

    if (
      orders.length ===
      0
    ) {
      toast(
        "Approve at least one lunch order before sending it to the food sender.",
        "info"
      );

      return;
    }

    const getQty =
      (item) =>
        Number(
          item?.qty || 0
        );

    /*
     * ========================================================
     * ORDER TYPE
     * ========================================================
     */

    const getOrderType =
      (order) => {
        const keys = [
          "bowl1",
          "bowl2",
          "bread",
          "rice",
          "extra",
          "salad",
        ];

        const hasQuantityModification =
          keys.some(
            (key) =>
              getQty(
                order?.[key]
              ) !==
              Number(
                standards?.[
                  key
                ] || 0
              )
          );

        const sameSabzi =
          order?.bowl1?.name &&
          order?.bowl2?.name &&
          String(
            order.bowl1.name
          )
            .trim()
            .toLowerCase() ===
            String(
              order.bowl2.name
            )
              .trim()
              .toLowerCase();

        return (
          hasQuantityModification ||
          sameSabzi
        )
          ? "Special"
          : "Regular";
      };

    const regularOrders =
      orders.filter(
        (order) =>
          getOrderType(
            order
          ) === "Regular"
      );

    const specialOrders =
      orders.filter(
        (order) =>
          getOrderType(
            order
          ) === "Special"
      );

    /*
     * ========================================================
     * FOOD NAME
     * ========================================================
     *
     * Bread is ALWAYS displayed as Roti.
     */

    const getDisplayName =
      (
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
     * ========================================================
     * SPECIAL ORDER DESCRIPTION
     * ========================================================
     */

    const getSpecialDescription =
      (order) => {
        const reductions =
          [];

        const additions =
          [];

        const normalItems =
          [];

        const keys = [
          "bowl1",
          "bowl2",
          "bread",
          "rice",
          "extra",
          "salad",
        ];

        keys.forEach(
          (key) => {
            const actualQty =
              getQty(
                order?.[key]
              );

            const standardQty =
              Number(
                standards?.[
                  key
                ] || 0
              );

            const difference =
              actualQty -
              standardQty;

            const itemName =
              getDisplayName(
                key,
                order?.[
                  key
                ]
              );

            /*
             * Employee ordered LESS.
             */
            if (
              difference <
              0
            ) {
              reductions.push(
                {
                  name:
                    itemName,
                  qty:
                    Math.abs(
                      difference
                    ),
                }
              );
            }

            /*
             * Employee ordered MORE.
             */
            if (
              difference >
              0
            ) {
              additions.push(
                {
                  name:
                    itemName,
                  qty:
                    difference,
                }
              );
            }

            /*
             * Normal item.
             *
             * Used to detect "Only Rice",
             * "Only Roti + Salad", etc.
             */
            if (
              actualQty >
              0
            ) {
              normalItems.push(
                {
                  key,
                  name:
                    itemName,
                  qty:
                    actualQty,
                }
              );
            }
          }
        );

        /*
         * ====================================================
         * ONLY-ITEM LOGIC
         * ====================================================
         *
         * Example:
         *
         * Rice = 1
         * Everything else = 0
         *
         * Result:
         *
         * Only Rice
         *
         * NOT:
         *
         * -1 Mix Veg
         * -1 Paneer
         * -4 Roti
         * etc.
         */

        const positiveItems =
          normalItems.filter(
            (item) =>
              item.qty > 0
          );

        if (
          positiveItems.length ===
          1
        ) {
          const onlyItem =
            positiveItems[0];

          return `Only ${onlyItem.name}`;
        }

        /*
         * ====================================================
         * TWO OR MORE REMAINING ITEMS
         * ====================================================
         *
         * Example:
         *
         * Rice + 2 Roti + Salad
         *
         * Result:
         *
         * Roti × 2, Rice, Salad
         */

        const hasMajorReduction =
          reductions.length >
          0;

        const hasAddition =
          additions.length >
          0;

        /*
         * If the employee removed items and still has
         * some normal items, show ONLY what they actually
         * ordered.
         *
         * This keeps the WhatsApp message short.
         */

        if (
          hasMajorReduction &&
          !hasAddition
        ) {
          const actualItems =
            positiveItems.map(
              (item) => {
                if (
                  item.qty ===
                  1
                ) {
                  return item.name;
                }

                return `${item.name} × ${item.qty}`;
              }
            );

          if (
            actualItems.length >
            0
          ) {
            return actualItems.join(
              ", "
            );
          }

          return "No food selected";
        }

        /*
         * ====================================================
         * REGULAR + EXTRA
         * ====================================================
         *
         * Example:
         *
         * Normal lunch + 1 Kheer
         *
         * Result:
         *
         * Regular + 1 Kheer extra
         */

        const hasOnlyAdditions =
          !hasMajorReduction &&
          hasAddition;

        if (
          hasOnlyAdditions
        ) {
          const extraText =
            additions
              .map(
                (
                  item
                ) =>
                  `${item.qty} ${item.name}`
              )
              .join(
                ", "
              );

          return `Regular + ${extraText} extra`;
        }

        /*
         * ====================================================
         * MIXED REDUCTION + ADDITION
         * ====================================================
         *
         * Example:
         *
         * Rice reduced + Kheer added
         */

        const parts = [];

        if (
          reductions.length >
          0
        ) {
          const reducedText =
            reductions
              .map(
                (
                  item
                ) =>
                  `${item.name} × ${item.qty}`
              )
              .join(
                ", "
              );

          parts.push(
            `-${reducedText}`
          );
        }

        if (
          additions.length >
          0
        ) {
          const addedText =
            additions
              .map(
                (
                  item
                ) =>
                  `+${item.qty} ${item.name}`
              )
              .join(
                ", "
              );

          parts.push(
            addedText
          );
        }

        /*
         * Same sabzi with otherwise normal quantities.
         */
        const sameSabzi =
          order?.bowl1?.name &&
          order?.bowl2?.name &&
          String(
            order.bowl1.name
          )
            .trim()
            .toLowerCase() ===
            String(
              order.bowl2.name
            )
              .trim()
              .toLowerCase();

        if (
          parts.length ===
            0 &&
          sameSabzi
        ) {
          return `Same Sabzi - ${order.bowl1.name}`;
        }

        if (
          parts.length >
          0
        ) {
          return parts.join(
            ", "
          );
        }

        return "Special";
      };

    /*
     * ========================================================
     * FINAL WHATSAPP HEADER
     * ========================================================
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

      `Regular : ${regularOrders.length}`,

      `Special : ${specialOrders.length}`,

      "",
    ];

    /*
     * ========================================================
     * SPECIAL ORDERS
     * ========================================================
     *
     * NEVER expose employee names.
     */

    specialOrders.forEach(
      (
        order,
        index
      ) => {
        const description =
          getSpecialDescription(
            order
          );

        lines.push(
          `P${index + 1} :  ${description}`
        );
      }
    );

    lines.push("");

    lines.push(
      "Please prepare the above approved lunch orders."
    );

    /*
     * ========================================================
     * WHATSAPP DEEPLINK
     * ========================================================
     */

    const phone =
      String(
        FOOD_SENDER_PHONE
      ).replace(
        /\D/g,
        ""
      );

    const whatsappPhone =
      phone.length ===
      10
        ? `91${phone}`
        : phone;

    const whatsappUrl =
      `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        lines.join(
          "\n"
        )
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
   * ==========================================================
   * ADMIN BOOK MY LUNCH
   * ==========================================================
   */

  if (
    bookingLunch
  ) {
    return (
      <EmployeePortal
        adminBooking
        onBackToAdmin={() =>
          setBookingLunch(
            false
          )
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

                {key ===
                  "edit-requests" &&
                  pendingEditRequestCount >
                    0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-amber-400 text-emerald-950 text-[10px] font-bold flex items-center justify-center">
                      {
                        pendingEditRequestCount
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
              "edit-requests" && (
              <EditRequests />
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