import type { preHandlerHookHandler } from "fastify";
import type { AuthTokenPayload } from "@/core/plugins/jwt.auth";
import type { AppRole } from "./auth.types.js";
import {
  fetchPermissionsForRole,
  permissionMatches,
  type PermissionRequirement,
} from "./auth.permissions.js";
import { resolveOrgIdFromRequest } from "./org-access.js";

async function getRequestPermissions(req: any): Promise<string[]> {
  if (!req.auth) return [];
  if (Array.isArray(req.authPermissions)) return req.authPermissions;

  req.authPermissions = await fetchPermissionsForRole(req.server, req.auth.role);
  return req.authPermissions;
}

export const requireAuth: preHandlerHookHandler = async (req, reply) => {
  if (!req.auth) {
    return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
  }
  return;
};

export function requireRole(roles: AuthTokenPayload["role"][]): preHandlerHookHandler {
  return async (req, reply) => {
    if (!req.auth) {
      return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    }

    if (!roles.includes(req.auth.role)) {
      return reply.code(403).send({ ok: false, error: "FORBIDDEN" });
    }

    return;
  };
}

export function requirePermission(requirement: PermissionRequirement): preHandlerHookHandler {
  return async (req, reply) => {
    if (!req.auth) {
      return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
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
      return reply.code(403).send({ ok: false, error: "FORBIDDEN" });
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
      return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    }

    try {
      resolveOrgIdFromRequest(req, options);
      return;
    } catch (error) {
      const code = error instanceof Error ? error.message : "FORBIDDEN";

      if (code === "INVALID_ORG_ID") {
        return reply.code(400).send({ ok: false, error: code });
      }

      if (code === "UNAUTHORIZED") {
        return reply.code(401).send({ ok: false, error: code });
      }

      return reply.code(403).send({ ok: false, error: "FORBIDDEN" });
    }
  };
}
