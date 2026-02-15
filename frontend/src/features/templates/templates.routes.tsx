import TemplatesHome from "@/features/templates/pages/TemplatesHome";
import type { AppRoute } from "@/app/router/route.types";

export const TEMPLATES_ROUTES: AppRoute[] = [
  {
    path: "/templates",
    navLabel: "Templates",
    anyOf: ["templates:read"],
    element: <TemplatesHome />,
  },
];
