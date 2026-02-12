import argon2 from "argon2";

export async function createAppUser(args: {
  db: any;
  orgId: number;
  email: string;
  password: string;
  roleKey?: string;
}) {
  const passwordHash = await argon2.hash(args.password, {
    type: argon2.argon2id,      // best variant
    memoryCost: 19456,         // ~19MB (safe default)
    timeCost: 2,
    parallelism: 1,
  });

  const res = await args.db.query(
    `
      insert into app_users (org_id, email, password_hash, role_id)
      values (
        $1,
        $2,
        $3,
        coalesce(
          (select id from rbac_roles where org_id = $1 and role_key = $4 limit 1),
          (select id from rbac_roles where org_id is null and role_key = $4 limit 1),
          (select id from rbac_roles where org_id is null and role_key = 'admin' limit 1)
        )
      )
      returning id, org_id, email,
        (select role_key from rbac_roles where id = app_users.role_id) as role
    `,
    [args.orgId, args.email.toLowerCase(), passwordHash, args.roleKey ?? null],
  );

  return res.rows[0];
}

export async function verifyLogin(args: {
  db: any;
  orgId: number;
  email: string;
  password: string;
}) {
  const res = await args.db.query(
    `
    select u.id, u.org_id, u.email, u.password_hash, r.role_key as role
    from app_users u
    join rbac_roles r on r.id = u.role_id
    where u.org_id = $1 and u.email = $2
    limit 1
    `,
    [args.orgId, args.email.toLowerCase()]
  );

  const user = res.rows[0];
  if (!user) return null;

  const ok = await argon2.verify(user.password_hash, args.password);
  if (!ok) return null;

  return { id: user.id, org_id: user.org_id, email: user.email, role: user.role };
}
