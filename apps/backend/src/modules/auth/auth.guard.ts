import type { preHandlerHookHandler } from "fastify";
import type { AuthTokenPayload } from "@/core/plugins/jwt.auth";
import type { AppRole } from "./auth.types.js";
import {
  fetchPermissionsForRole,
  permissionMatches,
  type PermissionRequirement,
} from "./auth.permissions.js";
import { resolveOrgIdFromRequest } from "./org-access.js";
import { AppError } from "@/core/http/error-handling";

async function getRequestPermissions(req: any): Promise<string[]> {
  if (!req.auth) return [];
  if (Array.isArray(req.authPermissions)) return req.authPermissions;

  req.authPermissions = await fetchPermissionsForRole(req.server, req.auth.role);
  return req.authPermissions;
}

export const requireAuth: preHandlerHookHandler = async (req, reply) => {
  if (!req.auth) {
    throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
  }
  return;
};

export function requireRole(roles: AuthTokenPayload["role"][]): preHandlerHookHandler {
  return async (req, reply) => {
    if (!req.auth) {
      throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
    }

    if (!roles.includes(req.auth.role)) {
      throw new AppError({ statusCode: 403, code: "FORBIDDEN", message: "Insufficient permissions" });
    }

    return;
  };
}

export function requirePermission(requirement: PermissionRequirement): preHandlerHookHandler {
  return async (req, reply) => {
    if (!req.auth) {
      throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
    }

    const permissions = await getRequestPermissions(req);

    const anyOk =
      !requirement.anyOf ||
      requirement.anyOf.length === 0 ||
      requirement.anyOf.some((permission) => permissionMatches(permissions, permission));

    const allOk =
      !requirement.allOf ||
      requirement.allOf.length === 0 ||
      requirement.allOf.every((permission) => permissionMatches(permissions, permission));

    if (!anyOk || !allOk) {
      throw new AppError({ statusCode: 403, code: "FORBIDDEN", message: "Insufficient permissions" });
    }

    return;
  };
}

export function requireOrgAccess(options: {
  source: "query" | "body" | "params";
  key?: string;
  allowCrossOrgRoles?: readonly AppRole[];
}): preHandlerHookHandler {
  return async (req, reply) => {
    if (!req.auth) {
      throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
    }

    try {
      resolveOrgIdFromRequest(req, options);
      return;
    } catch (error) {
      const code = error instanceof Error ? error.message : "FORBIDDEN";

      if (code === "INVALID_ORG_ID") {
        throw new AppError({ statusCode: 400, code: "BAD_REQUEST", message: "Invalid orgId in request" });
      }

      if (code === "UNAUTHORIZED") {
        throw new AppError({ statusCode: 401, code: "UNAUTHORIZED", message: "Authentication required" });
      }

      throw new AppError({ statusCode: 403, code: "FORBIDDEN", message: "Cross-org access denied" });
    }
  };
}
