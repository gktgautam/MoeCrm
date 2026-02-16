import type { FastifyInstance } from "fastify";
import { Errors } from "@/core/http/app-error";
import type { AppRole } from "../auth/auth.types";

export type AppUserListItem = {
  id: number;
  org_id: number;
  email: string;
  role: AppRole;
  status: "invited" | "active" | "disabled";
  created_at: string;
};

export async function listUsersByOrg(app: FastifyInstance, orgId: number): Promise<AppUserListItem[]> {
  const { rows } = await app.dbEngage.query<AppUserListItem>(
    `
      select u.id, u.org_id, u.email, r.key as role, u.status, u.created_at::text
      from app_users u
      join app_roles r on r.id = u.role_id
      where u.org_id = $1 and u.deleted_at is null
      order by u.created_at desc
      limit 200
    `,
    [orgId],
  );

  return rows;
}

export async function createUserInOrg(args: {
  app: FastifyInstance;
  orgId: number;
  email: string;
  role_id: number;
  status?: "invited" | "active" | "disabled";
}) {
  const { rows: roleRows } = await args.app.dbEngage.query(
    `select id from app_roles where id = $1 and org_id = $2 limit 1`,
    [args.role_id, args.orgId],
  );
  if (!roleRows[0]) throw Errors.badRequest("Role must belong to the same organization");

  try {
    const { rows } = await args.app.dbEngage.query<AppUserListItem>(
      `
      insert into app_users (org_id, email, role_id, status, invited_at)
      values ($1, $2, $3, $4, case when $4 = 'invited' then now() else null end)
      returning id, org_id, email,
      (select key from app_roles where id = role_id) as role,
      status,
      created_at::text
      `,
      [args.orgId, args.email.toLowerCase(), args.role_id, args.status ?? "invited"],
    );

    return rows[0];
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "23505") {
      throw Errors.emailExists();
    }
    throw error;
  }
}

export async function updateUserInOrg(args: {
  app: FastifyInstance;
  orgId: number;
  targetUserId: number;
  actorUserId: number;
  role_id?: number;
  status?: "invited" | "active" | "disabled";
}) {
  if (args.status === "disabled" && args.actorUserId === args.targetUserId) {
    throw Errors.forbidden("You cannot disable your own account");
  }

  if (typeof args.role_id === "number") {
    const { rows: roleRows } = await args.app.dbEngage.query(
      `select id from app_roles where id = $1 and org_id = $2 limit 1`,
      [args.role_id, args.orgId],
    );
    if (!roleRows[0]) throw Errors.badRequest("Role must belong to the same organization");
  }

  const { rows } = await args.app.dbEngage.query<AppUserListItem>(
    `
      update app_users u
      set
        role_id = coalesce($1, role_id),
        status = coalesce($2, status),
        updated_at = now()
      from app_roles r
      where u.id = $3
        and u.org_id = $4
        and r.id = coalesce($1, u.role_id)
      returning u.id, u.org_id, u.email, r.key as role, u.status, u.created_at::text
    `,
    [args.role_id ?? null, args.status ?? null, args.targetUserId, args.orgId],
  );

  if (!rows[0]) throw Errors.notFound("User not found");

  return rows[0];
}
