import type { FastifyPluginAsync } from "fastify";
import { ErrorResponse, LoginBody, MeResponse, OkResponse, SignupBody } from "./auth.schemas.js";
import { createAppUser, verifyLogin } from "./auth.service.js";
import { requireAuth } from "./auth.guard.js";

type SignupInput = {
  orgId: number;
  email: string;
  password: string;
  role?: "owner" | "admin" | "manager" | "viewer";
};

type LoginInput = {
  orgId: number;
  email: string;
  password: string;
};

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: SignupInput }>("/signup", {
    schema: {
      tags: ["auth"],
      body: SignupBody,
      response: { 200: OkResponse, 409: ErrorResponse, 500: ErrorResponse },
    },
    handler: async (req, reply) => {
      try {
        const user = await createAppUser({
          db: app.dbEngage,
          orgId: req.body.orgId,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role,
        });

        const token = app.signAuthToken({
          sub: String(user.id),
          orgId: String(user.org_id),
          role: user.role,
        });

        app.setAuthCookie(reply, token);
        return { ok: true };
      } catch (error) {
        const err = error as { code?: string };
        if (err.code === "23505") {
          return reply.code(409).send({ ok: false, error: "EMAIL_EXISTS" });
        }

        app.log.error({ err: error }, "signup failed");
        return reply.code(500).send({ ok: false, error: "SERVER_ERROR" });
      }
    },
  });

  app.post<{ Body: LoginInput }>("/login", {
    schema: {
      tags: ["auth"],
      body: LoginBody,
      response: { 200: OkResponse, 401: ErrorResponse },
    },
    handler: async (req, reply) => {
      const user = await verifyLogin({
        db: app.dbEngage,
        orgId: req.body.orgId,
        email: req.body.email,
        password: req.body.password,
      });

      if (!user) {
        return reply.code(401).send({ ok: false, error: "INVALID_CREDENTIALS" });
      }

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
    handler: async (req) => ({ ok: true, auth: req.auth }),
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
