import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { requireAuth } from "../auth/auth.guard.js";
import { fetchDashboardStats } from "./dashboard.controller.js";

const QuerySchema = Type.Object({ orgId: Type.Integer({ minimum: 1 }) });

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
  app.get<{ Querystring: { orgId: number } }>("/stats", {
    schema: {
      tags: ["dashboard"],
      security: [{ cookieAuth: [] }],
      querystring: QuerySchema,
      response: { 200: ResponseSchema },
    },
    preHandler: requireAuth,
    handler: async (req) => {
      const stats = await fetchDashboardStats(app, req.query.orgId);
      return { ok: true as const, stats };
    },
  });
};

export default dashboardRoutes;
