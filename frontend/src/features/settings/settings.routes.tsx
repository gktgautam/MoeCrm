import SettingsHome from "@/features/settings/pages/SettingsHome";
import RolesSettingsPage from "@/features/settings/pages/RolesSettingsPage";
import UsersSettingsPage from "@/features/settings/pages/UsersSettingsPage";
import type { AppRoute } from "@/app/router/route.types";

export const SETTINGS_ROUTES: AppRoute[] = [
  {
    path: "/settings",
    navLabel: "Settings",
    anyOf: ["settings:read"],
    element: <SettingsHome />,
  },
  {
    path: "/settings/users",
    navLabel: "Users",
    anyOf: ["users:read", "users:manage"],
    element: <UsersSettingsPage />,
  },
  {
    path: "/settings/roles",
    navLabel: "Roles",
    anyOf: ["roles:read", "roles:manage"],
    element: <RolesSettingsPage />,
  },
];
