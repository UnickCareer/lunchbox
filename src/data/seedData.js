// Editable seed data — becomes the initial LocalStorage state on first run.

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Menu keyed by weekday name.
export const DEFAULT_MENU = {
  Monday: {
    dry: "Gobi Matar",
    gravy: "Rajma",
    bread: { name: "Butter Chapati", baseQty: 4 },
    rice: "Rice",
    extra: { name: "Gulab Jamun", type: "Sweet" },
    salad: "Salad",
  },

  Tuesday: {
    dry: "Mix Veg",
    gravy: "Chole",
    bread: { name: "Butter Chapati", baseQty: 4 },
    rice: "Rice",
    extra: { name: "Raita", type: "Raita" },
    salad: "Salad",
  },

  Wednesday: {
    dry: "Aloo Jeera",
    gravy: "Kadhi Pakora",
    bread: { name: "Butter Chapati", baseQty: 4 },
    rice: "Rice",
    extra: { name: "Raita", type: "Raita" },
    salad: "Salad",
  },

  Thursday: {
    dry: "Bhindi Masala",
    gravy: "Dal Makhni",
    bread: { name: "Butter Chapati", baseQty: 4 },
    rice: "Rice",
    extra: { name: "Raita", type: "Raita" },
    salad: "Salad",
  },

  Friday: {
    dry: "Mix Veg",
    gravy: "Paneer Butter Masala",
    bread: { name: "Butter Chapati", baseQty: 4 },
    rice: "Rice",
    extra: { name: "Kheer", type: "Sweet" },
    salad: "Salad",
  },

  Saturday: {
    dry: "Kaale Chane Sookhe",
    gravy: "Aloo Matar",
    bread: { name: "Poori", baseQty: 5 },
    rice: "Rice",
    extra: { name: "Raita", type: "Raita" },
    salad: "Salad",
  },
};

/*
 * Name-based access.
 *
 * Owner:
 * Mohit
 *
 * Admin / HR:
 * Naveen HR
 *
 * Employees:
 * Tanish
 * Sunny
 * Ankush
 * Shiv
 * Aman
 * Naveen
 * Akash
 * Uncle
 * Rajeev
 * Pankaj Saini
 * Sumit
 *
 * IMPORTANT:
 * adminPin is frontend-only protection.
 * This is NOT real backend security.
 */
export const DEFAULT_EMPLOYEES = [
  {
    name: "Mohit",
    role: "owner",
    isAdmin: true,
    isOwner: true,
    adminPin: "0990",
  },

  {
    name: "Naveen HR",
    role: "admin",
    isAdmin: true,
    isOwner: false,
    adminPin: "0880",
  },

  {
    name: "Tanish",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Sunny",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Ankush",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Shiv",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Aman",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Naveen",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Akash",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Uncle",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Rajeev",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Pankaj Saini",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },

  {
    name: "Sumit",
    role: "employee",
    isAdmin: false,
    isOwner: false,
  },
];