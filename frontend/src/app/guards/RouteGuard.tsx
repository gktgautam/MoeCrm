import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth";

type RouteGuardProps = {
  allow?: string[];
  mode?: "all" | "any";
  allOf?: string[];
  anyOf?: string[];
  guestRedirectTo?: string;
  forbiddenRedirectTo?: string;
};

export default function RouteGuard({
  allow,
  mode,
  allOf,
  anyOf,
  guestRedirectTo = "/login",
  forbiddenRedirectTo = "/unauthorized",
}: RouteGuardProps) {
  const { state, hasPermissionFor } = useAuth();

  if (state.status === "loading") return null;
  if (state.status === "guest") return <Navigate to={guestRedirectTo} replace />;

  const required = allow ?? allOf ?? anyOf ?? [];
  const effectiveMode = mode ?? (allOf ? "all" : "any");

  if (required.length > 0 && !hasPermissionFor(required, effectiveMode)) {
    return <Navigate to={forbiddenRedirectTo} replace />;
  }

  return <Outlet />;
}
