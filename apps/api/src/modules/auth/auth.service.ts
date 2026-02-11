// src/modules/auth/auth.service.ts
import argon2 from "argon2";
import type { Pool } from "pg";

export async function createAppUser(params: {
  db: Pool;
  orgId: number;
  email: string;
  password: string;
  role?: "owner" | "admin" | "manager" | "viewer";
}) {
  const role = params.role ?? "owner";
  const passwordHash = await argon2.hash(params.password);

  const { rows } = await params.db.query(
    `
    insert into app_users (org_id, email, password_hash, status, role, auth_provider)
    values ($1, $2, $3, 'active', $4, 'password')
    returning id, org_id, email, role, status
    `,
    [params.orgId, params.email, passwordHash, role]
  );

  return rows[0];
}

export async function verifyLogin(params: {
  db: Pool;
  orgId: number;
  email: string;
  password: string;
}) {
  const { rows } = await params.db.query(
    `
    select id, org_id, email, password_hash, role, status
    from app_users
    where org_id = $1 and lower(email) = lower($2)
      and deleted_at is null
    limit 1
    `,
    [params.orgId, params.email]
  );

  const user = rows[0];
  if (!user) return null;
  if (user.status !== "active") return null;
  if (!user.password_hash) return null;

  const ok = await argon2.verify(user.password_hash, params.password);
  if (!ok) return null;

  params.db
    .query(`update app_users set last_login_at = now() where id = $1`, [user.id])
    .catch(() => {});

  return user;
}
