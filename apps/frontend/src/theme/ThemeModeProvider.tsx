// src/theme/ThemeModeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Mode = "light" | "dark";
const STORAGE_KEY = "app.mode";

function getInitialMode(): Mode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyMode(mode: Mode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  localStorage.setItem(STORAGE_KEY, mode);
}

type Ctx = { mode: Mode; setMode: (m: Mode) => void; toggle: () => void };
const ThemeModeContext = createContext<Ctx | null>(null);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => getInitialMode());

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  const value = useMemo<Ctx>(
    () => ({ mode, setMode, toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")) }),
    [mode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
}
