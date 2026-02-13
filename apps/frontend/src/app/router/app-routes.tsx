import type { ReactNode } from "react";
import DashboardHome from "@/domains/dashboard/pages/DashboardHome";
import SegmentsList from "@/domains/segments/pages/SegmentsList";
import CampaignsList from "@/domains/campaigns/pages/CampaignsList";
import AnalyticsOverview from "@/domains/analytics/pages/AnalyticsOverview";
import SettingsHome from "@/domains/settings/pages/SettingsHome";

export type AppRoute = {
  path: string;
  element: ReactNode;
  navLabel?: string;
};

export const APP_ROUTES: AppRoute[] = [
  {
    path: "/",
    navLabel: "Dashboard",
    element: <DashboardHome />,
  },
  {
    path: "/segments",
    navLabel: "Segments",
    element: <SegmentsList />,
  },
  {
    path: "/campaigns",
    navLabel: "Campaigns",
    element: <CampaignsList />,
  },
  {
    path: "/analytics",
    navLabel: "Analytics",
    element: <AnalyticsOverview />,
  },
  {
    path: "/settings",
    navLabel: "Settings",
    element: <SettingsHome />,
  },
];
