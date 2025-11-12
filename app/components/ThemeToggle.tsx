"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="fixed bottom-4 right-4 z-50 p-3 bg-yellow-500 text-white rounded-full shadow-lg opacity-0 pointer-events-none"
        aria-label="Toggle theme"
        disabled
      >
        <Moon size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-50 p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
      aria-label="Toggle theme"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

