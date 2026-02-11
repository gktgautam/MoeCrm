import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type Role } from "./AuthProvider";

type Props = { roles?: Role[]; redirectTo?: string };

export default function ProtectedRoute({ roles, redirectTo = "/login" }: Props) {
  const { isAuthenticated, user, ready } = useAuth();
  if (!ready) return null;

  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
