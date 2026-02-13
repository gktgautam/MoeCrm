import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { requireAuth, requireOrgAccess, requireRole } from "../auth/auth.guard.js";
import { resolveOrgIdFromRequest } from "../auth/org-access.js";
import { syncCustomersFromCrm } from "./customers.service.js";

const BodySchema = Type.Object({
  orgId: Type.Optional(Type.Integer({ minimum: 1 })),
  updatedAfter: Type.Optional(Type.String({ format: "date-time" })),
});

const ResponseSchema = Type.Object({
  ok: Type.Literal(true),
  fetched: Type.Integer(),
  upserted: Type.Integer(),
});

const ErrorSchema = Type.Object({
  ok: Type.Literal(false),
  error: Type.String(),
});

const routes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: { orgId?: number; updatedAfter?: string } }>("/sync", {
    schema: {
      tags: ["customers"],
      security: [{ cookieAuth: [] }],
      body: BodySchema,
      response: {
        200: ResponseSchema,
        400: ErrorSchema,
      },
    },
    preHandler: [
      requireAuth,
      requireRole(["admin", "developer", "support"]),
      requireOrgAccess({ source: "body" }),
    ],
    handler: async (req, reply) => {
      if (req.body.updatedAfter && Number.isNaN(Date.parse(req.body.updatedAfter))) {
        return reply.code(400).send({ ok: false as const, error: "INVALID_UPDATED_AFTER" });
      }

      const orgId = resolveOrgIdFromRequest(req, { source: "body" });
      const result = await syncCustomersFromCrm({
        dbCrm: app.dbCrm,
        dbEngage: app.dbEngage,
        orgId,
        updatedAfter: req.body.updatedAfter,
      });

      return { ok: true as const, ...result };
    },
  });
};

export default routes;
