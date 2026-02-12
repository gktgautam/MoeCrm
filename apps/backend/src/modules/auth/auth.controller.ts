import type { FastifyReply, FastifyRequest } from "fastify";
import type { SignupBody, LoginBody } from "./auth.schemas.js";
import { createAppUser, verifyLogin } from "./auth.service.js";

export const authController = {
  signup: async (req: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply) => {
    try {
      const user = await createAppUser({
        db: req.server.dbEngage,
        orgId: req.body.orgId,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      });

      const token = req.server.signAuthToken({
        sub: String(user.id),
        orgId: String(user.org_id),
        role: user.role,
      });

      req.server.setAuthCookie(reply, token);
      return { ok: true };
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === "23505") {
        return reply.code(409).send({ ok: false, error: "EMAIL_EXISTS" });
      }
      req.log.error({ err: error }, "signup failed");
      return reply.code(500).send({ ok: false, error: "SERVER_ERROR" });
    }
  },

  login: async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    try {
      const user = await verifyLogin({
        db: req.server.dbEngage,
        orgId: req.body.orgId,
        email: req.body.email,
        password: req.body.password,
      });

      if (!user) {
        return reply.code(401).send({ ok: false, error: "INVALID_CREDENTIALS" });
      }

      const token = req.server.signAuthToken({
        sub: String(user.id),
        orgId: String(user.org_id),
        role: user.role,
      });

      req.server.setAuthCookie(reply, token);
      return { ok: true };
    } catch (error) {
      req.log.error({ err: error }, "login failed");
      return reply.code(500).send({ ok: false, error: "SERVER_ERROR" });
    }
  },

  me: async (req: FastifyRequest) => {
    return { ok: true, auth: req.auth };
  },

  logout: async (_req: FastifyRequest, reply: FastifyReply) => {
    _req.server.clearAuthCookie(reply);
    return { ok: true };
  },
};
