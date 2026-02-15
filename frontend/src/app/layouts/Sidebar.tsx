import { NavLink } from "react-router-dom";
import { NAV, type NavItem } from "@/app/layouts/navigation";

function NavItemComponent({ item }: { item: NavItem }) {
  return (
    <div>
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          [
            "block rounded px-3 py-2 text-sm font-medium",
            isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
          ].join(" ")
        }
      >
        {item.label}
      </NavLink>

      {item.children && (
        <div className="ml-4 mt-1 space-y-1">
          {item.children.map((child) => (
            <NavItemComponent key={child.to} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ allowedRoutes }: { allowedRoutes: string[] }) {
  // Filter parents AND children based on allowed permissions
  const filterNav = (items: NavItem[]): NavItem[] =>
    items
      .filter((item) => allowedRoutes.includes(item.to))
      .map((item) => ({
        ...item,
        children: item.children ? filterNav(item.children) : undefined
      }));

  const nav = filterNav(NAV);

  return (
    <aside className="w-56 border-r bg-white p-4">
      <nav className="space-y-1">
        {nav.map((item) => (
          <NavItemComponent key={item.to} item={item} />
        ))}
      </nav>
    </aside>
  );
}
