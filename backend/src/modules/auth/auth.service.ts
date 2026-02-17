import { Errors } from "@/core/http/app-error";
import argon2 from "argon2";
import type { AppRole } from "./auth.types.js";

export const authService = {
  resolveRoleId: async (db: any, role: AppRole | undefined) => {
    const roleKey = role ?? "admin";
    const roleRes = await db.query(
      `
        select id
        from app_roles
        where key = $1
        limit 1
      `,
      [roleKey],
    );

    const roleRow = roleRes.rows[0] as { id: number } | undefined;
    if (!roleRow) throw Errors.badRequest("Invalid role");
    return roleRow.id;
  },

  createAppUser: async (args: { db: any; email: string; password: string; role?: AppRole }) => {
    const passwordHash = await argon2.hash(args.password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    const roleId = await authService.resolveRoleId(args.db, args.role);

    try {
      const res = await args.db.query(
        `
        insert into app_users (email, password_hash, role_id)
        values ($1, $2, $3)
        returning id, email, role_id
      `,
        [args.email.toLowerCase(), passwordHash, roleId],
      );

      return res.rows[0];
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === "23505") throw Errors.emailExists();
      throw error;
    }
  },

  verifyLogin: async (args: { db: any; email: string; password: string }) => {
    const res = await args.db.query(
      `
        select u.id, u.email, r.key as role, u.password_hash
        from app_users u
        join app_roles r on r.id = u.role_id
        where u.email = $1
        limit 1
      `,
      [args.email.toLowerCase()],
    );

    const user = res.rows[0];
    if (!user) return null;

    const ok = await argon2.verify(user.password_hash, args.password);
    if (!ok) return null;

    return { id: user.id, email: user.email, role: user.role };
  },
};
