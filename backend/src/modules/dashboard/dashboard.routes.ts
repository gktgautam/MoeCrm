import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { ErrorResponseSchema } from "@/core/http/error-response";
import { requireAuth, requirePermission } from "../auth/auth.guard";
import { fetchDashboardStats } from "./dashboard.service";
import { DASHBOARD_ROUTE_REQUIREMENT } from "../auth/auth.route-access";

const ResponseSchema = Type.Object({
  ok: Type.Literal(true),
  data:
  Type.Object({
    stats: Type.Object({
    users: Type.Integer(),
    segments: Type.Integer(),
    campaigns: Type.Integer(),
    contacts: Type.Integer(),
    }),
  }),
});

const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get("/stats", {
    schema: {
      tags: ["dashboard"],
      security: [{ cookieAuth: [] }],
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
      requirePermission(DASHBOARD_ROUTE_REQUIREMENT),
    ],
    handler: async (req) => {
      const stats = await fetchDashboardStats(app);
      return { ok: true as const, data: { stats } };
    },
  });
};

export default dashboardRoutes;
