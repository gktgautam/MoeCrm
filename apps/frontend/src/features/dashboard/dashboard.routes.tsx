import DashboardHome from "@/features/dashboard/pages/DashboardHome";
import type { AppRoute } from "@/app/router/route.types";

export const DASHBOARD_ROUTES: AppRoute[] = [
  {
    path: "/",
    navLabel: "Dashboard",
    element: <DashboardHome />,
  },
];
