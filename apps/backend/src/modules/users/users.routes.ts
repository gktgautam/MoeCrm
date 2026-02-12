import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { requireAuth, requireRole } from "../auth/auth.guard.js";
import { listUsersByOrg } from "./users.controller.js";

const QuerySchema = Type.Object({
  orgId: Type.Integer({ minimum: 1 }),
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
  app.get<{ Querystring: { orgId: number } }>("/", {
    schema: {
      tags: ["users"],
      security: [{ cookieAuth: [] }],
      querystring: QuerySchema,
      response: { 200: ResponseSchema },
    },
    preHandler: [requireAuth, requireRole(["owner", "admin", "manager"])],
    handler: async (req) => {
      const users = await listUsersByOrg(app, req.query.orgId);
      return { ok: true as const, users };
    },
  });
};

export default usersRoutes;
