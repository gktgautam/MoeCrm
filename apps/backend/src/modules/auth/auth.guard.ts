import type { preHandlerHookHandler } from "fastify";
import type { AuthTokenPayload } from "../../plugins/jwt.auth.js";
import type { AppRole } from "./auth.types.js";
import { resolveOrgIdFromRequest } from "./org-access.js";

type PermissionRule = {
  anyOf?: string[];
  allOf?: string[];
};

async function loadPermissionsForRole(req: any): Promise<string[]> {
  if (!req.auth) return [];
  if (Array.isArray(req.authPermissions)) return req.authPermissions;

  const { rows } = await req.server.dbEngage.query(
    `
      select p.key
      from app_role_permissions rp
      join app_roles r on r.id = rp.role_id
      join app_permissions p on p.id = rp.permission_id
      where r.key = $1
      order by p.key asc
    `,
    [req.auth.role],
  );

  req.authPermissions = (rows as Array<{ key: string }>).map((row) => row.key);
  return req.authPermissions;
}

function hasPermission(perms: string[], required: string): boolean {
  if (perms.includes(required)) return true;

  const [resource, action] = required.split(":");
  if (action === "read" && perms.includes(`${resource}:write`)) return true;

  return false;
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

export function requirePermission(rule: PermissionRule): preHandlerHookHandler {
  return async (req, reply) => {
    if (!req.auth) {
      return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    }

    const permissions = await loadPermissionsForRole(req);

    const anyOk =
      !rule.anyOf ||
      rule.anyOf.length === 0 ||
      rule.anyOf.some((permission) => hasPermission(permissions, permission));

    const allOk =
      !rule.allOf ||
      rule.allOf.length === 0 ||
      rule.allOf.every((permission) => hasPermission(permissions, permission));

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
