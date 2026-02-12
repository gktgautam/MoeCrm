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
