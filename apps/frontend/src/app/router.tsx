import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "@/auth/ProtectedRoute";

import LoginPage from "@/pages/auth/LoginPage";
import JobsPage from "@/pages/dashboard/JobsPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />, // wrapper for auth
    children: [
      {
        element: <DashboardLayout />, // layout for dashboard
        children: [
          { path: "/jobs", element: <JobsPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
