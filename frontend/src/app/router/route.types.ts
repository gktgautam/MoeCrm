import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type AppRoute = {
  path?: string;
  element?: ReactNode;
  navLabel?: string;
  anyOf?: string[];
  allOf?: string[];
  children?: AppRoute[];
  icon?: LucideIcon;
};
