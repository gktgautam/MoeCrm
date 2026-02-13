// src/features/auth/auth.types.ts
import type { Role } from "@/shared/types/auth";

export type { Role };

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
  allowedRoutes: string[];
};
