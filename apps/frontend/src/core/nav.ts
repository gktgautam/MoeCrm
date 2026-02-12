// src/core/nav.ts
import type { Role } from "@/features/auth/auth.types";

export type NavItem = {
  label: string;
  to: string;
  roles: Role[];
};

export const NAV: NavItem[] = [
  { label: "Dashboard", to: "/", roles: ["owner", "admin", "manager", "viewer"] },
  { label: "Segments", to: "/segments", roles: ["owner", "admin", "manager"] },
  { label: "Campaigns", to: "/campaigns", roles: ["owner", "admin", "manager"] },
  { label: "Analytics", to: "/analytics", roles: ["owner", "admin", "manager", "viewer"] },
  { label: "Settings", to: "/settings", roles: ["owner", "admin"] },
];
