// src/app/layouts/AppShell.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/app/layouts/Sidebar";
import Topbar from "@/app/layouts/Topbar";
import { useAuth } from "@/features/auth";

export default function AppShell() {
  const { state, logout } = useAuth();

  const name = state.status === "authed"
      ? [state.user.firstName, state.user.lastName].filter(Boolean).join(" ") || state.user.email
      : undefined;

  const allowedRoutes = state.status === "authed" ? state.allowedRoutes : [];

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar allowedRoutes={allowedRoutes} />
      <div className="flex-1 flex flex-col">
        <Topbar name={name} onLogout={state.status === "authed" ? () => void logout() : undefined} />
        <main className="p-4 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
