import type { ReactNode } from "react";
import DashboardHome from "@/features/dashboard/pages/DashboardHome";
import SegmentsList from "@/features/segments/pages/SegmentsList";
import CampaignsList from "@/features/campaigns/pages/CampaignsList";
import AnalyticsOverview from "@/features/analytics/pages/AnalyticsOverview";
import SettingsHome from "@/features/settings/pages/SettingsHome";

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
