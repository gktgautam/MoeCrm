// src/app/layouts/AppShell.tsx
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { useAuth } from "@/auth";

export default function AppShell() {
  const { state, logout } = useAuth();

  const name =
    state.status === "authed"
      ? [state.user.firstName, state.user.lastName].filter(Boolean).join(" ") ||
        state.user.email
      : undefined;

  const allowedRoutes =
    state.status === "authed" ? state.allowedRoutes : [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar allowedRoutes={allowedRoutes}   />

        <div className="flex flex-col flex-1">
         
          <header className="flex items-center h-16 border-b bg-background px-4">
            <SidebarTrigger />
            <h1 className="ml-4 font-semibold">EqueEngage</h1>

            <div className="flex items-center gap-3 ml-auto mr-5">
              <span className="text-sm">{name}</span>
              <button
                onClick={logout}
                className="text-red-600 text-sm"
              >
                Logout
              </button>
              <ThemeToggle />
            </div>
          </header>

          <main className="p-4 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
