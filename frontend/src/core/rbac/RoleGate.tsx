import type { ReactNode } from "react";
import type { Role } from "@/auth/auth.types";

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
