import type { FastifyReply, FastifyRequest } from "fastify";
import { Errors } from "@/core/http/app-error";
import type { SignupBody, LoginBody } from "./auth.schemas.js";
import { fetchPermissionsForRole } from "./auth.permissions.js";
import { resolveAllowedRoutes } from "./auth.route-access.js";
import { createAppUser, verifyLogin } from "./auth.service.js";

export const authController = {
  signup: async (req: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply) => {
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
    return { ok: true, data: {} };
  },

  login: async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    const { email, password } = req.body;
    const orgId = 1;
    const user = await verifyLogin({
      db: req.server.dbEngage,
      orgId,
      email,
      password,
    });

    if (!user) {
      throw Errors.invalidCredentials();
    }

    const token = req.server.signAuthToken({
      sub: String(user.id),
      orgId: String(user.org_id),
      role: user.role,
    });
    req.server.setAuthCookie(reply, token);

    return reply.code(200).send({ ok: true, data: { token } });
  },

  me: async (req: FastifyRequest) => {
    if (!req.auth) throw Errors.unauthorized();

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
    if (!user) throw Errors.unauthorized();

    const permissions = await fetchPermissionsForRole(req.server, user.role);
    const allowedRoutes = resolveAllowedRoutes(permissions);

    return {
      ok: true,
      data: {
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
      },
    };
  },

  logout: async (_req: FastifyRequest, reply: FastifyReply) => {
    _req.server.clearAuthCookie(reply);
    return { ok: true, data: {} };
  },
};
