import type { preHandlerHookHandler } from "fastify";
import type { AuthTokenPayload } from "../../plugins/jwt.auth.js";
import type { AppRole } from "./auth.types.js";
import { resolveOrgIdFromRequest } from "./org-access.js";

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

async function getPermissionsForCurrentUser(req: Parameters<preHandlerHookHandler>[0]): Promise<string[]> {
  if (!req.auth) return [];

  const userId = Number(req.auth.sub);
  const orgId = Number(req.auth.orgId);

  if (!Number.isInteger(userId) || !Number.isInteger(orgId)) return [];

  const { rows } = await req.server.dbEngage.query<{ permission_key: string }>(
    `
      select distinct p.permission_key
      from app_users u
      join rbac_roles r on r.id = u.role_id
      join rbac_role_permissions rp on rp.role_id = r.id
      join rbac_permissions p on p.id = rp.permission_id
      where u.id = $1 and u.org_id = $2
    `,
    [userId, orgId],
  );

  return rows.map((row) => row.permission_key);
}

export function requireAnyPermission(permissions: string[]): preHandlerHookHandler {
  return async (req, reply) => {
    if (!req.auth) {
      return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    }

    if (permissions.length === 0) return;

    const userPermissions = await getPermissionsForCurrentUser(req);
    const allowed = permissions.some((permission) => userPermissions.includes(permission));

    if (!allowed) {
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
