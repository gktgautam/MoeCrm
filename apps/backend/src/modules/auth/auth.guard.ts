import type { preHandlerHookHandler } from "fastify";
import { Errors } from "@/core/http/app-error";
import type { AppRole } from "./auth.types.js";
import {
  fetchPermissionsForUser,
  fetchRoleKeysForUser,
  permissionMatches,
  type PermissionRequirement,
} from "./auth.permissions.js";
import { resolveOrgIdFromRequest } from "./org-access.js";

async function getRequestPermissions(req: any): Promise<string[]> {
  if (!req.auth) return [];
  if (Array.isArray(req.authPermissions)) return req.authPermissions;

  // Cache computed auth permissions on request to avoid duplicate RBAC queries.
  req.authPermissions = await fetchPermissionsForUser(req.server, {
    userId: Number(req.auth.sub),
    orgId: Number(req.auth.orgId),
  });
  return req.authPermissions;
}

async function getRequestRoleKeys(req: any): Promise<string[]> {
  if (!req.auth) return [];
  if (Array.isArray(req.authRoleKeys)) return req.authRoleKeys;

  req.authRoleKeys = await fetchRoleKeysForUser(req.server, {
    userId: Number(req.auth.sub),
    orgId: Number(req.auth.orgId),
  });
  return req.authRoleKeys;
}

export const requireAuth: preHandlerHookHandler = async (req) => {
  if (!req.auth) {
    throw Errors.unauthorized();
  }
};

export function requireRole(roles: AppRole[]): preHandlerHookHandler {
  return async (req) => {
    if (!req.auth) {
      throw Errors.unauthorized();
    }

    const roleKeys = await getRequestRoleKeys(req);
    if (!roles.some((role) => roleKeys.includes(role))) {
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

    const roleKeys = await getRequestRoleKeys(req);
    resolveOrgIdFromRequest(req, options, roleKeys);
  };
}
