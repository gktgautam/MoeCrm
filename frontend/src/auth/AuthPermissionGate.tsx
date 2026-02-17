import type { ReactNode } from "react";
import PermissionGate from "@/core/rbac/PermissionGate";

export default function AuthPermissionGate({
  anyOf,
  allOf,
  children,
  fallback = null,
}: {
  anyOf?: string[];
  allOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const allow = allOf ?? anyOf ?? [];
  const mode: "all" | "any" = allOf ? "all" : "any";

  return (
    <PermissionGate allow={allow} mode={mode} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
