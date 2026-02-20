// frontend/src/app/router/app-routes.tsx
import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { FEATURE_ROUTES, type AppRoute } from "@/app/router";

import AuthLayout from "@/app/layouts/AuthLayout";
import AppShell from "@/app/layouts/AppShell";
import RouteGuard from "@/app/guards/RouteGuard";

import { LoginPage } from "@/auth";
import NotFound from "@/app/pages/NotFound";
import Unauthorized from "@/app/pages/Unauthorized";
import RouteError from "@/app/pages/RouteError";

function mapAppRoutes(routes: AppRoute[]): RouteObject[] {
  return routes.map((route) => ({
    path: route.path ?? undefined,
    element: <RouteGuard anyOf={route.anyOf} allOf={route.allOf} />,
    children: [
      ...(route.element != null ? [{ index: true, element: route.element }] : []),
      ...(route.children ? mapAppRoutes(route.children) : []),
    ],
  }));
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <RouteError />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <RouteGuard />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AppShell />,
        errorElement: <RouteError />,
        children: mapAppRoutes(FEATURE_ROUTES),
      },
    ],
  },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "*", element: <NotFound /> },
]);
