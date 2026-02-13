import { hasPermission } from "@/core/rbac/permissions";
import type { AccessRule, AuthSnapshot } from "@/core/rbac/rbac.types";

export type { AccessRule, AuthSnapshot };

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
