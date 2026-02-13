// src/core/rbac/RoleGate.tsx
import { type Role, useAuth } from "@/features/auth";

export default function RoleGate({
  allow,
  children,
  fallback = null,
}: {
  allow: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasRole } = useAuth();
  return <>{hasRole(allow) ? children : fallback}</>;
}
