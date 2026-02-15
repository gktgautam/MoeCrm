exports.up = async function up(knex) {
  await knex.raw(
    `
    insert into app_permissions (key, module, action, description)
    values
      ('roles:read', 'roles', 'read', 'View roles and permissions'),
      ('roles:manage', 'roles', 'manage', 'Create and edit roles and role permissions')
    on conflict (key) do nothing
    `,
  );
};

exports.down = async function down(knex) {
  await knex("app_permissions").whereIn("key", ["roles:read", "roles:manage"]).del();
};
