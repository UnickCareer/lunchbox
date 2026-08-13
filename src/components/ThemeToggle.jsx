import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="relative h-10 w-[68px] rounded-full glass flex items-center px-1"
    >
      <motion.div
        className="absolute h-8 w-8 rounded-full bg-emerald-500 dark:bg-amber-400 flex items-center justify-center shadow-glow"
        animate={{ x: isDark ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={16} className="text-emerald-950" />
        ) : (
          <Sun size={16} className="text-emerald-950" />
        )}
      </motion.div>
    </button>
  );
}
