// src/app/layouts/AppShell.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/app/layouts/Sidebar";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { useAuth } from "@/auth";
import { useState } from "react";

export default function AppShell() {
  const { state, logout } = useAuth();

  const name = state.status === "authed"
      ? [state.user.firstName, state.user.lastName].filter(Boolean).join(" ") || state.user.email
      : undefined;

  const allowedRoutes = state.status === "authed" ? state.allowedRoutes : [];

   const [sideBarOpen, setSideBarOpen] = useState(true);

 

  return (
    <div className="flex min-h-screen bg-bg text-text">
      
      <Sidebar allowedRoutes={allowedRoutes} onToggle={setSideBarOpen} />
     
      <div className={`flex-1 flex flex-col pt-15 relative transition-all duration-300 ${sideBarOpen ? "pl-60" : "pl-20"}`}>

          <header className={`fixed top-0 right-0 transition-all duration-300 ${sideBarOpen ? "left-60" : "left-20"} h-15 border-b border-border bg-surface backdrop-blur p-4 flex items-center justify-between`}>
            <h1 className="font-semibold">EqueEngage</h1>

             <div className="flex items-center gap-3 mr-5 ml-auto">
                <span className="text-sm">{name}</span>
                <button onClick={logout} className="text-red-600 text-sm">
                  Logout
                </button>
              </div>

            <ThemeToggle />
          </header>

         <main className="px-4 flex-1 overflow-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
