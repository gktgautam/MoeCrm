import AnalyticsOverview from "@/features/analytics/pages/AnalyticsOverview";
import type { AppRoute } from "@/app/router";
import { BarChart3 } from "lucide-react";

 
export const ANALYTICS_ROUTES: AppRoute[] = [
  {
    path: "/analytics",
    navLabel: "Analytics",
    anyOf: ["analytics:read"],
    element: <AnalyticsOverview />,
    icon: BarChart3
  },
];
