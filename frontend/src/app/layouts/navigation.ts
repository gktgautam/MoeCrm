import { FEATURE_ROUTES, type AppRoute } from "@/app/router";

export type NavItem = {
  label: string;
  to: string;
  children?: NavItem[];
};

  
function buildNav(routes: AppRoute[]): NavItem[] {
  return routes
    .filter((route) => route.navLabel) // ensure label exists
    .map((route) => {
      const item: NavItem = {
        label: route.navLabel!, // safe because filtered above
        to: route.path
      };

      if (route.children && route.children.length > 0) {
        item.children = buildNav(route.children);
      }

      return item;
    });
}

export const NAV: NavItem[] = buildNav(FEATURE_ROUTES as AppRoute[]);
