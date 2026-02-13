import type { ReactNode } from "react";
import DashboardHome from "@/features/dashboard/pages/DashboardHome";
import SegmentsList from "@/features/segments/pages/SegmentsList";
import CampaignsList from "@/features/campaigns/pages/CampaignsList";
import AnalyticsOverview from "@/features/analytics/pages/AnalyticsOverview";
import SettingsHome from "@/features/settings/pages/SettingsHome";
import type { AccessRule } from "@/features/auth/access-control";

export type AppRoute = {
  path: string;
  element: ReactNode;
  navLabel?: string;
  access: AccessRule;
};

export const APP_ROUTES: AppRoute[] = [
  {
    path: "/",
    navLabel: "Dashboard",
    element: <DashboardHome />,
    access: { roles: ["admin", "marketer", "analyst", "developer", "viewer", "support"] },
  },
  {
    path: "/segments",
    navLabel: "Segments",
    element: <SegmentsList />,
    access: { roles: ["admin", "marketer"], anyOf: ["segments:read"] },
  },
  {
    path: "/campaigns",
    navLabel: "Campaigns",
    element: <CampaignsList />,
    access: { roles: ["admin", "marketer", "support"], anyOf: ["campaigns:read"] },
  },
  {
    path: "/analytics",
    navLabel: "Analytics",
    element: <AnalyticsOverview />,
    access: { roles: ["admin", "marketer", "analyst", "viewer"], anyOf: ["analytics:read"] },
  },
  {
    path: "/settings",
    navLabel: "Settings",
    element: <SettingsHome />,
    access: { roles: ["admin"], anyOf: ["settings:read"] },
  },
];
