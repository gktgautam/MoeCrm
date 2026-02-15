import type { ReactNode } from "react";
import { useAuth } from "@/features/auth";

/**
 * PermissionGate
 * Conditionally render UI based on auth state and permission requirements.
 */
export default function PermissionGate({
  allow,
  mode = "all",
  children,
  fallback = null,
}: {
  allow: string[];
  mode?: "all" | "any";
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { state, hasPermissionFor } = useAuth();

  if (state.status !== "authed") {
    return <>{fallback}</>;
  }

  const isAllowed = hasPermissionFor(allow, mode);
  return <>{isAllowed ? children : fallback}</>;
}
