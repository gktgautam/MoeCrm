// src/core/layout/Topbar.tsx
import { ThemeToggle } from "@/theme/ThemeToggle";

export default function Topbar({
  name,
  onLogout,
}: {
  name?: string;
  onLogout?: () => void;
}) {
  return (
  <header className="sticky top-0 border-b border-border bg-surface/80 backdrop-blur p-4 flex items-center justify-between">
      <h1 className="font-semibold">EqueEngage</h1>

      {name && onLogout ? (
        <div className="flex items-center gap-3 mr-5 ml-auto">
          <span className="text-sm">{name}</span>
          <button onClick={onLogout} className="text-red-600 text-sm">
            Logout
          </button>
        </div>
      ) : null}

      <ThemeToggle />
    </header>
  );
}
