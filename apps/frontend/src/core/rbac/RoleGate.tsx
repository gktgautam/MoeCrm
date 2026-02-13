// src/core/rbac/RoleGate.tsx
import type { ReactNode } from "react";
import type { Role } from "@/shared/types/auth";

export default function RoleGate({
  role,
  allow,
  children,
  fallback = null,
}: {
  role?: Role;
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <>{role && allow.includes(role) ? children : fallback}</>;
}
