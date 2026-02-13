import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { requireAuth, requireOrgAccess, requirePermission } from "../auth/auth.guard.js";
import { resolveOrgIdFromRequest } from "../auth/org-access.js";
import { syncCustomersFromCrm } from "./customers.service.js";
import { AppError, apiErrorSchema } from "@/core/http/error-handling";

const BodySchema = Type.Object({
  orgId: Type.Optional(Type.Integer({ minimum: 1 })),
  updatedAfter: Type.Optional(Type.String({ format: "date-time" })),
});

const ResponseSchema = Type.Object({
  ok: Type.Literal(true),
  fetched: Type.Integer(),
  upserted: Type.Integer(),
});

const routes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: { orgId?: number; updatedAfter?: string } }>("/sync", {
    schema: {
      tags: ["customers"],
      security: [{ cookieAuth: [] }],
      body: BodySchema,
      response: {
        200: ResponseSchema,
        400: apiErrorSchema,
      },
    },
    preHandler: [
      requireAuth,
      requirePermission({ anyOf: ["customers:sync"] }),
      requireOrgAccess({ source: "body" }),
    ],
    handler: async (req, reply) => {
      if (req.body.updatedAfter && Number.isNaN(Date.parse(req.body.updatedAfter))) {
        throw new AppError({
          statusCode: 400,
          code: "INVALID_UPDATED_AFTER",
          message: "updatedAfter must be a valid ISO date-time string",
        });
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
