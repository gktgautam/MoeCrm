exports.up = async function up(knex) {
  await knex.schema.createTable("app_roles", (t) => {
    t.increments("id").primary();
    t.text("key").notNullable().unique();
    t.text("name").notNullable();
    t.text("description");
    t.boolean("is_system").notNullable().defaultTo(true);
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("app_permissions", (t) => {
    t.increments("id").primary();
    t.text("key").notNullable().unique();
    t.text("module").notNullable();
    t.text("action").notNullable();
    t.text("description");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("app_role_permissions", (t) => {
    t.integer("role_id").notNullable().references("id").inTable("app_roles").onDelete("CASCADE");
    t.integer("permission_id").notNullable().references("id").inTable("app_permissions").onDelete("CASCADE");
    t.primary(["role_id", "permission_id"]);
  });

  await knex.schema.raw(`
    INSERT INTO app_roles (key, name, description) VALUES
      ('admin', 'Admin', 'Full access to workspace settings, users, billing, campaigns, analytics, segments and integrations'),
      ('marketer', 'Marketer', 'Create, edit and send campaigns with analytics and segments access'),
      ('analyst', 'Analyst', 'Read analytics and export reports'),
      ('developer', 'Developer', 'Manage integrations, API keys and webhooks'),
      ('viewer', 'Viewer', 'Read-only analytics access without export'),
      ('support', 'Support / Ops', 'Operational troubleshooting and campaign monitoring')
  `);

  await knex.schema.raw(`
    INSERT INTO app_permissions (key, module, action, description) VALUES
      ('settings:read', 'settings', 'read', 'Read workspace settings'),
      ('settings:write', 'settings', 'write', 'Update workspace settings'),
      ('billing:read', 'billing', 'read', 'Read billing and subscription'),
      ('billing:write', 'billing', 'write', 'Manage billing and subscription'),
      ('users:read', 'users', 'read', 'View users and roles'),
      ('users:write', 'users', 'write', 'Manage users and roles'),
      ('campaigns:read', 'campaigns', 'read', 'View campaigns and statuses'),
      ('campaigns:write', 'campaigns', 'write', 'Create/edit campaigns'),
      ('campaigns:send', 'campaigns', 'send', 'Send campaigns'),
      ('campaigns:approve', 'campaigns', 'approve', 'Approve campaigns'),
      ('campaigns:pause', 'campaigns', 'pause', 'Pause/stop campaigns'),
      ('segments:read', 'segments', 'read', 'View segments'),
      ('segments:write', 'segments', 'write', 'Create/update segments'),
      ('analytics:read', 'analytics', 'read', 'View analytics and reports'),
      ('reports:export', 'reports', 'export', 'Export analytics/reports'),
      ('integrations:read', 'integrations', 'read', 'View integrations and API keys'),
      ('integrations:write', 'integrations', 'write', 'Manage integrations and API keys'),
      ('logs:read', 'logs', 'read', 'View message logs and failures')
  `);

  await knex.schema.raw(`
    WITH rp(role_key, permission_key) AS (
      VALUES
      -- Admin: full access
      ('admin','settings:read'),('admin','settings:write'),('admin','billing:read'),('admin','billing:write'),
      ('admin','users:read'),('admin','users:write'),('admin','campaigns:read'),('admin','campaigns:write'),
      ('admin','campaigns:send'),('admin','campaigns:approve'),('admin','campaigns:pause'),('admin','segments:read'),
      ('admin','segments:write'),('admin','analytics:read'),('admin','reports:export'),('admin','integrations:read'),
      ('admin','integrations:write'),('admin','logs:read'),
      -- Marketer
      ('marketer','campaigns:read'),('marketer','campaigns:write'),('marketer','campaigns:send'),('marketer','segments:read'),
      ('marketer','segments:write'),('marketer','analytics:read'),
      -- Analyst
      ('analyst','analytics:read'),('analyst','reports:export'),
      -- Developer
      ('developer','integrations:read'),('developer','integrations:write'),
      -- Viewer
      ('viewer','analytics:read'),
      -- Support / Ops
      ('support','campaigns:read'),('support','logs:read')
    )
    INSERT INTO app_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM rp
    JOIN app_roles r ON r.key = rp.role_key
    JOIN app_permissions p ON p.key = rp.permission_key
  `);

  await knex.schema.raw(`
    ALTER TABLE app_users
      ALTER COLUMN role DROP DEFAULT
  `);

  await knex.schema.raw(`
    ALTER TYPE app_user_role RENAME TO app_user_role_old;
    CREATE TYPE app_user_role AS ENUM ('admin','marketer','analyst','developer','viewer','support');
    ALTER TABLE app_users
      ALTER COLUMN role TYPE app_user_role
      USING (
        CASE
          WHEN role::text = 'owner' THEN 'admin'
          WHEN role::text = 'manager' THEN 'marketer'
          ELSE role::text
        END
      )::app_user_role;
    ALTER TABLE app_users
      ALTER COLUMN role SET DEFAULT 'marketer';
    DROP TYPE app_user_role_old;
  `);
};

exports.down = async function down(knex) {
  await knex.schema.raw(`
    ALTER TABLE app_users
      ALTER COLUMN role DROP DEFAULT
  `);

  await knex.schema.raw(`
    ALTER TYPE app_user_role RENAME TO app_user_role_new;
    CREATE TYPE app_user_role AS ENUM ('owner','admin','manager','viewer');
    ALTER TABLE app_users
      ALTER COLUMN role TYPE app_user_role
      USING (
        CASE
          WHEN role::text = 'marketer' THEN 'manager'
          WHEN role::text IN ('analyst','developer','support') THEN 'viewer'
          ELSE role::text
        END
      )::app_user_role;
    ALTER TABLE app_users
      ALTER COLUMN role SET DEFAULT 'manager';
    DROP TYPE app_user_role_new;
  `);

  await knex.schema.dropTableIfExists("app_role_permissions");
  await knex.schema.dropTableIfExists("app_permissions");
  await knex.schema.dropTableIfExists("app_roles");
};
