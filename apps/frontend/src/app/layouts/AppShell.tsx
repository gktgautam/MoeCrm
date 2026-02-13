// src/app/layouts/AppShell.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/shared/navigation/Sidebar";
import Topbar from "@/shared/navigation/Topbar";

export default function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-4 flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
