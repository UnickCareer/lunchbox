import React from "react";

import { useApp } from "./context/AppContext.jsx";

import { ToastProvider } from "./components/Toast.jsx";

import Login from "./pages/Login.jsx";
import EmployeePortal from "./pages/EmployeePortal.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function Screen() {
  const { currentUser } = useApp();

  if (currentUser?.isAdmin) {
    return <AdminDashboard />;
  }

  if (currentUser) {
    return <EmployeePortal />;
  }

  return <Login />;
}

export default function App() {
  return (
    <ToastProvider>
      <Screen />
    </ToastProvider>
  );
}