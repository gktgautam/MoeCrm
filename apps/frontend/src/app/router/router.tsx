import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/app/layouts/AuthLayout";
import AppShell from "@/app/layouts/AppShell";

import ProtectedRoute from "@/features/auth/ProtectedRoute";
import LoginPage from "@/features/auth/pages/LoginPage";

import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import { APP_ROUTES } from "./route-config";

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
        children: APP_ROUTES.map((route) => ({
          path: route.path,
          element: <ProtectedRoute access={route.access} />,
          children: [{ index: true, element: route.element }],
        })),
      },
    ],
  },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "*", element: <NotFound /> },
]);
