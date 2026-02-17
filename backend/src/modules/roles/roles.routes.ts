import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { ErrorResponseSchema } from "@/core/http/error-response";
import { requireAuth, requirePermission } from "../auth/auth.guard";
import { createRole, listRolesByOrg, replaceRolePermissions, updateRole } from "./roles.service";

const RoleSchema = Type.Object({
  id: Type.Integer(),
  key: Type.String(),
  name: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  is_system: Type.Boolean(),
  created_at: Type.String(),
  updated_at: Type.String(),
  permissions: Type.Array(Type.String()),
});

const IdParamSchema = Type.Object({ id: Type.Integer({ minimum: 1 }) });

const CreateRoleBodySchema = Type.Object({
  key: Type.String({ minLength: 2, maxLength: 80 }),
  name: Type.String({ minLength: 2, maxLength: 120 }),
  description: Type.Optional(Type.String({ maxLength: 500 })),
});

const UpdateRoleBodySchema = Type.Object({
  key: Type.Optional(Type.String({ minLength: 2, maxLength: 80 })),
  name: Type.Optional(Type.String({ minLength: 2, maxLength: 120 })),
  description: Type.Optional(Type.Union([Type.String({ maxLength: 500 }), Type.Null()])),
});

const ReplaceRolePermissionsBodySchema = Type.Object({
  permissionIds: Type.Array(Type.Integer({ minimum: 1 }), { maxItems: 500 }),
});

const rolesRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", {
    schema: {
      tags: ["roles"],
      security: [{ cookieAuth: [] }],
      response: {
        200: Type.Object({ ok: Type.Literal(true), data: Type.Object({ roles: Type.Array(RoleSchema) }) }),
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [requireAuth, requirePermission({ anyOf: ["roles:read", "users:manage"] })],
    handler: async (req) => {
      const roles = await listRolesByOrg(app);
      return { ok: true as const, data: { roles } };
    },
  });

  app.post<{ Body: { key: string; name: string; description?: string } }>("/", {
    schema: {
      tags: ["roles"],
      security: [{ cookieAuth: [] }],
      body: CreateRoleBodySchema,
      response: {
        200: Type.Object({ ok: Type.Literal(true), data: Type.Object({ role: RoleSchema }) }),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [requireAuth, requirePermission({ anyOf: ["roles:manage"] })],
    handler: async (req) => {
      const role = await createRole({
        app,
        key: req.body.key.trim().toLowerCase(),
        name: req.body.name.trim(),
        description: req.body.description?.trim(),
      });
      return { ok: true as const, data: { role } };
    },
  });

  app.patch<{ Params: { id: number }; Body: { key?: string; name?: string; description?: string | null } }>(
    "/:id",
    {
      schema: {
        tags: ["roles"],
        security: [{ cookieAuth: [] }],
        params: IdParamSchema,
        body: UpdateRoleBodySchema,
        response: {
          200: Type.Object({ ok: Type.Literal(true), data: Type.Object({ role: RoleSchema }) }),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
          409: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
      preHandler: [requireAuth, requirePermission({ anyOf: ["roles:manage"] })],
      handler: async (req) => {
        const role = await updateRole({
          app,
            roleId: req.params.id,
          key: req.body.key?.trim().toLowerCase(),
          name: req.body.name?.trim(),
          description: typeof req.body.description === "string" ? req.body.description.trim() : req.body.description,
        });
        return { ok: true as const, data: { role } };
      },
    },
  );

  app.put<{ Params: { id: number }; Body: { permissionIds: number[] } }>("/:id/permissions", {
    schema: {
      tags: ["roles"],
      security: [{ cookieAuth: [] }],
      params: IdParamSchema,
      body: ReplaceRolePermissionsBodySchema,
      response: {
        200: Type.Object({ ok: Type.Literal(true), data: Type.Object({ role: RoleSchema }) }),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [requireAuth, requirePermission({ anyOf: ["roles:manage"] })],
    handler: async (req) => {
      const permissionIds = [...new Set(req.body.permissionIds)];
      const role = await replaceRolePermissions({
        app,
        roleId: req.params.id,
        permissionIds,
      });
      return { ok: true as const, data: { role } };
    },
  });
};

export default rolesRoutes;
