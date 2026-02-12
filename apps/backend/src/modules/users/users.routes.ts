import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { requireAuth, requireOrgAccess, requireRole } from "../auth/auth.guard.js";
import { listUsersByOrg } from "./users.controller.js";
import { resolveOrgIdFromRequest } from "../auth/org-access.js";

const QuerySchema = Type.Object({
  orgId: Type.Optional(Type.Integer({ minimum: 1 })),
});

const UserSchema = Type.Object({
  id: Type.Integer(),
  org_id: Type.Integer(),
  email: Type.String(),
  role: Type.Union([
    Type.Literal("owner"),
    Type.Literal("admin"),
    Type.Literal("manager"),
    Type.Literal("viewer"),
  ]),
  status: Type.Union([Type.Literal("invited"), Type.Literal("active"), Type.Literal("disabled")]),
  created_at: Type.String(),
});

const ResponseSchema = Type.Object({
  ok: Type.Literal(true),
  users: Type.Array(UserSchema),
});

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { orgId?: number } }>("/", {
    schema: {
      tags: ["users"],
      security: [{ cookieAuth: [] }],
      querystring: QuerySchema,
      response: { 200: ResponseSchema },
    },
    preHandler: [requireAuth, requireRole(["owner", "admin", "manager"]), requireOrgAccess({ source: "query" })],
    handler: async (req) => {
      const orgId = resolveOrgIdFromRequest(req, { source: "query" });
      const users = await listUsersByOrg(app, orgId);
      return { ok: true as const, users };
    },
  });
};

export default usersRoutes;
