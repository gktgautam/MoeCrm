import type { Role } from "./auth.types";
import { hasPermission } from "./permission-utils";

export type AccessRule = {
  roles?: Role[];
  anyOf?: string[];
  allOf?: string[];
};

export type AuthSnapshot =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authed"; role: Role; permissions: string[] };

/**
 * Evaluates whether the current auth snapshot can satisfy the provided access rule.
 */
export function canAccess(snapshot: AuthSnapshot, rule?: AccessRule) {
  if (!rule) return snapshot.status === "authed";
  if (snapshot.status !== "authed") return false;

  const { role, permissions } = snapshot;

  const roleOk = !rule.roles || rule.roles.length === 0 || rule.roles.includes(role);
  const anyOk =
    !rule.anyOf ||
    rule.anyOf.length === 0 ||
    rule.anyOf.some((permission) => hasPermission(permissions, permission));
  const allOk =
    !rule.allOf ||
    rule.allOf.length === 0 ||
    rule.allOf.every((permission) => hasPermission(permissions, permission));

  return roleOk && anyOk && allOk;
}
