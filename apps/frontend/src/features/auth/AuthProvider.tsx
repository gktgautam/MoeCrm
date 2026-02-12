import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { MeResponse, Role } from "./auth.types";
import { hasPermission } from "./perm";
import { AuthContext, type AuthContextValue, type AuthState, type LoginPayload } from "./auth.context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refreshMe = useCallback(async () => {
    const { data } = await api.get<MeResponse>("/auth/me");
    setState({ status: "authed", user: data.user, permissions: data.permissions ?? [] });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<MeResponse>("/auth/me");
        if (!cancelled) {
          setState({ status: "authed", user: data.user, permissions: data.permissions ?? [] });
        }
      } catch {
        if (!cancelled) setState({ status: "guest" });
      }
    })();

    const onLogout = () => {
      setState({ status: "guest" });
      queryClient.clear();
    };

    window.addEventListener("auth:logout", onLogout);

    return () => {
      cancelled = true;
      window.removeEventListener("auth:logout", onLogout);
    };
  }, []);

  const login = useCallback(
    async ({ orgId, email, password }: LoginPayload) => {
      await api.post("/auth/login", { orgId, email, password });
      await refreshMe();
      queryClient.clear();
    },
    [refreshMe]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore logout network errors and clear local auth state
    }
    setState({ status: "guest" });
    queryClient.clear();
  }, []);

  const hasRole = useCallback(
    (roles: Role[]) => {
      if (state.status !== "authed") return false;
      return roles.includes(state.user.role);
    },
    [state]
  );

  const hasPerm = useCallback(
    (perm: string) => {
      if (state.status !== "authed") return false;
      return hasPermission(state.permissions, perm);
    },
    [state]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, logout, refreshMe, hasRole, hasPerm }),
    [state, login, logout, refreshMe, hasRole, hasPerm]
  );

  if (state.status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
