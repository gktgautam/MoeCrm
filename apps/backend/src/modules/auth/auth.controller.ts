import type { FastifyReply, FastifyRequest } from "fastify";
import type { SignupBody, LoginBody } from "./auth.schemas.js";
import { fetchPermissionsForRole } from "./auth.permissions.js";
import { resolveAllowedRoutes } from "./auth.route-access.js";
import { createAppUser, verifyLogin } from "./auth.service.js";
import { sendApiError } from "@/app/http/error-handler";
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
        return sendApiError(reply, req.id, {
          statusCode: 409,
          code: "EMAIL_EXISTS",
          message: "Email is already registered",
          shouldLogAsError: false,
        });
      }
      req.log.error({ err: error, requestId: req.id }, "signup failed");
      return sendApiError(reply, req.id, {
        statusCode: 500,
        code: "SERVER_ERROR",
        message: "Unable to complete signup",
        shouldLogAsError: true,
      });
    }
  },

  login: async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    try {
      const { email, password } = req.body;
      const orgId = 1; // default
      const user = await verifyLogin({
        db: req.server.dbEngage,
        orgId,
        email,
        password,
      });

      if (!user) {
        req.log.warn({ requestId: req.id, email }, "login rejected due to invalid credentials");
        return sendApiError(reply, req.id, {
          statusCode: 401,
          code: "INVALID_CREDENTIALS",
          message: "Email or password is incorrect",
          shouldLogAsError: false,
        });
      }

      const token = req.server.signAuthToken({
        sub: String(user.id),
        orgId: String(user.org_id),
        role: user.role,
      });
      req.server.setAuthCookie(reply, token);

      return reply.code(200).send({ ok: true, token });
    } catch (err) {
      req.log.error({ err, requestId: req.id }, "login failed");
      return sendApiError(reply, req.id, {
        statusCode: 500,
        code: "SERVER_ERROR",
        message: "Unable to complete login",
        shouldLogAsError: true,
      });
    }
  },


  me: async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.auth) {
      return sendApiError(reply, req.id, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
        shouldLogAsError: false,
      });
    }
    const userId = Number(req.auth.sub);
    const orgId = Number(req.auth.orgId);

    const { rows } = await req.server.dbEngage.query(
      `
      select id, org_id, email, first_name, last_name, role, status
      from app_users
      where id = $1 and org_id = $2
      limit 1
      `,
      [userId, orgId]
    );

    const user = rows[0];
    if (!user) {
      req.log.warn({ requestId: req.id, userId, orgId }, "authenticated user not found");
      return sendApiError(reply, req.id, {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
        shouldLogAsError: false,
      });
    }

    const permissions = await fetchPermissionsForRole(req.server, user.role);
    const allowedRoutes = resolveAllowedRoutes(permissions);

    return {
      ok: true,
      user: {
        id: user.id,
        orgId: user.org_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
      },
      permissions,
      allowedRoutes,
    };
  },

  logout: async (_req: FastifyRequest, reply: FastifyReply) => {
    _req.server.clearAuthCookie(reply);
    return { ok: true };
  },
};
