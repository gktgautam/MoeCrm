import type { FastifyInstance } from "fastify";
import { Errors } from "@/core/http/app-error";

export type RoleListItem = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  permissions: string[];
};

export async function listRoles(app: FastifyInstance): Promise<RoleListItem[]> {
  const { rows } = await app.dbEngage.query<RoleListItem & { permissions: string[] | null }>(
    `
      select
        r.id,
        r.key,
        r.name,
        r.description,
        r.is_system,
        r.created_at::text,
        r.updated_at::text,
        coalesce(array_agg(p.key order by p.key) filter (where p.key is not null), '{}') as permissions
      from app_roles r
      left join app_role_permissions rp on rp.role_id = r.id
      left join app_permissions p on p.id = rp.permission_id
      group by r.id
      order by r.is_system desc, r.name asc
      limit 200
    `,
  );

  return rows.map((row) => ({ ...row, permissions: row.permissions ?? [] }));
}

export async function createRole(args: { app: FastifyInstance; key: string; name: string; description?: string }) {
  try {
    const { rows } = await args.app.dbEngage.query<RoleListItem>(
      `
      insert into app_roles (org_id, key, name, description, is_system)
      values (1, $1, $2, $3, false)
      returning id, key, name, description, is_system, created_at::text, updated_at::text,
      '{}'::text[] as permissions
      `,
      [args.key, args.name, args.description ?? null],
    );

    return rows[0];
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "23505") throw Errors.conflict("Role key already exists");
    throw error;
  }
}

async function getRoleById(args: { app: FastifyInstance; roleId: number }) {
  const { rows } = await args.app.dbEngage.query<{ id: number; is_system: boolean; key: string }>(
    `select id, is_system, key from app_roles where id = $1 limit 1`,
    [args.roleId],
  );

  return rows[0];
}

export async function updateRole(args: {
  app: FastifyInstance;
  roleId: number;
  key?: string;
  name?: string;
  description?: string | null;
}) {
  const role = await getRoleById(args);
  if (!role) throw Errors.notFound("Role not found");

  if (role.is_system && typeof args.key === "string" && args.key !== role.key) {
    throw Errors.forbidden("System role key cannot be modified");
  }

  try {
    const { rows } = await args.app.dbEngage.query<RoleListItem>(
      `
      update app_roles
      set
        key = coalesce($1, key),
        name = coalesce($2, name),
        description = coalesce($3, description),
        updated_at = now()
      where id = $4
      returning id, key, name, description, is_system, created_at::text, updated_at::text,
      coalesce((
        select array_agg(p.key order by p.key)
        from app_role_permissions rp
        join app_permissions p on p.id = rp.permission_id
        where rp.role_id = app_roles.id
      ), '{}'::text[]) as permissions
      `,
      [args.key ?? null, args.name ?? null, args.description ?? null, args.roleId],
    );

    return rows[0];
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "23505") throw Errors.conflict("Role key already exists");
    throw error;
  }
}

export async function replaceRolePermissions(args: { app: FastifyInstance; roleId: number; permissionIds: number[] }) {
  const role = await getRoleById(args);
  if (!role) throw Errors.notFound("Role not found");

  const { rows: permissionRows } = await args.app.dbEngage.query<{ id: number }>(
    `select id from app_permissions where id = any($1::int[]) limit 500`,
    [args.permissionIds],
  );

  if (permissionRows.length !== args.permissionIds.length) {
    throw Errors.badRequest("One or more permissions are invalid");
  }

  await args.app.dbEngage.query("delete from app_role_permissions where role_id = $1", [args.roleId]);

  if (args.permissionIds.length > 0) {
    await args.app.dbEngage.query(
      `insert into app_role_permissions (role_id, permission_id)
       select $1, unnest($2::int[])
       on conflict do nothing`,
      [args.roleId, args.permissionIds],
    );
  }

  return updateRole({ app: args.app, roleId: args.roleId });
}
