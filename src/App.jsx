import React from "react";

import { useApp } from "./context/AppContext.jsx";

import { ToastProvider } from "./components/Toast.jsx";

import Login from "./pages/Login.jsx";
import EmployeePortal from "./pages/EmployeePortal.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function Screen() {
  const {
    currentUser,
    currentPage,
  } = useApp();

  if (!currentUser || currentPage === "login") {
    return <Login />;
  }

  if (
    currentUser.isAdmin &&
    currentPage === "admin"
  ) {
    return <AdminDashboard />;
  }

  if (
    currentUser.isAdmin &&
    currentPage === "admin-lunch"
  ) {
    return (
      <EmployeePortal
        adminBooking
      />
    );
  }

  if (
    currentUser &&
    currentPage === "employee"
  ) {
    return <EmployeePortal />;
  }

  // Safety fallback for older/corrupted localStorage.
  return currentUser.isAdmin
    ? <AdminDashboard />
    : <EmployeePortal />;
}

export default function App() {
  return (
    <ToastProvider>
      <Screen />
    </ToastProvider>
  );
}
