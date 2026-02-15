import AnalyticsOverview from "@/features/analytics/pages/AnalyticsOverview";
import type { AppRoute } from "@/app/router/route.types";

export const ANALYTICS_ROUTES: AppRoute[] = [
  {
    path: "/analytics",
    navLabel: "Analytics",
    anyOf: ["analytics:read"],
    element: <AnalyticsOverview />,
  },
];
