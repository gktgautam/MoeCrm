import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { ErrorResponseSchema } from "@/core/http/error-response";
import { requireAuth, requirePermission } from "../auth/auth.guard";
import { createUserInOrg, listUsersByOrg, updateUserInOrg } from "./users.controller";

const UserSchema = Type.Object({
  id: Type.Integer(),
  email: Type.String(),
  role: Type.String(),
  status: Type.Union([Type.Literal("invited"), Type.Literal("active"), Type.Literal("disabled")]),
  created_at: Type.String(),
});

const CreateUserBodySchema = Type.Object({
  email: Type.String({ format: "email" }),
  role_id: Type.Integer({ minimum: 1 }),
  status: Type.Optional(Type.Union([Type.Literal("invited"), Type.Literal("active"), Type.Literal("disabled")])),
});

const UpdateUserBodySchema = Type.Object({
  role_id: Type.Optional(Type.Integer({ minimum: 1 })),
  status: Type.Optional(Type.Union([Type.Literal("invited"), Type.Literal("active"), Type.Literal("disabled")])),
});

const ResponseSchema = Type.Object({
  ok: Type.Literal(true),
  data:
  Type.Object({
    users: Type.Array(UserSchema),
  }),
});

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", {
    schema: {
      tags: ["users"],
      security: [{ cookieAuth: [] }],
      response: {
        200: ResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [requireAuth, requirePermission({ anyOf: ["users:read"] })],
    handler: async (req) => {
      const users = await listUsersByOrg(app);
      return { ok: true as const, data: { users } };
    },
  });

  app.post<{ Body: { email: string; role_id: number; status?: "invited" | "active" | "disabled" } }>("/", {
    schema: {
      tags: ["users"],
      security: [{ cookieAuth: [] }],
      body: CreateUserBodySchema,
      response: {
        200: Type.Object({ ok: Type.Literal(true), data: Type.Object({ user: UserSchema }) }),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [requireAuth, requirePermission({ anyOf: ["users:manage"] })],
    handler: async (req) => {
      const user = await createUserInOrg({
        app,
        email: req.body.email.trim().toLowerCase(),
        role_id: req.body.role_id,
        status: req.body.status,
      });

      return { ok: true as const, data: { user } };
    },
  });

  app.patch<{ Params: { id: number }; Body: { role_id?: number; status?: "invited" | "active" | "disabled" } }>("/:id", {
    schema: {
      tags: ["users"],
      security: [{ cookieAuth: [] }],
      params: Type.Object({ id: Type.Integer({ minimum: 1 }) }),
      body: UpdateUserBodySchema,
      response: {
        200: Type.Object({ ok: Type.Literal(true), data: Type.Object({ user: UserSchema }) }),
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        403: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: [requireAuth, requirePermission({ anyOf: ["users:manage"] })],
    handler: async (req) => {
      const user = await updateUserInOrg({
        app,
        targetUserId: req.params.id,
        actorUserId: Number(req.auth!.userId),
        role_id: req.body.role_id,
        status: req.body.status,
      });

      return { ok: true as const, data: { user } };
    },
  });
};

export default usersRoutes;
