import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { requireAuth, requireOrgAccess, requireRole } from "../auth/auth.guard.js";
import { clearUserPermissionOverride, listUsersByOrg, upsertUserPermissionOverride } from "./users.controller.js";
import { resolveOrgIdFromRequest } from "../auth/org-access.js";

const QuerySchema = Type.Object({
  orgId: Type.Optional(Type.Integer({ minimum: 1 })),
});

const UserSchema = Type.Object({
  id: Type.Integer(),
  org_id: Type.Integer(),
  email: Type.String(),
  role: Type.String(),
  status: Type.Union([Type.Literal("invited"), Type.Literal("active"), Type.Literal("disabled")]),
  created_at: Type.String(),
});

const ResponseSchema = Type.Object({
  ok: Type.Literal(true),
  users: Type.Array(UserSchema),
});

const OverridePermissionBody = Type.Object({
  orgId: Type.Optional(Type.Integer({ minimum: 1 })),
  permissionCode: Type.String({ minLength: 1 }),
  action: Type.Union([Type.Literal("grant"), Type.Literal("revoke"), Type.Literal("reset")]),
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

  app.patch<{ Params: { userId: number }; Body: { permissionCode: string; action: "grant" | "revoke" | "reset" } }>("/:userId/permissions", {
    schema: {
      tags: ["users"],
      security: [{ cookieAuth: [] }],
      params: Type.Object({ userId: Type.Integer({ minimum: 1 }) }),
      body: OverridePermissionBody,
      response: { 200: Type.Object({ ok: Type.Literal(true) }) },
    },
    preHandler: [requireAuth, requireRole(["owner", "admin"]), requireOrgAccess({ source: "body" })],
    handler: async (req) => {
      const orgId = resolveOrgIdFromRequest(req, { source: "body" });
      const { userId } = req.params;
      const { permissionCode, action } = req.body;

      if (action === "reset") {
        await clearUserPermissionOverride({ app, orgId, userId, permissionCode });
      } else {
        await upsertUserPermissionOverride({
          app,
          orgId,
          userId,
          permissionCode,
          isAllowed: action === "grant",
        });
      }

      return { ok: true as const };
    },
  });
};

export default usersRoutes;
