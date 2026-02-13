import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth";

export default function ProtectedRoute({
  path,
  redirectTo = "/unauthorized",
}: {
  path?: string;
  redirectTo?: string;
}) {
  const { state } = useAuth();

  if (state.status === "loading") return null;
  if (state.status === "guest") return <Navigate to="/login" replace />;

  if (path && !state.allowedRoutes.includes(path)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
