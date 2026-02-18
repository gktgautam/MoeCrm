// src/theme/ThemeToggle.tsx
import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mode, setMode] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const isDark = mode === "dark";

  const toggleTheme = () => {
    const newMode = isDark ? "light" : "dark";
    setMode(newMode);

    if (newMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      {/* Tooltip */}
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded bg-gray-800 text-white opacity-0 pointer-events-none transition-opacity group-hover:opacity-100">
        {isDark ? "Light mode" : "Dark mode"}
      </span>

      {isDark ? (
        <Sun className="w-4 h-4 text-yellow-400" />
      ) : (
        <Moon className="w-4 h-4 text-gray-800" />
      )}
    </button>
  );
}
