exports.up = async (knex) => {
  await knex.schema.raw(`
    ALTER TABLE app_users ALTER COLUMN role DROP DEFAULT;
    ALTER TABLE app_users ALTER COLUMN role TYPE text USING role::text;
    ALTER TABLE app_users ALTER COLUMN role SET DEFAULT 'admin';
  `);

  await knex.schema.createTable("app_permissions", (t) => {
    t.text("code").primary();
    t.text("description");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("app_roles", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("org_id").nullable();
    t.text("code").notNullable();
    t.text("name").notNullable();
    t.text("description");
    t.boolean("is_system").notNullable().defaultTo(false);
    t.boolean("is_editable").notNullable().defaultTo(true);
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.unique(["org_id", "code"]);
    t.index(["org_id"], "app_roles_org_id_idx");
  });

  await knex.schema.createTable("app_role_permissions", (t) => {
    t.bigInteger("role_id").notNullable().references("id").inTable("app_roles").onDelete("CASCADE");
    t.text("permission_code").notNullable().references("code").inTable("app_permissions").onDelete("CASCADE");
    t.primary(["role_id", "permission_code"]);
  });

  await knex.schema.createTable("app_user_permission_overrides", (t) => {
    t.bigInteger("user_id").notNullable().references("id").inTable("app_users").onDelete("CASCADE");
    t.text("permission_code").notNullable().references("code").inTable("app_permissions").onDelete("CASCADE");
    t.boolean("is_allowed").notNullable();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.primary(["user_id", "permission_code"]);
  });

  await knex.schema.raw(`
    INSERT INTO app_permissions (code, description)
    VALUES
      ('campaigns:read', 'View campaigns'),
      ('campaigns:write', 'Create and edit campaigns'),
      ('campaigns:approve', 'Approve campaigns before go-live'),
      ('reports:read', 'View reports'),
      ('reports:export', 'Export reports'),
      ('segments:read', 'View segments'),
      ('segments:export', 'Export segmentation data'),
      ('settings:read', 'View settings'),
      ('settings:write', 'Edit settings'),
      ('billing:read', 'View billing details'),
      ('billing:write', 'Edit billing details'),
      ('teams:write', 'Create, edit, and delete teams'),
      ('roles:write', 'Create and update custom roles'),
      ('members:invite:manager_or_below', 'Invite team members with manager or lower roles'),
      ('integrations:write', 'Manage app and web integrations'),
      ('push:write', 'Manage push settings')
    ON CONFLICT (code) DO NOTHING;
  `);

  await knex.schema.raw(`
    INSERT INTO app_roles (org_id, code, name, description, is_system, is_editable)
    VALUES
      (NULL, 'admin', 'Admin', 'Full access to account, teams, billing, and roles.', true, false),
      (NULL, 'manager', 'Manager', 'Manage campaigns and members below manager.', true, false),
      (NULL, 'marketer', 'Marketer', 'Create and manage campaigns with approval workflow support.', true, false),
      (NULL, 'developer', 'Developer', 'Integration-focused role with limited production access.', true, false),
      (NULL, 'analyst', 'Analyst', 'Read-only reporting and segmentation exports.', true, false),
      (NULL, 'owner', 'Owner', 'Legacy owner role mapped to admin-level permissions.', true, false)
    ON CONFLICT DO NOTHING;
  `);

  await knex.schema.raw(`
    WITH pairs AS (
      SELECT 'admin'::text AS role_code, unnest(ARRAY[
        'campaigns:read','campaigns:write','campaigns:approve','reports:read','reports:export',
        'segments:read','segments:export','settings:read','settings:write','billing:read','billing:write',
        'teams:write','roles:write','members:invite:manager_or_below','integrations:write','push:write'
      ]) AS permission_code
      UNION ALL
      SELECT 'owner', unnest(ARRAY[
        'campaigns:read','campaigns:write','campaigns:approve','reports:read','reports:export',
        'segments:read','segments:export','settings:read','settings:write','billing:read','billing:write',
        'teams:write','roles:write','members:invite:manager_or_below','integrations:write','push:write'
      ])
      UNION ALL
      SELECT 'manager', unnest(ARRAY[
        'campaigns:read','campaigns:write','campaigns:approve','reports:read','reports:export',
        'segments:read','segments:export','settings:read','settings:write','members:invite:manager_or_below','integrations:write','push:write'
      ])
      UNION ALL
      SELECT 'marketer', unnest(ARRAY[
        'campaigns:read','campaigns:write','reports:read','segments:read'
      ])
      UNION ALL
      SELECT 'developer', unnest(ARRAY[
        'integrations:write','campaigns:read','reports:read'
      ])
      UNION ALL
      SELECT 'analyst', unnest(ARRAY[
        'reports:read','reports:export','segments:read','segments:export'
      ])
    )
    INSERT INTO app_role_permissions (role_id, permission_code)
    SELECT r.id, p.permission_code
    FROM pairs p
    JOIN app_roles r ON r.code = p.role_code AND r.org_id IS NULL
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("app_user_permission_overrides");
  await knex.schema.dropTableIfExists("app_role_permissions");
  await knex.schema.dropTableIfExists("app_roles");
  await knex.schema.dropTableIfExists("app_permissions");
};
