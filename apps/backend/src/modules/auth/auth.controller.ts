import type { FastifyReply, FastifyRequest } from "fastify";
import type { SignupBody, LoginBody } from "./auth.schemas.js";
import { createAppUser, verifyLogin } from "./auth.service.js";

async function permissionsForRole(db: any, roleKey: string) {
  const { rows } = await db.query(
    `
      select p.key
      from app_role_permissions rp
      join app_roles r on r.id = rp.role_id
      join app_permissions p on p.id = rp.permission_id
      where r.key = $1
      order by p.key asc
    `,
    [roleKey],
  );

  return (rows as Array<{ key: string }>).map((row) => row.key);
}


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
      const { orgId, email, password } = req.body;

      const user = await verifyLogin({
        db: req.server.dbEngage,
        orgId,
        email,
        password,
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

      // helpful for API clients (optional)
      return reply.code(200).send({ ok: true, token });
    } catch (err) {
      req.log.error({ err }, "login failed");
      return reply.code(500).send({ ok: false, error: "SERVER_ERROR" });
    }
  },


  me: async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.auth) return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });

    
    const userId = Number(req.auth.sub);
    const orgId = Number(req.auth.orgId);

    // Engage DB se app user read (safe fields only)
    const { rows } = await req.server.dbEngage.query(
      `
      select id, org_id, email, first_name, last_name, role, status
      from app_users
      where id = $1 and org_id = $2
      limit 1
      `,
      [userId, orgId]
    );

    const u = rows[0];
    if (!u) return reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    const permissions = await permissionsForRole(req.server.dbEngage, u.role);
    return {
      ok: true,
      user: {
        id: u.id,
        orgId: u.org_id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role, // or use role from token; DB is source of truth better
        status: u.status,
      },
      permissions,
    };
  },

  logout: async (_req: FastifyRequest, reply: FastifyReply) => {
    _req.server.clearAuthCookie(reply);
    return { ok: true };
  },
};
