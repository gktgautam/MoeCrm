import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { ErrorResponseSchema } from "@/core/http/error-response";
import { signupBodySchema, loginBodySchema, meResponseSchema } from "./auth.schemas.js";
import { authController } from "./auth.controller.js";
import { requireAuth } from "./auth.guard.js";

const EmptySuccessResponseSchema = Type.Object({
  ok: Type.Literal(true),
  data: Type.Object({}),
});

const LoginResponseSchema = Type.Object({
  ok: Type.Literal(true),
  data: Type.Object({
    token: Type.String(),
  }),
});

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/signup", {
    schema: {
      tags: ["auth"],
      body: signupBodySchema,
      response: {
        200: EmptySuccessResponseSchema,
        400: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: authController.signup,
  });

  app.post("/login", {
    schema: {
      tags: ["auth"],
      body: loginBodySchema,
      response: {
        200: LoginResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: authController.login,
  });

  app.get("/me", {
    schema: {
      tags: ["auth"],
      security: [{ cookieAuth: [] }],
      response: {
        200: meResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: requireAuth,
    handler: authController.me,
  });

  app.post("/logout", {
    schema: {
      tags: ["auth"],
      response: { 200: EmptySuccessResponseSchema },
    },
    handler: authController.logout,
  });
};

export default authRoutes;
