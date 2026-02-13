import type { ReactNode } from "react";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import SegmentsPage from "@/features/segments/pages/SegmentsPage";
import CampaignsPage from "@/features/campaigns/pages/CampaignsPage";
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
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
    element: <DashboardPage />,
    access: {},
  },
  {
    path: "/segments",
    navLabel: "Segments",
    element: <SegmentsPage />,
    access: { anyOf: ["segments:read"] },
  },
  {
    path: "/campaigns",
    navLabel: "Campaigns",
    element: <CampaignsPage />,
    access: { anyOf: ["campaigns:read"] },
  },
  {
    path: "/analytics",
    navLabel: "Analytics",
    element: <AnalyticsPage />,
    access: { anyOf: ["analytics:read"] },
  },
  {
    path: "/settings",
    navLabel: "Settings",
    element: <SettingsPage />,
    access: { anyOf: ["settings:read"] },
  },
];
