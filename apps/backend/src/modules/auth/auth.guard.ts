import type { preHandlerHookHandler } from "fastify";
import { Errors } from "@/core/http/app-error";
import type { AuthTokenPayload } from "@/core/plugins/jwt.auth";
import type { AppRole } from "./auth.types.js";
import {
  getPermissionsForUser,
  getRoleKeyForUser,
  permissionMatches,
  type PermissionRequirement,
} from "./auth.permissions.js";
import { resolveOrgIdFromRequest } from "./org-access.js";

async function getRequestPermissions(req: any): Promise<string[]> {
  if (!req.auth) return [];
  if (Array.isArray(req.authPermissions)) return req.authPermissions;

  const userId = Number(req.auth.sub);
  const orgId = Number(req.auth.orgId);

  req.authPermissions = await getPermissionsForUser(req.server, userId, orgId);
  return req.authPermissions;
}

async function getRequestRole(req: any): Promise<string | null> {
  if (!req.auth) return null;
  if (typeof req.authRoleKey === "string") return req.authRoleKey;

  const userId = Number(req.auth.sub);
  const orgId = Number(req.auth.orgId);
  req.authRoleKey = await getRoleKeyForUser(req.server, userId, orgId);

  return req.authRoleKey;
}

export const requireAuth: preHandlerHookHandler = async (req) => {
  if (!req.auth) {
    throw Errors.unauthorized();
  }
};

export function requireRole(roles: AuthTokenPayload["role"][]): preHandlerHookHandler {
  return async (req) => {
    if (!req.auth) {
      throw Errors.unauthorized();
    }

    const roleKey = await getRequestRole(req);
    if (!roleKey || !roles.includes(roleKey as AuthTokenPayload["role"])) {
      throw Errors.forbidden();
    }
  };
}

export function requirePermission(requirement: PermissionRequirement): preHandlerHookHandler {
  return async (req) => {
    if (!req.auth) {
      throw Errors.unauthorized();
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
      throw Errors.forbidden();
    }
  };
}

export function requireOrgAccess(options: {
  source: "query" | "body" | "params";
  key?: string;
  allowCrossOrgRoles?: readonly AppRole[];
}): preHandlerHookHandler {
  return async (req) => {
    if (!req.auth) {
      throw Errors.unauthorized();
    }

    resolveOrgIdFromRequest(req, options);
  };
}
