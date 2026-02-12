// src/app/router/routes.tsx
import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/app/layouts/AuthLayout";
import AppShell from "@/app/layouts/AppShell";

import ProtectedRoute from "@/features/auth/ProtectedRoute";
import LoginPage from "@/features/auth/pages/LoginPage";

import DashboardHome from "@/features/dashboard/pages/DashboardHome";
import SegmentsList from "@/features/segments/pages/SegmentsList";
import CampaignsList from "@/features/campaigns/pages/CampaignsList";
import AnalyticsOverview from "@/features/analytics/pages/AnalyticsOverview";
import SettingsHome from "@/features/settings/pages/SettingsHome";

import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardHome /> },
          { path: "/segments", element: <SegmentsList /> },
          { path: "/campaigns", element: <CampaignsList /> },
          { path: "/analytics", element: <AnalyticsOverview /> },
          { path: "/settings", element: <SettingsHome /> },
        ],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
]);
