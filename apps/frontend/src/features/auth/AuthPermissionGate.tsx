import type { ReactNode } from "react";
import PermissionGate from "@/core/rbac/PermissionGate";
import { useAuth } from "@/features/auth/useAuth";

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
  const { state } = useAuth();

  if (state.status !== "authed") return <>{fallback}</>;

  return (
    <PermissionGate permissions={state.permissions ?? []} anyOf={anyOf} allOf={allOf} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
