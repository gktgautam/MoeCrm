// src/plugins/jwt.auth.ts
import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyReply } from "fastify";
import { env } from "@/env";

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
    verifyAuthToken(token: string): AuthTokenPayload;

    setAuthCookie(reply: FastifyReply, token: string): void;
    clearAuthCookie(reply: FastifyReply): void;

    getAuthToken(req: any): string | null;
  }
}

// Optional but best TS DX if you use req.jwtVerify() later
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

  // ✅ One function to get token from cookie OR header
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

  // ✅ Global optional auth: sets req.auth if token exists + valid
  app.addHook("preHandler", async (req) => {
    const token = app.getAuthToken(req);
    if (!token) return;

    try {
      req.auth = app.verifyAuthToken(token);
    } catch {
      // ignore invalid token (optional auth behavior)
      req.auth = undefined;
    }
  });
});
