import DashboardHome from "@/features/dashboard/pages/DashboardHome";
import type { AppRoute } from "@/app/router";
import { LayoutDashboard } from "lucide-react";

export const DASHBOARD_ROUTES: AppRoute[] = [
  {
    path: "/",
    navLabel: "Dashboard",
    anyOf: ["analytics:read", "campaigns:read", "segments:read", "users:read", "settings:read"],
    element: <DashboardHome />,
    icon: LayoutDashboard
  },
];
