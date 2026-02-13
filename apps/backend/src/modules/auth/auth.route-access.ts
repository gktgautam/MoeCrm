import type { PermissionRequirement } from "./auth.permissions.js";
import { permissionMatches } from "./auth.permissions.js";

export const APP_ROUTE_REQUIREMENTS: Record<string, PermissionRequirement> = {
  "/": {},
  "/segments": { anyOf: ["segments:read"] },
  "/campaigns": { anyOf: ["campaigns:read"] },
  "/analytics": { anyOf: ["analytics:read"] },
  "/settings": { anyOf: ["settings:read"] },
};

export function resolveAllowedRoutes(permissions: string[]) {
  return Object.entries(APP_ROUTE_REQUIREMENTS)
    .filter(([, requirement]) => {
      const anyOk =
        !requirement.anyOf ||
        requirement.anyOf.length === 0 ||
        requirement.anyOf.some((permission) => permissionMatches(permissions, permission));

      const allOk =
        !requirement.allOf ||
        requirement.allOf.length === 0 ||
        requirement.allOf.every((permission) => permissionMatches(permissions, permission));

      return anyOk && allOk;
    })
    .map(([path]) => path);
}

