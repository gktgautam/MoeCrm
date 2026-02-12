import { APP_ROUTES } from "@/app/router/route-config";

export type NavItem = {
  label: string;
  to: string;
};

export const NAV: NavItem[] = APP_ROUTES.flatMap((route) =>
  route.navLabel ? [{ label: route.navLabel, to: route.path }] : []
);
