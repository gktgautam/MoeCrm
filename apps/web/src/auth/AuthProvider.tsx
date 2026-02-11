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

export type Role = "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "VIEWER";

export type AuthUser = { id: string; email: string; role: Role; name?: string };

type LoginPayload = { email: string; password: string };

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }: LoginPayload) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    queryClient.clear();
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setUser(null);
    queryClient.clear();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      ready,
      login,
      logout,
    }),
    [user, ready, login, logout]
  );

  if (!ready) return <div className="flex items-center justify-center h-full">Loading…</div>;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
