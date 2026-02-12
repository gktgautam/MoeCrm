import type { FastifyPluginAsync } from "fastify";
import { signupBodySchema, loginBodySchema, meResponseSchema, OkResponse, ErrorResponse } from "./auth.schemas.js";
import { authController } from "./auth.controller.js";
import { requireAuth } from "./auth.guard.js";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/signup", {
    schema: {
      tags: ["auth"],
      body: signupBodySchema,
      response: { 200: OkResponse, 409: ErrorResponse, 500: ErrorResponse },
    },
    handler: authController.signup,
  });

  app.post("/login", {
    schema: {
      tags: ["auth"],
      body: loginBodySchema,
      response: { 200: OkResponse, 401: ErrorResponse, 500: ErrorResponse },
    },
    handler: authController.login,
  });

  app.get("/me", {
    schema: {
      tags: ["auth"],
      security: [{ cookieAuth: [] }],
      response: { 200: meResponseSchema, 401: ErrorResponse },
    },
    preHandler: requireAuth,
    handler: authController.me,
  });

  app.post("/logout", {
    schema: {
      tags: ["auth"],
      response: { 200: OkResponse },
    },
    handler: authController.logout,
  });

  return;
};

export default authRoutes;





// app.post("/v1/campaigns", {
//   preHandler: [requireAuth, requireRole(["owner", "admin", "manager"])],
//   handler: async () => ({ ok: true }),
// });