import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  DEFAULT_EMPLOYEES,
  DEFAULT_MENU,
} from "../data/seedData.js";

import { normalizeName } from "../utils/validation.js";

const AppContext = createContext(null);

const LS_KEYS = {
  employees: "op_employees",
  menu: "op_menu",
  orders: "op_orders",
  theme: "op_theme",
  surplusClaims: "op_surplus_claims",
  loginRequests: "op_login_requests",
};

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Frontend-only app.
  }
}

export function todayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

export function todayLabel() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function todayWeekday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function normalizeEmployee(employee) {
  return {
    name: employee?.name || "",
    role:
      employee?.role ||
      (employee?.isOwner
        ? "owner"
        : employee?.isAdmin
          ? "admin"
          : "employee"),
    isAdmin: Boolean(employee?.isAdmin),
    isOwner: Boolean(employee?.isOwner),
    adminPin: employee?.adminPin || "",
    temporaryUntil: employee?.temporaryUntil || null,
  };
}

function getDefaultEmployees() {
  return DEFAULT_EMPLOYEES.map(normalizeEmployee);
}

function normalizeStoredEmployees(stored) {
  if (!Array.isArray(stored) || stored.length === 0) {
    return getDefaultEmployees();
  }

  // Remove the old numeric-ID system if an old version is still stored.
  if (stored.some((employee) => employee?.id !== undefined)) {
    return getDefaultEmployees();
  }

  let result = stored.map(normalizeEmployee);

  // Always make sure the owner exists and can never lose owner/admin access.
  const hasMohit = result.some(
    (employee) => normalizeName(employee.name) === "mohit"
  );

  if (!hasMohit) {
    result = [getDefaultEmployees()[0], ...result];
  }

  return result.map((employee) => {
    if (normalizeName(employee.name) !== "mohit") {
      return employee;
    }

    return {
      ...employee,
      name: "Mohit",
      role: "owner",
      isAdmin: true,
      isOwner: true,
      adminPin: employee.adminPin || "0990",
    };
  });
}

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState(() =>
    normalizeStoredEmployees(
      loadLS(LS_KEYS.employees, null)
    )
  );

  const [menu, setMenu] = useState(() =>
    loadLS(LS_KEYS.menu, DEFAULT_MENU)
  );

  const [orders, setOrders] = useState(() =>
    loadLS(LS_KEYS.orders, {})
  );

  const [theme, setTheme] = useState(() =>
    loadLS(LS_KEYS.theme, "dark")
  );

  /*
   * New claim shape:
   * {
   *   "2026-08-13": {
   *     "Sunny": { bowl1: 1, bread: 1 },
   *     "Aman": { rice: 1 }
   *   }
   * }
   *
   * This lets us release a surplus when the same employee
   * later presses minus.
   */
  const [surplusClaims, setSurplusClaims] = useState(() =>
    loadLS(LS_KEYS.surplusClaims, {})
  );

  const [loginRequests, setLoginRequests] = useState(() =>
    loadLS(LS_KEYS.loginRequests, [])
  );

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    saveLS(LS_KEYS.employees, employees);
  }, [employees]);

  useEffect(() => {
    saveLS(LS_KEYS.menu, menu);
  }, [menu]);

  useEffect(() => {
    saveLS(LS_KEYS.orders, orders);
  }, [orders]);

  useEffect(() => {
    saveLS(LS_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    saveLS(LS_KEYS.surplusClaims, surplusClaims);
  }, [surplusClaims]);

  useEffect(() => {
    saveLS(LS_KEYS.loginRequests, loginRequests);
  }, [loginRequests]);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((previous) =>
      previous === "dark" ? "light" : "dark"
    );
  }, []);

  /* ==========================================================
   * LOGIN
   * ========================================================== */
  const login = useCallback(
    (name, pin = "") => {
      const normalized = normalizeName(name);

      const match = employees.find(
        (employee) =>
          normalizeName(employee.name) === normalized
      );

      if (!match) {
        const cleanName = String(name || "")
          .trim()
          .replace(/\s+/g, " ");

        if (cleanName) {
          setLoginRequests((previous) => {
            const alreadyPending = previous.some(
              (request) =>
                normalizeName(request.name) === normalized
            );

            if (alreadyPending) {
              return previous;
            }

            return [
              ...previous,
              {
                id: `${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2, 8)}`,
                name: cleanName,
                requestedAt: new Date().toLocaleString("en-GB"),
              },
            ];
          });
        }

        return {
          ok: false,
          reason: "not_found",
          requested: true,
        };
      }

      if (match.isAdmin) {
        if (
          String(pin).trim() !==
          String(match.adminPin || "").trim()
        ) {
          return {
            ok: false,
            reason: "invalid_pin",
          };
        }
      }

      setCurrentUser({
        name: match.name,
        role: match.role,
        isAdmin: Boolean(match.isAdmin),
        isOwner: Boolean(match.isOwner),
      });

      return {
        ok: true,
        isAdmin: Boolean(match.isAdmin),
        isOwner: Boolean(match.isOwner),
      };
    },
    [employees]
  );

  const logout = useCallback(() => {
    // App.jsx switches to Login immediately when this becomes null.
    setCurrentUser(null);
  }, []);

  /* ==========================================================
   * EMPLOYEE MANAGEMENT
   * ========================================================== */
  const addEmployee = useCallback(
    (name, isAdmin = false, adminPin = "") => {
      const cleanName = String(name || "")
        .trim()
        .replace(/\s+/g, " ");

      if (!cleanName) {
        return false;
      }

      let added = false;

      setEmployees((previous) => {
        const exists = previous.some(
          (employee) =>
            normalizeName(employee.name) ===
            normalizeName(cleanName)
        );

        if (exists) {
          return previous;
        }

        added = true;

        return [
          ...previous,
          {
            name: cleanName,
            role: isAdmin ? "admin" : "employee",
            isAdmin: Boolean(isAdmin),
            isOwner: false,
            adminPin: isAdmin ? String(adminPin || "") : "",
            temporaryUntil: null,
          },
        ];
      });

      return added;
    },
    []
  );

  const removeEmployee = useCallback((name) => {
    const normalized = normalizeName(name);

    if (normalized === "mohit") {
      return false;
    }

    setEmployees((previous) =>
      previous.filter(
        (employee) =>
          normalizeName(employee.name) !== normalized
      )
    );

    return true;
  }, []);

  const toggleAdmin = useCallback((name) => {
    const normalized = normalizeName(name);

    if (normalized === "mohit") {
      return false;
    }

    setEmployees((previous) =>
      previous.map((employee) => {
        if (
          normalizeName(employee.name) !== normalized
        ) {
          return employee;
        }

        const becomingAdmin = !employee.isAdmin;

        return {
          ...employee,
          isAdmin: becomingAdmin,
          role: becomingAdmin ? "admin" : "employee",
          adminPin: becomingAdmin
            ? employee.adminPin || ""
            : "",
        };
      })
    );

    return true;
  }, []);

  const setAdminPin = useCallback((name, pin) => {
    const normalized = normalizeName(name);

    if (!pin || String(pin).length < 4) {
      return false;
    }

    setEmployees((previous) =>
      previous.map((employee) => {
        if (
          normalizeName(employee.name) !== normalized
        ) {
          return employee;
        }

        return {
          ...employee,
          isAdmin: true,
          role: employee.isOwner ? "owner" : "admin",
          adminPin: String(pin),
        };
      })
    );

    return true;
  }, []);

  /* ==========================================================
   * ACCESS REQUESTS
   * ========================================================== */
  const approveAccessRequest = useCallback(
    (requestId, temporary = false) => {
      const request = loginRequests.find(
        (item) => item.id === requestId
      );

      if (!request) {
        return false;
      }

      const cleanName = request.name;

      setEmployees((previous) => {
        const exists = previous.some(
          (employee) =>
            normalizeName(employee.name) ===
            normalizeName(cleanName)
        );

        if (exists) {
          return previous;
        }

        return [
          ...previous,
          {
            name: cleanName,
            role: "employee",
            isAdmin: false,
            isOwner: false,
            adminPin: "",
            temporaryUntil: temporary
              ? todayDateKey()
              : null,
          },
        ];
      });

      setLoginRequests((previous) =>
        previous.filter(
          (item) => item.id !== requestId
        )
      );

      return true;
    },
    [loginRequests]
  );

  const dismissAccessRequest = useCallback(
    (requestId) => {
      setLoginRequests((previous) =>
        previous.filter(
          (item) => item.id !== requestId
        )
      );
    },
    []
  );

  /* ==========================================================
   * MENU
   * ========================================================== */
  const updateMenuDay = useCallback(
    (day, updatedDay) => {
      setMenu((previous) => ({
        ...previous,
        [day]: updatedDay,
      }));
    },
    []
  );

  /* ==========================================================
   * ORDERS
   * ========================================================== */
  const submitOrder = useCallback(
    (employeeName, order) => {
      const dateKey = todayDateKey();

      setOrders((previous) => ({
        ...previous,
        [dateKey]: {
          ...(previous[dateKey] || {}),
          [employeeName]: {
            ...order,
            employeeName,
            submittedAt: new Date().toLocaleTimeString("en-GB"),
            approved: false,
          },
        },
      }));
    },
    []
  );

  const approveAllToday = useCallback(() => {
    const dateKey = todayDateKey();

    setOrders((previous) => {
      const todays = previous[dateKey] || {};

      const approved = Object.fromEntries(
        Object.entries(todays).map(([name, order]) => [
          name,
          {
            ...order,
            approved: true,
          },
        ])
      );

      return {
        ...previous,
        [dateKey]: approved,
      };
    });
  }, []);

  const todaysOrders = orders[todayDateKey()] || {};

  /* ==========================================================
   * FOOD LIMITS
   * ========================================================== */
  const standards = useMemo(() => {
    const today = menu[todayWeekday()];

    return {
      bowl1: 1,
      bowl2: 1,
      bread: Number(today?.bread?.baseQty) || 4,
      rice: 1,
      extra: 1,
      salad: 1,
    };
  }, [menu]);

  /* ==========================================================
   * TOTAL SURPLUS CREATED BY PEOPLE WHO ORDERED LESS
   * ========================================================== */
  const totalSurplus = useMemo(() => {
    const result = {
      bowl1: 0,
      bowl2: 0,
      bread: 0,
      rice: 0,
      extra: 0,
      salad: 0,
    };

    Object.values(todaysOrders).forEach((order) => {
      Object.keys(result).forEach((key) => {
        const standard = Number(standards[key] || 0);
        const ordered = Number(order?.[key]?.qty || 0);

        // Only the unused normal allowance creates surplus.
        result[key] += Math.max(0, standard - ordered);
      });
    });

    return result;
  }, [todaysOrders, standards]);

  /* ==========================================================
   * REMAINING SURPLUS
   * ========================================================== */
  const surplusAvailability = useMemo(() => {
    const dateKey = todayDateKey();
    const claimsForToday = surplusClaims[dateKey] || {};

    const claimedTotals = {
      bowl1: 0,
      bowl2: 0,
      bread: 0,
      rice: 0,
      extra: 0,
      salad: 0,
    };

    Object.values(claimsForToday).forEach((employeeClaims) => {
      /*
       * New format is nested by employee.
       * If an old flat format is still present, support it
       * for availability calculation so the UI does not break.
       */
      if (
        employeeClaims &&
        typeof employeeClaims === "object"
      ) {
        Object.keys(claimedTotals).forEach((key) => {
          claimedTotals[key] += Number(
            employeeClaims[key] || 0
          );
        });
      }
    });

    // Also support legacy flat format: { bowl1: 1, ... }
    Object.keys(claimedTotals).forEach((key) => {
      if (typeof claimsForToday[key] === "number") {
        claimedTotals[key] += Number(claimsForToday[key] || 0);
      }
    });

    return Object.fromEntries(
      Object.keys(totalSurplus).map((key) => [
        key,
        Math.max(
          0,
          Number(totalSurplus[key] || 0) -
            Number(claimedTotals[key] || 0)
        ),
      ])
    );
  }, [totalSurplus, surplusClaims]);

  /* ==========================================================
   * CLAIM ONE SURPLUS PORTION
   * ========================================================== */
  const claimSurplus = useCallback(
    (employeeName, key) => {
      const dateKey = todayDateKey();
      const available = Number(
        surplusAvailability[key] || 0
      );

      if (!employeeName || available <= 0) {
        return false;
      }

      setSurplusClaims((previous) => {
        const previousToday = previous[dateKey] || {};

        const todayClaims = {
          ...previousToday,
        };

        const employeeClaims = {
          ...(todayClaims[employeeName] || {}),
        };

        employeeClaims[key] =
          Number(employeeClaims[key] || 0) + 1;

        todayClaims[employeeName] = employeeClaims;

        return {
          ...previous,
          [dateKey]: todayClaims,
        };
      });

      return true;
    },
    [surplusAvailability]
  );

  /* ==========================================================
   * RELEASE ONE SURPLUS PORTION
   * ========================================================== */
  const releaseSurplus = useCallback(
    (employeeName, key) => {
      const dateKey = todayDateKey();

      setSurplusClaims((previous) => {
        const previousToday = previous[dateKey] || {};
        const employeeClaims = {
          ...(previousToday[employeeName] || {}),
        };

        const current = Number(
          employeeClaims[key] || 0
        );

        if (current <= 0) {
          return previous;
        }

        if (current === 1) {
          delete employeeClaims[key];
        } else {
          employeeClaims[key] = current - 1;
        }

        const todayClaims = {
          ...previousToday,
        };

        if (Object.keys(employeeClaims).length === 0) {
          delete todayClaims[employeeName];
        } else {
          todayClaims[employeeName] = employeeClaims;
        }

        return {
          ...previous,
          [dateKey]: todayClaims,
        };
      });

      return true;
    },
    []
  );

  /* ==========================================================
   * CROSS-TAB SYNC
   * ========================================================== */
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === LS_KEYS.orders) {
        setOrders(loadLS(LS_KEYS.orders, {}));
      }

      if (event.key === LS_KEYS.surplusClaims) {
        setSurplusClaims(
          loadLS(LS_KEYS.surplusClaims, {})
        );
      }

      if (event.key === LS_KEYS.menu) {
        setMenu(loadLS(LS_KEYS.menu, DEFAULT_MENU));
      }

      if (event.key === LS_KEYS.employees) {
        setEmployees(
          normalizeStoredEmployees(
            loadLS(LS_KEYS.employees, null)
          )
        );
      }

      if (event.key === LS_KEYS.loginRequests) {
        setLoginRequests(
          loadLS(LS_KEYS.loginRequests, [])
        );
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const value = {
    employees,
    menu,
    orders,
    todaysOrders,
    theme,
    currentUser,
    standards,
    surplusAvailability,
    loginRequests,

    toggleTheme,
    login,
    logout,

    addEmployee,
    removeEmployee,
    toggleAdmin,
    setAdminPin,

    approveAccessRequest,
    dismissAccessRequest,

    updateMenuDay,

    submitOrder,
    approveAllToday,

    claimSurplus,
    releaseSurplus,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used within AppProvider"
    );
  }

  return context;
}