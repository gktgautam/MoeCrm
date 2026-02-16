import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { ErrorResponseSchema } from "@/core/http/error-response";
import { Errors } from "@/core/http/app-error";
import { requireAuth, requireOrgAccess, requirePermission } from "../auth/auth.guard";
import { resolveOrgIdFromRequest } from "../auth/org-access";
import { syncCustomersFromCrm } from "./customers.service";

const BodySchema = Type.Object({
  orgId: Type.Optional(Type.Integer({ minimum: 1 })),
  updatedAfter: Type.Optional(Type.String({ format: "date-time" })),
});

const ResponseSchema = Type.Object({
  ok: Type.Literal(true),
  data: Type.Object({
    fetched: Type.Integer(),
    upserted: Type.Integer(),
  }),
});

const routes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: { orgId?: number; updatedAfter?: string } }>("/sync", {
    schema: {
      tags: ["customers"],
      security: [{ cookieAuth: [] }],
      body: BodySchema,
      response: {
        200: ResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [
      requireAuth,
      requirePermission({ anyOf: ["customers:sync"] }),
      requireOrgAccess({ source: "body" }),
    ],
    handler: async (req) => {
      if (req.body.updatedAfter && Number.isNaN(Date.parse(req.body.updatedAfter))) {
        throw Errors.invalidUpdatedAfter();
      }

      const orgId = resolveOrgIdFromRequest(req, { source: "body" });
      const result = await syncCustomersFromCrm({
        dbCrm: app.dbCrm,
        dbEngage: app.dbEngage,
        orgId,
        updatedAfter: req.body.updatedAfter,
      });

      return { ok: true as const, data: result };
    },
  });
};

export default routes;
