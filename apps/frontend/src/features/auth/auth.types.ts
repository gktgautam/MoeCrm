// src/features/auth/auth.types.ts
export type Role = "owner" | "admin" | "manager" | "marketer" | "developer" | "analyst" | (string & {});

export type AuthUser = {
  id: number;
  orgId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  status?: string;
};

export type MeResponse = {
  ok: true;
  user: AuthUser;
  permissions: string[];
};
