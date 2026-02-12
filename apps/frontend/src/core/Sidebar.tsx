// src/core/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { NAV } from "./nav";
import { useAuth } from "@/features/auth/AuthProvider";

export default function Sidebar() {
  const { state } = useAuth();
  const role = state.status === "authed" ? state.user.role : null;

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 space-y-3">
      <div className="font-bold text-lg mb-4">EqueEngage</div>

      {NAV.filter((i) => (role ? i.roles.includes(role) : false)).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `block px-3 py-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
