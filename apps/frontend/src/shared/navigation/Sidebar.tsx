import { NavLink } from "react-router-dom";
import { NAV } from "@/shared/navigation/nav";
import { useAuth } from "@/features/auth/useAuth";

export default function Sidebar() {
  const { state } = useAuth();

  if (state.status !== "authed") return null;

  return (
    <aside className="w-56 border-r bg-white p-4">
      <nav className="space-y-1">
        {NAV.filter((item) => state.allowedRoutes.includes(item.to)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "block rounded px-3 py-2 text-sm",
                isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
