import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { queryClient } from "@/core/http/queryClient";
import { hasPermission } from "@/core/rbac/permissions";
import { AuthContext } from "./auth.context";
import { fetchMe, loginRequest, logoutRequest } from "./auth.api";
import type { AuthContextValue, AuthState, LoginPayload, Role } from "./auth.types";

function toAuthedState(data: Awaited<ReturnType<typeof fetchMe>>): AuthState {
  return {
    status: "authed",
    user: data.user,
    role: data.role,
    permissions: data.permissions,
    allowedRoutes: data.allowedRoutes,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refreshMe = useCallback(async () => {
    const data = await fetchMe();
    setState(toAuthedState(data));
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchMe();
        if (!cancelled) {
          setState(toAuthedState(data));
        }
      } catch {
        if (!cancelled) {
          setState({ status: "guest" });
        }
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
    async (payload: LoginPayload) => {
      await loginRequest(payload);
      await refreshMe();
      queryClient.clear();
    },
    [refreshMe],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setState({ status: "guest" });
      queryClient.clear();
    }
  }, []);

  const hasRole = useCallback(
    (roles: Role[]) => state.status === "authed" && roles.includes(state.role),
    [state],
  );

  const hasPerm = useCallback(
    (perm: string) => state.status === "authed" && hasPermission(state.permissions, perm),
    [state],
  );

  const hasPermissionFor = useCallback(
    (perms: string[], mode: "all" | "any" = "all") => {
      if (state.status !== "authed") {
        return false;
      }

      if (perms.length === 0) {
        return true;
      }

      return mode === "any"
        ? perms.some((perm) => hasPermission(state.permissions, perm))
        : perms.every((perm) => hasPermission(state.permissions, perm));
    },
    [state],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, logout, refreshMe, hasRole, hasPerm, hasPermissionFor }),
    [state, login, logout, refreshMe, hasRole, hasPerm, hasPermissionFor],
  );

  if (state.status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">Loading…</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
