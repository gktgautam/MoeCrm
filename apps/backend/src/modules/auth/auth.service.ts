import argon2 from "argon2";
import type { Pool } from "pg";

export type AppUserRole = "owner" | "admin" | "manager" | "viewer";

type AuthUserRow = {
  id: number;
  org_id: number;
  email: string;
  password_hash: string | null;
  role: AppUserRole;
  status: "invited" | "active" | "disabled";
};

export async function createAppUser(params: {
  db: Pool;
  orgId: number;
  email: string;
  password: string;
  role?: AppUserRole;
}) {
  const role = params.role ?? "owner";
  const passwordHash = await argon2.hash(params.password);

  const { rows } = await params.db.query<Pick<AuthUserRow, "id" | "org_id" | "email" | "role" | "status">>(
    `
      insert into app_users (org_id, email, password_hash, status, role, auth_provider)
      values ($1, $2, $3, 'active', $4, 'password')
      returning id, org_id, email, role, status
    `,
    [params.orgId, params.email, passwordHash, role],
  );

  return rows[0];
}

export async function verifyLogin(params: {
  db: Pool;
  orgId: number;
  email: string;
  password: string;
}) {
  const { rows } = await params.db.query<AuthUserRow>(
    `
      select id, org_id, email, password_hash, role, status
      from app_users
      where org_id = $1 and lower(email) = lower($2)
        and deleted_at is null
      limit 1
    `,
    [params.orgId, params.email],
  );

  const user = rows[0];
  if (!user || user.status !== "active" || !user.password_hash) return null;

  const isValid = await argon2.verify(user.password_hash, params.password);
  if (!isValid) return null;

  void params.db.query(`update app_users set last_login_at = now() where id = $1`, [user.id]);
  return user;
}
