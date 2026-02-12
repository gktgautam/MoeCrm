// src/modules/auth/auth.guard.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthTokenPayload } from "../../plugins/jwt.auth.js";

export function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  if (!req.auth) return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
}

export function requireRole(roles: AuthTokenPayload["role"][]) {
  return (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.auth) return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    if (!roles.includes(req.auth.role))
      return reply.code(403).send({ ok: false, error: "FORBIDDEN" });
  };
}
