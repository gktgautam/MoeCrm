import { createContext } from "react";
 

export type LoginPayload = { email: string; password: string };

export type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authed"; user: any; role: any; permissions: string[]; allowedRoutes: string[] };

export type AuthContextValue = {
  state: AuthState;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  hasRole: (roles: any) => boolean;
  hasPerm: (perm: string) => boolean;
  hasPermissionFor: (perms: string[], mode?: "all" | "any") => boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
