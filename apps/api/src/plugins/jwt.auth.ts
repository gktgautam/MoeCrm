// src/plugins/jwt.auth.ts
import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthTokenPayload;
  }
  interface FastifyInstance {
    signAuthToken(payload: AuthTokenPayload): string;
    setAuthCookie(reply: any, token: string): void;
    clearAuthCookie(reply: any): void;
  }
}

export type AuthTokenPayload = {
  sub: string; // user id
  orgId: string;
  role: "owner" | "admin" | "manager" | "viewer";
};

export default fp(async (app) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");

  await app.register(jwt, { secret });

  const cookieName = "ee_auth";
  const isProd = process.env.NODE_ENV === "production";

  app.decorate("signAuthToken", (payload: AuthTokenPayload) => {
    return app.jwt.sign(payload, { expiresIn: "7d" });
  });

  app.decorate("setAuthCookie", (reply: any, token: string) => {
    reply.setCookie(cookieName, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 60 * 60 * 24 * 7,
    });
  });

  app.decorate("clearAuthCookie", (reply: any) => {
    reply.clearCookie(cookieName, { path: "/" });
  });

  // Parse JWT from cookie into req.auth (best-effort)
  app.addHook("preHandler", async (req) => {
    const token = (req.cookies as any)?.[cookieName];
    if (!token) return;
    try {
      req.auth = app.jwt.verify(token) as AuthTokenPayload;
    } catch {
      // ignore invalid cookie; guards handle it
    }
  });
});
