import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { NAV, type NavItem } from "@/app/layouts/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function Sidebar({ allowedRoutes }: { allowedRoutes: string[] }) {
  const [open, setOpen] = useState(true);
  const toggleSidebar = () => setOpen((v) => !v);

  // type-guard to remove null values safely
  const isNavItem = (x: NavItem | null): x is NavItem => x !== null;

  // Keep item if:
  // - its own route is allowed OR
  // - it has any allowed descendants
  const filterNav = (items: NavItem[]): NavItem[] =>
    items
      .map((item): NavItem | null => {
        const filteredChildren = item.children ? filterNav(item.children) : undefined;

        const isAllowedSelf = allowedRoutes.includes(item.to);
        const hasAllowedChildren = !!filteredChildren?.length;

        if (!isAllowedSelf && !hasAllowedChildren) return null;

        return {
          ...item,
          children: hasAllowedChildren ? filteredChildren : undefined,
        };
      })
      .filter(isNavItem);

  const nav = useMemo(() => filterNav(NAV), [allowedRoutes]);

  function RenderIcon({ icon }: { icon: unknown }) {
    if (!icon) return null;

    // icon: <SomeIcon />
    if (React.isValidElement(icon)) {
      return <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>;
    }

    // icon: SomeIcon (component reference)
    const IconComponent = icon as React.ElementType;
    return <IconComponent className="h-4 w-4 shrink-0" />;
  }

  function NavItemComponent({ item }: { item: NavItem }) {
    return (
      <div>
        <NavLink
          to={item.to}
          className={({ isActive }) =>
            [
              "flex items-center gap-2 rounded px-3 py-2 text-sm font-medium",
              open ? "justify-start" : "justify-center",
              isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
            ].join(" ")
          }
          title={!open ? item.label : undefined}
        >
          {item.icon && <RenderIcon icon={(item as any).icon} />}
          {open && <span className="truncate">{item.label}</span>}
        </NavLink>

        {item.children && (
          <div className={["mt-1 space-y-1", open ? "ml-4" : "ml-0"].join(" ")}>
            {item.children.map((child) => (
              <NavItemComponent key={child.to} item={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside
      className={[
        "border-r bg-white p-4 relative select-none transition-[width] duration-300 hidden md:block",
        open ? "w-60" : "w-16",
      ].join(" ")}
    >
      <div
        className={[
          "fixed left-0 top-0 h-full transition-[width] duration-300 bg-white border-r",
          open ? "w-60" : "w-16",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center px-4 py-4 border-b border-white/20",
            open ? "justify-between" : "justify-center",
          ].join(" ")}
        >
          {open && (
            <div className="flex items-center gap-2">
              <img src="/images/equentis_logo.svg" alt="Logo" className="h-8 w-auto" />
            </div>
          )}

          <button onClick={toggleSidebar} className="rounded-full p-2 hover:bg-gray-100">
            {open ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {nav.map((item) => (
            <NavItemComponent key={item.to} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
