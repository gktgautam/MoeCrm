// src/modules/auth/auth.guard.ts
import type { preHandlerHookHandler } from "fastify";
import type { AuthTokenPayload } from "../../plugins/jwt.auth.js";

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

/**
 * Enforce org match (if your route has :orgId param)
 * Example route: /v1/orgs/:orgId/campaigns
 */
export function requireOrgFromParams(paramKey: string = "orgId"): preHandlerHookHandler {
  return async (req, reply) => {
    if (!req.auth) {
      return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    }

    const params = req.params as Record<string, unknown> | undefined;
    const paramOrgId = params?.[paramKey];

    // If this route doesn't have org param, do nothing (continue)
    if (paramOrgId == null) return;

    if (String(paramOrgId) !== String(req.auth.orgId)) {
      return reply.code(403).send({ ok: false, error: "FORBIDDEN" });
    }

    return;
  };
}
