import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "@/app/layouts/AuthLayout";
import AppShell from "@/app/layouts/AppShell";

import RouteGuard from "@/app/guards/RouteGuard";
import { LoginPage } from "@/features/auth";

import NotFound from "@/app/pages/NotFound";
import Unauthorized from "@/app/pages/Unauthorized";
import { APP_ROUTES } from "@/app/router/app-routes";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <RouteGuard />,
    children: [
      {
        element: <AppShell />,
        children: APP_ROUTES.map((route) => ({
          path: route.path,
          element: <RouteGuard anyOf={route.anyOf} allOf={route.allOf} />,
          children: [{ index: true, element: route.element }],
        })),
      },
    ],
  },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "*", element: <NotFound /> },
]);
