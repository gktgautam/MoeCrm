import type { AppRoute } from "@/app/router/route.types";
import { ANALYTICS_ROUTES } from "@/features/analytics";
import { CAMPAIGNS_ROUTES } from "@/features/campaigns";
import { DASHBOARD_ROUTES } from "@/features/dashboard";
import { SEGMENTS_ROUTES } from "@/features/segments";
import { SETTINGS_ROUTES } from "@/features/settings";

const defineFeatureRoutes = (routes: AppRoute[]) => {
  const seenPath = new Set<string>();

  for (const route of routes) {
    if (seenPath.has(route.path)) {
      throw new Error(`Duplicate frontend route path: ${route.path}`);
    }
    seenPath.add(route.path);
  }

  return routes;
};

export const FEATURE_ROUTES = defineFeatureRoutes([
  ...DASHBOARD_ROUTES,
  ...SEGMENTS_ROUTES,
  ...CAMPAIGNS_ROUTES,
  ...ANALYTICS_ROUTES,
  ...SETTINGS_ROUTES,
]);
