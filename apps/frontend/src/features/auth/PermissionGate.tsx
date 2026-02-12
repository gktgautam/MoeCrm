// src/features/auth/PermissionGate.tsx
import React from "react";
import { useAuth } from "./AuthProvider";
import { hasPermission } from "./perm";
/**
 * PermissionGate
 * UI show/hide based on `permissions[]` from GET /auth/me.
 *
 * Examples:
 *  <PermissionGate anyOf={["segments:read"]}>...</PermissionGate>
 *  <PermissionGate allOf={["campaigns:read","campaigns:write"]}>...</PermissionGate>
 */
export default function PermissionGate({
  anyOf,
  allOf,
  children,
  fallback = null,
}: {
  anyOf?: string[];
  allOf?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { state } = useAuth();

  if (state.status !== "authed") return <>{fallback}</>;

  const perms = state.permissions ?? [];

const okAny =
  !anyOf || anyOf.length === 0 ? true : anyOf.some((p) => hasPermission(perms, p));

const okAll =
  !allOf || allOf.length === 0 ? true : allOf.every((p) => hasPermission(perms, p));

  return <>{okAny && okAll ? children : fallback}</>;
}
