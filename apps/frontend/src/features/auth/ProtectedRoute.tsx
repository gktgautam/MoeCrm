import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { canAccess, type AccessRule } from "./access-control";

export default function ProtectedRoute({
  access,
  redirectTo = "/unauthorized",
}: {
  access?: AccessRule;
  redirectTo?: string;
}) {
  const { state } = useAuth();

  if (state.status === "loading") return null;
  if (state.status === "guest") return <Navigate to="/login" replace />;

  const allowed = canAccess(
    { status: "authed", role: state.user.role, permissions: state.permissions },
    access
  );

  if (!allowed) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
