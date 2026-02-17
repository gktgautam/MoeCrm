const argon2 = require("argon2");

exports.seed = async function seed(knex) {
  const permissions = [
    { key: "segments:read", module: "segments", action: "read", description: "View segments" },
    { key: "segments:write", module: "segments", action: "write", description: "Create/edit segments" },
    { key: "campaigns:read", module: "campaigns", action: "read", description: "View campaigns" },
    { key: "campaigns:write", module: "campaigns", action: "write", description: "Create/edit campaigns" },
    { key: "campaigns:send", module: "campaigns", action: "send", description: "Send campaigns" },
    { key: "analytics:read", module: "analytics", action: "read", description: "View analytics" },
    { key: "analytics:write", module: "analytics", action: "write", description: "Export analytics" },
    { key: "templates:read", module: "templates", action: "read", description: "View templates" },
    { key: "templates:write", module: "templates", action: "write", description: "Create/edit templates" },
    { key: "products:read", module: "products", action: "read", description: "View products" },
    { key: "products:write", module: "products", action: "write", description: "Create/edit products" },
    { key: "users:read", module: "users", action: "read", description: "View users" },
    { key: "users:write", module: "users", action: "write", description: "Invite/disable users" },
    { key: "roles:read", module: "roles", action: "read", description: "View roles" },
    { key: "roles:write", module: "roles", action: "write", description: "Manage roles + grants" },
    { key: "settings:read", module: "settings", action: "read", description: "View settings" },
    { key: "settings:write", module: "settings", action: "write", description: "Change settings" },
    { key: "billing:read", module: "billing", action: "read", description: "View billing" },
    { key: "billing:write", module: "billing", action: "write", description: "Manage billing" },
    { key: "logs:read", module: "logs", action: "read", description: "View delivery/system logs" },
    { key: "logs:write", module: "logs", action: "write", description: "Pause/stop runs, ops actions" },
    { key: "integrations:read", module: "integrations", action: "read", description: "View integrations" },
    { key: "integrations:write", module: "integrations", action: "write", description: "Manage API keys/webhooks" },
  ];

  for (const p of permissions) {
    await knex("app_permissions").insert(p).onConflict("key").ignore();
  }

  const roles = [
    { key: "admin", name: "Admin", description: "Everything (settings, billing, users)", is_system: true },
    { key: "marketer", name: "Marketer", description: "Campaigns + segments", is_system: true },
    { key: "analyst", name: "Analyst", description: "Analytics + exports", is_system: true },
    { key: "viewer", name: "Viewer", description: "Read-only dashboards (no export)", is_system: true },
    { key: "support", name: "Support/Ops", description: "Logs + pause/stop (optional)", is_system: true },
    { key: "developer", name: "Developer", description: "Integrations/API keys", is_system: true },
  ];

  for (const r of roles) {
    await knex("app_roles").insert(r).onConflict(["key"]).ignore();
  }

  const roleRows = await knex("app_roles").select(["id", "key"]);
  const permRows = await knex("app_permissions").select(["id", "key"]);

  const roleIdByKey = Object.fromEntries(roleRows.map((r) => [r.key, r.id]));
  const permIdByKey = Object.fromEntries(permRows.map((p) => [p.key, p.id]));

  const grant = async (roleKey, permKeys) => {
    const roleId = roleIdByKey[roleKey];
    for (const pk of permKeys) {
      const pid = permIdByKey[pk];
      if (!roleId || !pid) continue;
      await knex("app_role_permissions")
        .insert({ role_id: roleId, permission_id: pid })
        .onConflict(["role_id", "permission_id"])
        .ignore();
    }
  };

  await grant("admin", Object.keys(permIdByKey));
  await grant("marketer", ["segments:read", "segments:write", "campaigns:read", "campaigns:write", "campaigns:send", "analytics:read", "logs:read"]);
  await grant("analyst", ["analytics:read", "campaigns:read", "segments:read"]);
  await grant("viewer", ["analytics:read", "campaigns:read", "segments:read"]);
  await grant("support", ["campaigns:read", "logs:read", "logs:write", "segments:read"]);
  await grant("developer", ["integrations:read", "integrations:write", "logs:read"]);

  const email = "gautam.kumar@equentis.com";
  const existing = await knex("app_users").where({ email }).first("id");

  if (!existing) {
    const passwordHash = await argon2.hash("Password@123");
    await knex("app_users").insert({
      email,
      first_name: "Gautam",
      last_name: "Kumar",
      display_name: "Admin User",
      auth_provider: "password",
      password_hash: passwordHash,
      role_id: roleIdByKey.admin,
      status: "active",
      invited_at: knex.fn.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }
};

exports.down = async function down(knex) {
  await knex("app_users").del();
  await knex("app_role_permissions").del();
  await knex("app_roles").del();
  await knex("app_permissions").del();
};
