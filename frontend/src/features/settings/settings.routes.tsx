import RolesSettingsPage from "@/features/settings/pages/RolesSettingsPage";
import UsersSettingsPage from "@/features/settings/pages/UsersSettingsPage";
import type { AppRoute } from "@/app/router";
import { Settings } from "lucide-react";

export const SETTINGS_ROUTES: AppRoute[] = [
  {
    navLabel: "Settings",
    icon: Settings,
    anyOf: [],

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
