import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { ErrorResponseSchema } from "@/core/http/error-response";
import { requireAuth, requirePermission } from "../auth/auth.guard";

const PermissionSchema = Type.Object({
  id: Type.Integer(),
  key: Type.String(),
  module: Type.String(),
  action: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
});

const permissionsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", {
    schema: {
      tags: ["permissions"],
      security: [{ cookieAuth: [] }],
      response: {
        200: Type.Object({ ok: Type.Literal(true), data: Type.Object({ permissions: Type.Array(PermissionSchema) }) }),
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [requireAuth, requirePermission({ anyOf: ["roles:read", "users:read"] })],
    handler: async () => {
      const { rows } = await app.dbEngage.query(
        `
          select id, key, module, action, description
          from app_permissions
          order by module asc, action asc, key asc
          limit 500
        `,
      );

      return { ok: true as const, data: { permissions: rows } };
    },
  });
};

export default permissionsRoutes;
