import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import { ErrorResponseSchema } from "@/core/http/error-response";
import { signupBodySchema, loginBodySchema, meResponseSchema, EmptySuccessResponseSchema } from "./auth.schemas";
import { authController } from "./auth.controller";
import { requireAuth } from "./auth.guard";

 
const authRoutes: FastifyPluginAsync = async (app) => {

   const ctrl = authController(app);
 
   // Add default tags to all routes in this plugin
  app.addHook("onRoute", (routeOptions) => {
    routeOptions.schema = routeOptions.schema ?? {};
    routeOptions.schema.tags = [
      ...(routeOptions.schema.tags ?? []),
      "auth",
    ];
  });

  app.post("/signup", {
    schema: {
      body: signupBodySchema,
      response: {
        200: EmptySuccessResponseSchema,
        400: ErrorResponseSchema,
        409: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: ctrl.signup,
  });

  app.post("/login", {
    schema: {
      body: loginBodySchema,
      response: {
        200: EmptySuccessResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: ctrl.login,
  });

  app.get("/me", {
    schema: {
      security: [{ cookieAuth: [] }],
      response: {
        200: meResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    preHandler: requireAuth,
    handler: ctrl.me,
  });

  app.post("/logout", {
    schema: {
      response: { 200: EmptySuccessResponseSchema },
    },
    handler: ctrl.logout,
  });
};

export default authRoutes;
