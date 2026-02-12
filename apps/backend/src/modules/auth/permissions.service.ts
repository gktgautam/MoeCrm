export async function resolveEffectivePermissions(db: any, args: { orgId: number; userId: number; roleCode: string }) {
  const roleResult = await db.query(
    `
      select id
      from app_roles
      where code = $1
        and (org_id = $2 or org_id is null)
      order by case when org_id = $2 then 0 else 1 end
      limit 1
    `,
    [args.roleCode, args.orgId],
  );

  const roleId = roleResult.rows[0]?.id as number | undefined;
  const baseRows: { rows: Array<{ permission_code: string }> } = roleId
    ? await db.query(
        `select permission_code from app_role_permissions where role_id = $1`,
        [roleId],
      )
    : { rows: [] };

  const overrideRows: { rows: Array<{ permission_code: string; is_allowed: boolean }> } = await db.query(
    `select permission_code, is_allowed from app_user_permission_overrides where user_id = $1`,
    [args.userId],
  );

  const perms = new Set(baseRows.rows.map((r: { permission_code: string }) => r.permission_code));
  for (const row of overrideRows.rows) {
    if (row.is_allowed) perms.add(row.permission_code);
    else perms.delete(row.permission_code);
  }

  return [...perms].sort();
}
