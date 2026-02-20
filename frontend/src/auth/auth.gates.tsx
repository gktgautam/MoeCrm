import type { ReactNode } from "react";
import PermissionGate from "@/core/rbac/PermissionGate";
import RoleGate from "@/core/rbac/RoleGate";
import { useAuth } from "./useAuth";
import type { Role } from "./auth.types";

type AuthRoleGateProps = {
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function AuthRoleGate({ allow, children, fallback = null }: AuthRoleGateProps) {
  const { state } = useAuth();

  return (
    <RoleGate role={state.status === "authed" ? state.role : undefined} allow={allow} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

type AuthPermissionGateProps = {
  anyOf?: string[];
  allOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function AuthPermissionGate({ anyOf, allOf, children, fallback = null }: AuthPermissionGateProps) {
  const allow = allOf ?? anyOf ?? [];
  const mode: "all" | "any" = allOf ? "all" : "any";

  return (
    <PermissionGate allow={allow} mode={mode} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
