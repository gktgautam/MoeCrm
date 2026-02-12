// src/features/auth/RoleGate.tsx
import type { Role } from "./auth.types";
import { useAuth } from "./AuthProvider";

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
