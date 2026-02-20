export type Role = "admin" | "marketer" | "analyst" | "developer" | "viewer" | "support";

export type AuthUser = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  status?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthMeResponse = {
  user: AuthUser;
  role: Role;
  permissions: string[];
  allowedRoutes: string[];
};

export type AuthedState = {
  status: "authed";
  user: AuthUser;
  role: Role;
  permissions: string[];
  allowedRoutes: string[];
};

export type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | AuthedState;

export type AuthContextValue = {
  state: AuthState;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
  hasPerm: (perm: string) => boolean;
  hasPermissionFor: (perms: string[], mode?: "all" | "any") => boolean;
};
