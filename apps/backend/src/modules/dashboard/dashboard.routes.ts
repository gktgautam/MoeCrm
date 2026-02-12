import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { requireAuth, requireOrgAccess } from "../auth/auth.guard.js";
import { fetchDashboardStats } from "./dashboard.service.js";
import { resolveOrgIdFromRequest } from "../auth/org-access.js";

const QuerySchema = Type.Object({ orgId: Type.Optional(Type.Integer({ minimum: 1 })) });

const ResponseSchema = Type.Object({
  ok: Type.Literal(true),
  stats: Type.Object({
    users: Type.Integer(),
    segments: Type.Integer(),
    campaigns: Type.Integer(),
    contacts: Type.Integer(),
  }),
});

const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { orgId?: number } }>("/stats", {
    schema: {
      tags: ["dashboard"],
      security: [{ cookieAuth: [] }],
      querystring: QuerySchema,
      response: { 200: ResponseSchema },
    },
    preHandler: [requireAuth, requireOrgAccess({ source: "query" })],
    handler: async (req) => {
      const orgId = resolveOrgIdFromRequest(req, { source: "query" });
      const stats = await fetchDashboardStats(app, orgId);
      return { ok: true as const, stats };
    },
  });
};

export default dashboardRoutes;
