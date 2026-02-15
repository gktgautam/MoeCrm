import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { ErrorResponseSchema } from "@/core/http/error-response";
import { requireAuth, requireOrgAccess, requirePermission } from "../auth/auth.guard.js";
import { listUsersByOrg } from "./users.controller.js";
import { resolveOrgIdFromRequest } from "../auth/org-access.js";
import { APP_ROLES } from "../auth/auth.types.js";

const QuerySchema = Type.Object({
  orgId: Type.Optional(Type.Integer({ minimum: 1 })),
});

const UserSchema = Type.Object({
  id: Type.Integer(),
  org_id: Type.Integer(),
  email: Type.String(),
  role: Type.Union(APP_ROLES.map((role) => Type.Literal(role))),
  status: Type.Union([Type.Literal("invited"), Type.Literal("active"), Type.Literal("disabled")]),
  created_at: Type.String(),
});

const ResponseSchema = Type.Object({
  ok: Type.Literal(true),
  data:
  Type.Object({
    users: Type.Array(UserSchema),
  }),
});

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { orgId?: number } }>("/", {
    schema: {
      tags: ["users"],
      security: [{ cookieAuth: [] }],
      querystring: QuerySchema,
      response: {
        200: ResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [requireAuth, requirePermission({ anyOf: ["users:read"] }), requireOrgAccess({ source: "query" })],
    handler: async (req) => {
      const orgId = resolveOrgIdFromRequest(req, { source: "query" });
      const users = await listUsersByOrg(app, orgId);
      return { ok: true as const, data: { users } };
    },
  });
};

export default usersRoutes;
