import type { FastifyReply, FastifyRequest } from "fastify";
import { BaseController } from "@/core/http/BaseController";
import { Errors } from "@/core/http/app-error";
import type { SignupBody, LoginBody } from "./auth.schemas";
import { getPermissionsForUser, getRoleKeyForUser } from "./auth.permissions";
import { resolveAllowedRoutes } from "./auth.route-access";
import { createAppUser, verifyLogin } from "./auth.service";

class AuthController extends BaseController {
  signup = async (req: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply) => {
    const user = await createAppUser({
      db: req.server.dbEngage,
      orgId: req.body.orgId,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role,
    });

    const roleKey = await getRoleKeyForUser(req.server, user.id, user.org_id);
    if (!roleKey) {
      throw Errors.unauthorized();
    }

    const token = req.server.signAuthToken({
      userId: String(user.id),
      orgId: String(user.org_id),
      role: roleKey,
    });

    req.server.setAuthCookie(reply, token);
    return this.sendOk(reply, { data: {} });
  };

  login = async (req: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
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
      userId: String(user.id),
      orgId: String(user.org_id),
      role: user.role,
    });
    req.server.setAuthCookie(reply, token);

    return this.sendOk(reply, { data: {} });
  };

  me = async (req: FastifyRequest) => {
    const userId = Number(req.auth?.userId);
    const orgId = Number(req.auth?.orgId);

    const { rows } = await req.server.dbEngage.query(
      `
      select u.id, u.org_id, u.email, u.first_name, u.last_name, u.status, r.key as role
      from app_users u
      join app_roles r on r.id = u.role_id
      where u.id = $1 and u.org_id = $2
      limit 1
      `,
      [userId, orgId],
    );

    const user = rows[0];
    if (!user) throw Errors.unauthorized();

    const role = user.role;
    const permissions = await getPermissionsForUser(req.server, user.id, user.org_id);
    const allowedRoutes = resolveAllowedRoutes(permissions);

    return {
      ok: true,
      user: {
        id: user.id,
        orgId: user.org_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role,
        status: user.status,
      },
      role,
      permissions,
      allowedRoutes,
    };
  };

  logout = async (req: FastifyRequest, reply: FastifyReply) => {
    req.server.clearAuthCookie(reply);
    return this.sendOk(reply, { data: {} });
  };
}

export const authController = new AuthController();
