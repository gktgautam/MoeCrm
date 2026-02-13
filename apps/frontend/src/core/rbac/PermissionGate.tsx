// src/core/rbac/PermissionGate.tsx
import type { ReactNode } from "react";
import { hasPermission } from "@/core/rbac/permissions";

/**
 * PermissionGate
 * UI show/hide based on provided permissions.
 */
export default function PermissionGate({
  permissions,
  anyOf,
  allOf,
  children,
  fallback = null,
}: {
  permissions: string[];
  anyOf?: string[];
  allOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const okAny =
    !anyOf || anyOf.length === 0 ? true : anyOf.some((p) => hasPermission(permissions, p));

  const okAll =
    !allOf || allOf.length === 0 ? true : allOf.every((p) => hasPermission(permissions, p));

  return <>{okAny && okAll ? children : fallback}</>;
}
