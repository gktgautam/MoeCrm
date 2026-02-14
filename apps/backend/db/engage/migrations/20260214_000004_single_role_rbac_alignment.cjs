exports.up = async function up(knex) {
  await knex.schema.raw(`
    ALTER TABLE app_roles
      ADD COLUMN IF NOT EXISTS org_id bigint
  `);

  await knex.schema.raw(`
    UPDATE app_roles
    SET org_id = 1
    WHERE org_id IS NULL
  `);

  await knex.schema.raw(`
    ALTER TABLE app_roles
      ALTER COLUMN org_id SET NOT NULL
  `);

  await knex.schema.raw(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'app_roles_key_unique'
      ) THEN
        ALTER TABLE app_roles DROP CONSTRAINT app_roles_key_unique;
      END IF;
    END $$;
  `);

  await knex.schema.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS app_roles_org_id_key_uidx
      ON app_roles (org_id, key)
  `);

  await knex.schema.raw(`
    ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS role_id integer
  `);

  await knex.schema.raw(`
    UPDATE app_users u
    SET role_id = r.id
    FROM app_roles r
    WHERE u.role_id IS NULL
      AND r.org_id = u.org_id
      AND r.key = u.role::text
  `);

  await knex.schema.raw(`
    UPDATE app_users u
    SET role_id = r.id
    FROM app_roles r
    WHERE u.role_id IS NULL
      AND r.org_id = 1
      AND r.key = u.role::text
  `);

  await knex.schema.raw(`
    ALTER TABLE app_users
      ADD CONSTRAINT app_users_role_id_fkey
      FOREIGN KEY (role_id)
      REFERENCES app_roles(id)
      ON DELETE SET NULL
  `).catch(() => undefined);

  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS app_users_role_id_idx
      ON app_users (role_id)
  `);

  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS app_users_org_id_role_id_idx
      ON app_users (org_id, role_id)
  `);
};

exports.down = async function down(knex) {
  await knex.schema.raw(`
    DROP INDEX IF EXISTS app_users_org_id_role_id_idx
  `);

  await knex.schema.raw(`
    DROP INDEX IF EXISTS app_users_role_id_idx
  `);

  await knex.schema.raw(`
    ALTER TABLE app_users
      DROP CONSTRAINT IF EXISTS app_users_role_id_fkey
  `);

  await knex.schema.raw(`
    ALTER TABLE app_users
      DROP COLUMN IF EXISTS role_id
  `);

  await knex.schema.raw(`
    DROP INDEX IF EXISTS app_roles_org_id_key_uidx
  `);

  await knex.schema.raw(`
    ALTER TABLE app_roles
      ADD CONSTRAINT app_roles_key_unique UNIQUE (key)
  `).catch(() => undefined);

  await knex.schema.raw(`
    ALTER TABLE app_roles
      DROP COLUMN IF EXISTS org_id
  `);
};
