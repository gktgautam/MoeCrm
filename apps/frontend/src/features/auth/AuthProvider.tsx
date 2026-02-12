// src/features/auth/AuthProvider.tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { AuthUser, MeResponse, Role } from "./auth.types";

type LoginPayload = { orgId: number; email: string; password: string };

type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authed"; user: AuthUser; permissions: string[] };

type AuthContextValue = {
  state: AuthState;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
  hasPerm: (perm: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
      // backend returns { ok: true } and sets ee_auth cookie
      await api.post("/auth/login", { orgId, email, password });

      // ✅ hydrate role-based UI info
      await refreshMe();

      queryClient.clear();
    },
    [refreshMe]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setState({ status: "guest" });
    queryClient.clear();
  }, []);

  const hasRole = (roles: Role[]) => {
    if (state.status !== "authed") return false;
    return roles.includes(state.user.role);
  };

  const hasPerm = (perm: string) => {
    if (state.status !== "authed") return false;
    return state.permissions.includes(perm);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, logout, refreshMe, hasRole, hasPerm }),
    [state, login, logout, refreshMe]
  );

  // Optional: global loading screen
  if (state.status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
