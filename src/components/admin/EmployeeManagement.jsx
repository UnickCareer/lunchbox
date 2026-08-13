import React, {
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  UserPlus,
  Trash2,
  ShieldCheck,
  Crown,
  KeyRound,
} from "lucide-react";

import { useApp } from "../../context/AppContext.jsx";

import { useToast } from "../Toast.jsx";

import {
  isValidName,
} from "../../utils/validation.js";

export default function EmployeeManagement() {
  const {
    employees,
    addEmployee,
    removeEmployee,
    toggleAdmin,
    setAdminPin,
  } = useApp();

  const toast =
    useToast();

  const [
    newName,
    setNewName,
  ] = useState("");

  const [
    newAdmin,
    setNewAdmin,
  ] = useState(false);

  const [
    newPin,
    setNewPin,
  ] = useState("");

  const handleAdd =
    (e) => {
      e.preventDefault();

      if (
        !isValidName(
          newName
        )
      ) {
        toast(
          "Enter a valid employee name",
          "error"
        );

        return;
      }

      const exists =
        employees.some(
          (employee) =>
            employee.name.toLowerCase() ===
            newName
              .trim()
              .toLowerCase()
        );

      if (exists) {
        toast(
          "That employee already exists",
          "error"
        );

        return;
      }

      if (
        newAdmin &&
        newPin.length < 4
      ) {
        toast(
          "Admin PIN must be at least 4 digits",
          "error"
        );

        return;
      }

      addEmployee(
        newName,
        newAdmin,
        newPin
      );

      toast(
        `${newName.trim()} added successfully`,
        "success"
      );

      setNewName("");
      setNewAdmin(false);
      setNewPin("");
    };

  const handleToggle =
    (employee) => {
      if (
        employee.isOwner
      ) {
        toast(
          "Mohit is the permanent Owner and cannot be changed",
          "info"
        );

        return;
      }

      toggleAdmin(
        employee.name
      );

      toast(
        employee.isAdmin
          ? `${employee.name} is now an employee`
          : `${employee.name} is now an Admin / HR`,
        "success"
      );
    };

  const handlePin =
    (employee) => {
      if (
        employee.isOwner ||
        employee.isAdmin
      ) {
        const pin =
          window.prompt(
            `Enter new PIN for ${employee.name}`
          );

        if (
          !pin ||
          pin.length < 4
        ) {
          return;
        }

        setAdminPin(
          employee.name,
          pin
        );

        toast(
          `${employee.name}'s admin PIN updated`,
          "success"
        );
      }
    };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAdd}
        className="glass rounded-2xl p-5 space-y-4"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500 dark:text-cream-50/50">
            Add Employee / Admin
          </p>

          <p className="text-sm text-ink-500 dark:text-cream-50/60 mt-1">
            Add a new person by name. You can
            promote them to Admin / HR later.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs text-ink-500 dark:text-cream-50/50">
              Employee Name
            </label>

            <input
              value={newName}
              onChange={(e) =>
                setNewName(
                  e.target.value
                )
              }
              placeholder="e.g. Raj"
              className="input-field mt-2"
            />
          </div>

          <label className="flex items-center gap-2 h-12 px-4 rounded-xl glass cursor-pointer">
            <input
              type="checkbox"
              checked={
                newAdmin
              }
              onChange={(e) =>
                setNewAdmin(
                  e.target.checked
                )
              }
              className="accent-emerald-500"
            />

            <span className="text-sm font-medium">
              Admin / HR
            </span>
          </label>

          {newAdmin && (
            <div className="w-40">
              <label className="text-xs text-ink-500 dark:text-cream-50/50">
                Admin PIN
              </label>

              <input
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) =>
                  setNewPin(
                    e.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                      .slice(
                        0,
                        8
                      )
                  )
                }
                placeholder="PIN"
                className="input-field mt-2"
              />
            </div>
          )}

          <motion.button
            whileTap={{
              scale: 0.96,
            }}
            type="submit"
            className="btn-primary"
          >
            <UserPlus
              size={16}
            />

            Add
          </motion.button>
        </div>
      </form>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-900/10 dark:border-white/10">
          <h3 className="font-display text-lg font-semibold">
            Employee Access
          </h3>
        </div>

        <div className="divide-y divide-ink-900/5 dark:divide-white/5">
          <AnimatePresence>
            {employees.map(
              (employee) => (
                <motion.div
                  key={
                    employee.name
                  }
                  layout
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: -30,
                  }}
                  className="px-5 py-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        employee.isOwner
                          ? "bg-amber-400/20 text-amber-500"
                          : employee.isAdmin
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-ink-900/5 dark:bg-white/10 text-ink-500"
                      }`}
                    >
                      {employee.isOwner ? (
                        <Crown
                          size={17}
                        />
                      ) : employee.isAdmin ? (
                        <ShieldCheck
                          size={17}
                        />
                      ) : (
                        <span className="text-sm font-bold">
                          {employee.name
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {employee.name}
                      </p>

                      <p className="text-xs text-ink-500 dark:text-cream-50/50">
                        {employee.isOwner
                          ? "Owner"
                          : employee.isAdmin
                          ? "Admin / HR"
                          : "Employee"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(employee.isAdmin ||
                      employee.isOwner) && (
                      <button
                        onClick={() =>
                          handlePin(
                            employee
                          )
                        }
                        className="h-9 px-3 rounded-full glass inline-flex items-center gap-2 text-xs font-semibold"
                      >
                        <KeyRound
                          size={14}
                        />

                        PIN
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleToggle(
                          employee
                        )
                      }
                      disabled={
                        employee.isOwner
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${
                        employee.isOwner
                          ? "bg-amber-400/20 text-amber-600 dark:text-amber-400 cursor-not-allowed"
                          : employee.isAdmin
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-ink-900/5 dark:bg-white/10 text-ink-700 dark:text-cream-50/70"
                      }`}
                    >
                      <ShieldCheck
                        size={13}
                      />

                      {employee.isOwner
                        ? "Owner"
                        : employee.isAdmin
                        ? "Admin"
                        : "Employee"}
                    </button>

                    <button
                      disabled={
                        employee.isOwner
                      }
                      onClick={() => {
                        if (
                          employee.isOwner
                        ) {
                          return;
                        }

                        removeEmployee(
                          employee.name
                        );

                        toast(
                          `${employee.name} removed`,
                          "info"
                        );
                      }}
                      className="h-9 w-9 rounded-full inline-flex items-center justify-center text-red-400 hover:bg-red-400/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`Remove ${employee.name}`}
                    >
                      <Trash2
                        size={15}
                      />
                    </button>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}