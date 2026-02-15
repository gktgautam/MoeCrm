// src/core/rbac/RoleGate.tsx
import type { ReactNode } from "react"; ; 

export default function RoleGate({
  role,
  allow,
  children,
  fallback = null,
}: {
  role?: any;
  allow: any;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <>{role && allow.includes(role) ? children : fallback}</>;
}
