import argon2 from "argon2";

export async function createAppUser(args: {
  db: any;
  orgId: number;
  email: string;
  password: string;
  role?: "owner" | "admin" | "manager" | "viewer";
}) {
  const passwordHash = await argon2.hash(args.password, {
    type: argon2.argon2id,      // best variant
    memoryCost: 19456,         // ~19MB (safe default)
    timeCost: 2,
    parallelism: 1,
  });

  const res = await args.db.query(
    `
      insert into app_users (org_id, email, password_hash, role)
      values ($1, $2, $3, coalesce($4, 'owner'))
      returning id, org_id, email, role
    `,
    [args.orgId, args.email.toLowerCase(), passwordHash, args.role ?? null]
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
    `select id, org_id, email, role, password_hash from app_users where org_id = $1 and email = $2 limit 1`,
    [args.orgId, args.email.toLowerCase()]
  );

  const user = res.rows[0];
  if (!user) return null;

  const ok = await argon2.verify(user.password_hash, args.password);
  if (!ok) return null;

  return { id: user.id, org_id: user.org_id, email: user.email, role: user.role };
}
