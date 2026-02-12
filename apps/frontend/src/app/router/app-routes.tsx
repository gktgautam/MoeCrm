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
    access: {},
  },
  {
    path: "/segments",
    navLabel: "Segments",
    element: <SegmentsList />,
    access: { anyOf: ["segments:read"] },
  },
  {
    path: "/campaigns",
    navLabel: "Campaigns",
    element: <CampaignsList />,
    access: { anyOf: ["campaigns:read"] },
  },
  {
    path: "/analytics",
    navLabel: "Analytics",
    element: <AnalyticsOverview />,
    access: { anyOf: ["reports:read"] },
  },
  {
    path: "/settings",
    navLabel: "Settings",
    element: <SettingsHome />,
    access: { anyOf: ["settings:read"] },
  },
];
