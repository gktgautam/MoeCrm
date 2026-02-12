const argon2 = require("argon2");

exports.seed = async function seed(knex) {
  await knex("app_users").del();

  const passwordHash = await argon2.hash("Password@123");

  const adminRole = await knex("rbac_roles")
    .where({ org_id: null, role_key: "admin" })
    .select("id")
    .first();

  await knex("app_users").insert([
    {
      org_id: 1,
      email: "gautam.kumar@equentis.com",
      first_name: "Gautam",
      last_name: "Kumar",
      display_name: "Admin User",
      password_hash: passwordHash,
      auth_provider: "password",
      role_id: adminRole.id,
      status: "active",
      invited_at: knex.fn.now(),
      last_login_at: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
};
