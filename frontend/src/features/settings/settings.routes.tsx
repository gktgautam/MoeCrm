import SettingsHome from "@/features/settings/pages/SettingsHome";
import RolesSettingsPage from "@/features/settings/pages/RolesSettingsPage";
import UsersSettingsPage from "@/features/settings/pages/UsersSettingsPage";
import type { AppRoute } from "@/app/router";
import { Settings } from "lucide-react";

export const SETTINGS_ROUTES: AppRoute[] = [
  {
    navLabel: "Settings",     // ← label only
    icon: Settings,

    path: null,               // ← NO ROUTE
    element: null,            // ← NO PAGE
    anyOf: [],                // ← optional

    children: [
      {
        path: "/settings/users",
        navLabel: "Users",
        anyOf: ["users:read"],
        element: <UsersSettingsPage />,
      },
      {
        path: "/settings/roles",
        navLabel: "Roles",
        anyOf: ["roles:read"],
        element: <RolesSettingsPage />,
      }
    ]
  }
];
