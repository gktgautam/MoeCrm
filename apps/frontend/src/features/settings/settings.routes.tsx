import SettingsHome from "@/features/settings/pages/SettingsHome";
import type { AppRoute } from "@/app/router/route.types";

export const SETTINGS_ROUTES: AppRoute[] = [
  {
    path: "/settings",
    navLabel: "Settings",
    element: <SettingsHome />,
  },
];
