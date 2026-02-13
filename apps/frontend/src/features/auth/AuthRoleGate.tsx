import type { ReactNode } from "react";
import RoleGate from "@/core/rbac/RoleGate";
import type { Role } from "@/shared/types/auth";
import { useAuth } from "@/features/auth/useAuth";

export default function AuthRoleGate({
  allow,
  children,
  fallback = null,
}: {
  allow: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { state } = useAuth();

  return (
    <RoleGate role={state.status === "authed" ? state.user.role : undefined} allow={allow} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
