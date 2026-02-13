// apps/api/src/db/engage/migrations/20260211_000001_create_app_users.js

exports.up = async (knex) => {
  // 1) enum types (Postgres)
  await knex.schema.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_role') THEN
        CREATE TYPE app_user_role AS ENUM ('owner','admin','manager','viewer');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_status') THEN
        CREATE TYPE app_user_status AS ENUM ('invited','active','disabled');
      END IF;
    END $$;
  `);

  // 2) table
  await knex.schema.createTable("app_users", (t) => {
    t.bigIncrements("id").primary();

    // tenant
    t.bigInteger("org_id").notNullable();

    // identity
    t.text("email").notNullable();
    t.text("first_name");
    t.text("last_name");
    t.text("display_name");

    // auth
    t.text("password_hash"); // nullable (SSO users may not have password)
    t.text("auth_provider").notNullable().defaultTo("password"); // "password" | "google" | "sso"
    t.text("provider_user_id"); // for google/okta/etc

    // permissions & lifecycle
    t.specificType("role", "app_user_role").notNullable().defaultTo("manager");
    t.specificType("status", "app_user_status").notNullable().defaultTo("invited");

    // audit
    t.timestamp("invited_at", { useTz: true });
    t.timestamp("last_login_at", { useTz: true });

    // soft delete
    t.timestamp("deleted_at", { useTz: true });

    // timestamps
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // constraints
    t.unique(["org_id", "email"]); // unique per org
    t.index(["org_id"], "app_users_org_id_idx");
  });

  // 3) case-insensitive email lookup (recommended)
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS app_users_org_email_lower_idx
    ON app_users (org_id, lower(email));
  `);

  // 4) provider lookup (optional, useful for SSO)
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS app_users_provider_lookup_idx
    ON app_users (auth_provider, provider_user_id)
    WHERE provider_user_id IS NOT NULL;
  `);
};

exports.down = async (knex) => {
  await knex.schema.raw(`DROP INDEX IF EXISTS app_users_provider_lookup_idx;`);
  await knex.schema.raw(`DROP INDEX IF EXISTS app_users_org_email_lower_idx;`);
  await knex.schema.dropTableIfExists("app_users");

  await knex.schema.raw(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_role') THEN
        DROP TYPE app_user_role;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_status') THEN
        DROP TYPE app_user_status;
      END IF;
    END $$;
  `);
};
