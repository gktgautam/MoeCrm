// src/modules/auth/auth.guard.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthTokenPayload } from "../../plugins/jwt.auth.js";

export function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  if (!req.auth) {
    return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
  }
  // ok -> continue
}

export function requireRole(roles: AuthTokenPayload["role"][]) {
  return (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.auth) {
      return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    }

    if (!roles.includes(req.auth.role)) {
      return reply.code(403).send({ ok: false, error: "FORBIDDEN" });
    }
    // ok -> continue
  };
}

/**
 * Optional: enforce org match (if your route has :orgId param)
 * Example route: /v1/orgs/:orgId/campaigns
 */
export function requireOrgFromParams(paramKey: string = "orgId") {
  return (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.auth) {
      return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    }

    const paramOrgId = (req.params as any)?.[paramKey];
    if (!paramOrgId) return; // no org param in this route

    if (String(paramOrgId) !== String(req.auth.orgId)) {
      return reply.code(403).send({ ok: false, error: "FORBIDDEN" });
    }
  };
}
