import DashboardHome from "@/features/dashboard/pages/DashboardHome";
import type { AppRoute } from "@/app/router/route.types";

export const DASHBOARD_ROUTES: AppRoute[] = [
  {
    path: "/",
    navLabel: "Dashboard",
    anyOf: ["analytics:read", "campaigns:read", "segments:read", "users:read", "settings:read"],
    element: <DashboardHome />,
  },
];
