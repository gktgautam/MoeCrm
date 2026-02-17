import type { FastifyReply, FastifyRequest } from "fastify";
import { Errors } from "@/core/http/app-error";
import type { SignupBody, LoginBody } from "./auth.schemas";
import { getPermissionsForUser, getRoleKeyForUser } from "./auth.permissions";
import { resolveAllowedRoutes } from "./auth.route-access";
import { authService } from "./auth.service";

export const authController = {
  signup: async (req: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply) => {
    const user = await authService.createAppUser({
      db: req.server.dbEngage,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });

    const roleKey = await getRoleKeyForUser(req.server, user.id);
    if (!roleKey) throw Errors.unauthorized();

    const token = req.server.signAuthToken({ userId: String(user.id), role: roleKey });
    req.server.setAuthCookie(reply, token);
    return { ok: true, data: {} };
  },

  login: async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    const user = await authService.verifyLogin({ db: req.server.dbEngage, email: req.body.email, password: req.body.password });
    if (!user) throw Errors.invalidCredentials();

    const token = req.server.signAuthToken({ userId: String(user.id), role: user.role });
    req.server.setAuthCookie(reply, token);
    return reply.code(200).send({ ok: true, data: {} });
  },

  me: async (req: FastifyRequest) => {
    const userId = Number(req.auth?.userId);

    const { rows } = await req.server.dbEngage.query(
      `
      select u.id, u.email, u.first_name, u.last_name, u.status, r.key as role
      from app_users u
      join app_roles r on r.id = u.role_id
      where u.id = $1
      limit 1
      `,
      [userId],
    );

    const user = rows[0];
    if (!user) throw Errors.unauthorized();

    const permissions = await getPermissionsForUser(req.server, user.id);
    const allowedRoutes = resolveAllowedRoutes(permissions);

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
      },
      role: user.role,
      permissions,
      allowedRoutes,
    };
  },

  logout: async (_req: FastifyRequest, reply: FastifyReply) => {
    _req.server.clearAuthCookie(reply);
    return { ok: true, data: {} };
  },
};
