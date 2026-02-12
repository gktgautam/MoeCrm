import { NavLink } from "react-router-dom";
import { APP_ROUTES } from "@/app/router/route-config";
import { NAV } from "./nav";
import { useAuth } from "@/features/auth/useAuth";
import { canAccess } from "@/features/auth/access-control";

const ROUTE_ACCESS_BY_PATH = new Map(APP_ROUTES.map((route) => [route.path, route.access]));

export default function Sidebar() {
  const { state } = useAuth();

  if (state.status !== "authed") return null;

  const authSnapshot = {
    status: "authed" as const,
    role: state.user.role,
    permissions: state.permissions,
  };

  return (
    <aside className="w-56 border-r bg-white p-4">
      <nav className="space-y-1">
        {NAV.filter((item) => canAccess(authSnapshot, ROUTE_ACCESS_BY_PATH.get(item.to))).map((item) => (
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
