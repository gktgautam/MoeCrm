import type { PermissionRequirement } from "./auth.permissions.js";
import { permissionMatches } from "./auth.permissions.js";

export const DASHBOARD_ROUTE_REQUIREMENT: PermissionRequirement = {
  anyOf: ["analytics:read", "campaigns:read", "segments:read", "users:read", "settings:read"],
};

export const APP_ROUTE_REQUIREMENTS: Record<string, PermissionRequirement> = {
  "/": DASHBOARD_ROUTE_REQUIREMENT,
  "/segments": { anyOf: ["segments:read"] },
  "/campaigns": { anyOf: ["campaigns:read"] },
  "/analytics": { anyOf: ["analytics:read"] },
  "/templates": { anyOf: ["analytics:read"] },
  "/products": { anyOf: ["analytics:read"] },
  "/settings": { anyOf: ["settings:read"] },
  "/settings/users": { anyOf: ["users:read", "users:manage"] },
  "/settings/roles": { anyOf: ["roles:read", "roles:manage"] },

 
};

function requirementMatches(permissions: string[], requirement: PermissionRequirement): boolean {
  const anyOk =
    !requirement.anyOf ||
    requirement.anyOf.length === 0 ||
    requirement.anyOf.some((permission) => permissionMatches(permissions, permission));

  const allOk =
    !requirement.allOf ||
    requirement.allOf.length === 0 ||
    requirement.allOf.every((permission) => permissionMatches(permissions, permission));

  return anyOk && allOk;
}

export function resolveAllowedRoutes(permissions: string[]) {
  return Object.entries(APP_ROUTE_REQUIREMENTS)
    .filter(([, requirement]) => requirementMatches(permissions, requirement))
    .map(([path]) => path);
}
