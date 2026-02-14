exports.up = async function up(knex) {
  await knex.schema.alterTable("app_roles", (t) => {
    t.bigInteger("org_id").nullable().index();
  });

  // system roles are org-agnostic (org_id NULL); custom roles are org-scoped (org_id NOT NULL)
  await knex.schema.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS app_roles_unique_system_key
    ON app_roles (key)
    WHERE org_id IS NULL;
  `);

  await knex.schema.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS app_roles_unique_org_key
    ON app_roles (org_id, key)
    WHERE org_id IS NOT NULL;
  `);

  await knex.schema.raw(`
    ALTER TABLE app_roles
    DROP CONSTRAINT IF EXISTS app_roles_key_unique;
  `);

  await knex.schema.createTable("app_user_roles", (t) => {
    t.bigInteger("user_id").notNullable().references("id").inTable("app_users").onDelete("CASCADE");
    t.integer("role_id").notNullable().references("id").inTable("app_roles").onDelete("CASCADE");
    t.primary(["user_id", "role_id"]);
  });

  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS app_user_roles_user_id_idx
    ON app_user_roles (user_id);
  `);

  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS app_user_roles_role_id_idx
    ON app_user_roles (role_id);
  `);

  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS app_role_permissions_role_id_idx
    ON app_role_permissions (role_id);
  `);

  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS app_role_permissions_permission_id_idx
    ON app_role_permissions (permission_id);
  `);

  await knex.schema.raw(`
    INSERT INTO app_user_roles (user_id, role_id)
    SELECT u.id, r.id
    FROM app_users u
    JOIN app_roles r
      ON r.key = u.role::text
     AND r.org_id IS NULL
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("app_user_roles");

  await knex.schema.raw(`DROP INDEX IF EXISTS app_roles_unique_org_key;`);
  await knex.schema.raw(`DROP INDEX IF EXISTS app_roles_unique_system_key;`);

  await knex.schema.raw(`
    DROP INDEX IF EXISTS app_role_permissions_role_id_idx;
  `);

  await knex.schema.raw(`
    DROP INDEX IF EXISTS app_role_permissions_permission_id_idx;
  `);

  // Best-effort rollback: this constraint restore can fail if duplicate keys were created while org-scoped roles existed.
  await knex.schema.raw(`
    ALTER TABLE app_roles
    ADD CONSTRAINT app_roles_key_unique UNIQUE (key);
  `);

  await knex.schema.alterTable("app_roles", (t) => {
    t.dropColumn("org_id");
  });
};
