// src/auth/AuthProvider.tsx
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

export type Role = "owner" | "admin" | "manager" | "viewer";

export type AuthUser = {
  id: number;
  orgId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  status?: string;
};

type LoginPayload = { orgId: number; email: string; password: string };

type AuthContextValue = {
  user: AuthUser | null;
  permissions: string[];
  isAuthenticated: boolean;
  ready: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const refreshMe = useCallback(async () => {
    const { data } = await api.get("/auth/me"); // ✅ baseURL already has /api
    setUser(data.user);
    setPermissions(data.permissions ?? []);
  }, []);

  // Initial session load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) {
          setUser(data.user);
          setPermissions(data.permissions ?? []);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setPermissions([]);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    // Listen for global logout (from axios interceptor)
    const onLogout = () => {
      setUser(null);
      setPermissions([]);
      queryClient.clear();
    };
    window.addEventListener("auth:logout", onLogout);

    return () => {
      cancelled = true;
      window.removeEventListener("auth:logout", onLogout);
    };
  }, []);

  const login = useCallback(async ({ orgId, email, password }: LoginPayload) => {
    // login sets cookie (ee_auth)
    await api.post("/auth/login", { orgId, email, password });

    // ✅ now hydrate user+role for role-based UI
    await refreshMe();

    // clear cached data for previous user
    queryClient.clear();
  }, [refreshMe]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    setPermissions([]);
    queryClient.clear();
  }, []);

  const value = useMemo(
    () => ({
      user,
      permissions,
      isAuthenticated: Boolean(user),
      ready,
      login,
      logout,
      refreshMe,
    }),
    [user, permissions, ready, login, logout, refreshMe]
  );

  if (!ready) return <div className="flex items-center justify-center h-full">Loading…</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
