import TemplatesHome from "@/features/templates/pages/TemplatesHome";
import type { AppRoute } from "@/app/router";
import { FileText } from "lucide-react";

export const TEMPLATES_ROUTES: AppRoute[] = [
  {
    path: "/templates",
    navLabel: "Templates",
    anyOf: ["templates:read"],
    element: <TemplatesHome />,
    icon: FileText
  },
];
