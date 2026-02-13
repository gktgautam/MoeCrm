import { ANALYTICS_ROUTES } from "@/features/analytics/analytics.routes";
import { CAMPAIGNS_ROUTES } from "@/features/campaigns/campaigns.routes";
import { DASHBOARD_ROUTES } from "@/features/dashboard/dashboard.routes";
import { SEGMENTS_ROUTES } from "@/features/segments/segments.routes";
import { SETTINGS_ROUTES } from "@/features/settings/settings.routes";
import type { AppRoute } from "@/app/router/route.types";

export const FEATURE_ROUTES: AppRoute[] = [
  ...DASHBOARD_ROUTES,
  ...SEGMENTS_ROUTES,
  ...CAMPAIGNS_ROUTES,
  ...ANALYTICS_ROUTES,
  ...SETTINGS_ROUTES,
];
