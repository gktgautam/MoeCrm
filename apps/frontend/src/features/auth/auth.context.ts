import { createContext } from "react";
import type { AuthUser, Role } from "./auth.types";

export type LoginPayload = { orgId: number; email: string; password: string };

export type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authed"; user: AuthUser; permissions: string[] };

export type AuthContextValue = {
  state: AuthState;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
  hasPerm: (perm: string) => boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
