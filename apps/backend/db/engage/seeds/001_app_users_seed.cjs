// apps/api/src/db/seeds/engage/001_app_users_seed.cjs
const argon2 = require("argon2");

exports.seed = async function seed(knex) {
  // Clear existing (optional, for dev only)
  await knex("app_users").del();

  const passwordHash = await argon2.hash("Password@123"); // dev password
  const adminRole = await knex("app_roles").where({ org_id: 1, key: "admin" }).first("id");

  await knex("app_users").insert([
    {
      org_id: 1,
      email: "gautam.kumar@equentis.com",
      first_name: "Gautam",
      last_name: "Kumar",
      display_name: "Admin User",
      password_hash: passwordHash,
      auth_provider: "password",
      role: "admin",
      role_id: adminRole?.id ?? null,
      status: "active",
      invited_at: knex.fn.now(),
      last_login_at: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
};
