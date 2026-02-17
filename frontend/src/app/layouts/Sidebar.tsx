import { NavLink } from "react-router-dom";
import { NAV, type NavItem } from "@/app/layouts/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";


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

// const navItems = [
//   { path: "/", icon: LayoutDashboard, label: "Dashboard" },
//   { path: "/segments", icon: Users, label: "Segments" },
//   { path: "/campaigns", icon: Mail, label: "Campaigns" },
//   { path: "/templates", icon: FileText, label: "Templates" },
//   { path: "/analytics", icon: BarChart3, label: "Analytics" },
//   { path: "/products", icon: Package, label: "Products" },
//   { path: "/settings", icon: Settings, label: "Settings" },
// ];


  // Filter parents AND children based on allowed permissions
  const filterNav = (items: NavItem[]): NavItem[] =>
    items
      .filter((item) => allowedRoutes.includes(item.to))
      .map((item) => ({
        ...item,
        children: item.children ? filterNav(item.children) : undefined
      }));

  const nav = filterNav(NAV);

  const [open, setOpen] = useState<boolean>(true) 
  const toggleSidebar = () => setOpen((v) => !v)

 


  return (
    <aside className={`border-r bg-white p-4 relative select-none transition-[width] duration-300 hidden md:block ${open ? 'w-60' : 'w-16'}`}>
           <div className={`fixed left-0 h-full transition-[width] duration-300 ${open ? 'w-60' : 'w-16'}`}>

           
            <div className={`flex items-center ${open ? 'justify-between' : 'justify-center'} px-4 py-4 border-b border-white/20`}>
                {open && (
                <div className="flex items-center gap-2">
                    <img src="/images/equentis_logo.svg" alt="Logo" className="h-8 w-auto" />
                </div>
                )}
                <button onClick={toggleSidebar} className="rounded-full p-2 hover:bg-white/10">
                {open ? <ChevronLeft className="h-5 w-5"/> : <ChevronRight className="h-5 w-5"/>}
                </button>
            </div>

              <nav className="space-y-1">
                {nav.map((item) => (
                  <NavItemComponent key={item.to} item={item} />
                ))}
              </nav>
      </div>
    </aside>
  );
}
