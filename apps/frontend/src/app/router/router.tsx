import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/app/layouts/AuthLayout";
import AppShell from "@/app/layouts/AppShell";

import ProtectedRoute from "@/domains/auth/ProtectedRoute";
import LoginPage from "@/domains/auth/pages/LoginPage";

import NotFound from "@/app/pages/NotFound";
import Unauthorized from "@/app/pages/Unauthorized";
import { APP_ROUTES } from "./app-routes";

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
          element: <ProtectedRoute path={route.path} />,
          children: [{ index: true, element: route.element }],
        })),
      },
    ],
  },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "*", element: <NotFound /> },
]);
