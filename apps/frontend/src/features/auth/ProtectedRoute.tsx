// src/features/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute() {
  const { state } = useAuth();
  if (state.status === "loading") return null;
  if (state.status === "guest") return <Navigate to="/login" replace />;
  return <Outlet />;
}
