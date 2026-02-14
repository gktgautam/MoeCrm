import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyReply } from "fastify";
import { env } from "@/core/config/env";
export type AuthTokenPayload = {
  sub: string;
  orgId: string;
};

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthTokenPayload;
    authPermissions?: string[];
    authRoleKeys?: string[];
  }

  interface FastifyInstance {
    signAuthToken(payload: AuthTokenPayload): string;
    verifyAuthToken(token: string): AuthTokenPayload;

    setAuthCookie(reply: FastifyReply, token: string): void;
    clearAuthCookie(reply: FastifyReply): void;

    getAuthToken(req: any): string | null;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthTokenPayload;
    user: AuthTokenPayload;
  }
}

const AUTH_COOKIE_NAME = "ee_auth";

export default fp(async (app) => {
  await app.register(jwt, { secret: env.JWT_SECRET });

  app.decorate("signAuthToken", (payload: AuthTokenPayload) => {
    return app.jwt.sign(payload, { expiresIn: "7d" });
  });

  app.decorate("verifyAuthToken", (token: string) => {
    return app.jwt.verify<AuthTokenPayload>(token);
  });

  app.decorate("setAuthCookie", (reply: FastifyReply, token: string) => {
    reply.setCookie(AUTH_COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: env.ISPROD,
      maxAge: 60 * 60 * 24 * 7,
    });
  });

  app.decorate("clearAuthCookie", (reply: FastifyReply) => {
    reply.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  });

  app.decorate("getAuthToken", (req: any): string | null => {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
    if (cookieToken) return cookieToken;

    const auth = req.headers?.authorization;
    if (typeof auth === "string" && auth.startsWith("Bearer ")) {
      const token = auth.slice("Bearer ".length).trim();
      return token.length ? token : null;
    }

    return null;
  });

  app.addHook("preHandler", async (req) => {
    req.log.info({ cookies: req.cookies, authz: req.headers.authorization }, "auth preHandler start");

    const token = app.getAuthToken(req);
    req.log.info({ hasToken: !!token }, "auth token extracted");

    if (!token) return;

    try {
      req.auth = app.verifyAuthToken(token);
      req.log.info({ auth: req.auth }, "auth token verified");
    } catch (err) {
      req.log.warn({ err }, "auth token invalid");
      req.auth = undefined;
    }
  });
});
