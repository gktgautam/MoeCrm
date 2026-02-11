// src/modules/auth/auth.routes.ts
import type { FastifyPluginAsync } from "fastify";
import { SignupBody, LoginBody, OkResponse, ErrorResponse, MeResponse } from "./auth.schemas.js";
import { createAppUser, verifyLogin } from "./auth.service.js";
import { requireAuth } from "./auth.guard.js";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/signup", {
    schema: {
      tags: ["auth"],
      body: SignupBody,
      response: {
        200: OkResponse,
        409: ErrorResponse,
        500: ErrorResponse,
      },
    },
    handler: async (req: any, reply) => {
      const body = req.body as any;

      try {
        const user = await createAppUser({
          db: app.dbEngage,
          orgId: body.orgId,
          email: body.email,
          password: body.password,
          role: body.role,
        });

        const token = app.signAuthToken({
          sub: String(user.id),
          orgId: String(user.org_id),
          role: user.role,
        });

        app.setAuthCookie(reply, token);
        return { ok: true };
      } catch (err: any) {
        if (err?.code === "23505") return reply.code(409).send({ ok: false, error: "EMAIL_EXISTS" });
        app.log.error({ err }, "signup failed");
        return reply.code(500).send({ ok: false, error: "SERVER_ERROR" });
      }
    },
  });

  app.post("/login", {
    schema: {
      tags: ["auth"],
      body: LoginBody,
      response: {
        200: OkResponse,
        401: ErrorResponse,
      },
    },
    handler: async (req: any, reply) => {
      const body = req.body as any;

      const user = await verifyLogin({
        db: app.dbEngage,
        orgId: body.orgId,
        email: body.email,
        password: body.password,
      });

      if (!user) return reply.code(401).send({ ok: false, error: "INVALID_CREDENTIALS" });

      const token = app.signAuthToken({
        sub: String(user.id),
        orgId: String(user.org_id),
        role: user.role,
      });

      app.setAuthCookie(reply, token);
      return { ok: true };
    },
  });

  app.get("/me", {
    schema: {
      tags: ["auth"],
      security: [{ cookieAuth: [] }],
      response: { 200: MeResponse, 401: ErrorResponse },
    },
    preHandler: requireAuth,
    handler: async (req: any) => {
      return { ok: true, auth: req.auth };
    },
  });

  app.post("/logout", {
    schema: {
      tags: ["auth"],
      response: { 200: OkResponse },
    },
    handler: async (_req, reply) => {
      app.clearAuthCookie(reply);
      return { ok: true };
    },
  });
};

export default authRoutes;
