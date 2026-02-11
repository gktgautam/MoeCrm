import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyReply } from "fastify";
import { env } from "../config.env.js";

export type AuthTokenPayload = {
  sub: string;
  orgId: string;
  role: "owner" | "admin" | "manager" | "viewer";
};

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthTokenPayload;
  }

  interface FastifyInstance {
    signAuthToken(payload: AuthTokenPayload): string;
    setAuthCookie(reply: FastifyReply, token: string): void;
    clearAuthCookie(reply: FastifyReply): void;
  }
}

const AUTH_COOKIE_NAME = "ee_auth";

export default fp(async (app) => {
  await app.register(jwt, { secret: env.jwtSecret });

  app.decorate("signAuthToken", (payload: AuthTokenPayload) => {
    return app.jwt.sign(payload, { expiresIn: "7d" });
  });

  app.decorate("setAuthCookie", (reply: FastifyReply, token: string) => {
    reply.setCookie(AUTH_COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProd,
      maxAge: 60 * 60 * 24 * 7,
    });
  });

  app.decorate("clearAuthCookie", (reply: FastifyReply) => {
    reply.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  });

  app.addHook("preHandler", async (req) => {
    const token = req.cookies[AUTH_COOKIE_NAME];
    if (!token) return;

    try {
      req.auth = app.jwt.verify<AuthTokenPayload>(token);
    } catch {
      // Intentionally ignore invalid cookie and rely on auth guard.
    }
  });
});
