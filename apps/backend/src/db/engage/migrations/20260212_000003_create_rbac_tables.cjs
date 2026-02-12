exports.up = async (knex) => {
  await knex.schema.createTable("rbac_permissions", (t) => {
    t.bigIncrements("id").primary();
    t.text("permission_key").notNullable().unique();
    t.text("description");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("rbac_roles", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("org_id").nullable(); // null => predefined role
    t.text("role_key").notNullable();
    t.text("name").notNullable();
    t.text("description");
    t.boolean("is_system").notNullable().defaultTo(false);
    t.boolean("is_editable").notNullable().defaultTo(true);
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.unique(["org_id", "role_key"]);
    t.unique(["org_id", "name"]);
    t.index(["org_id"], "rbac_roles_org_id_idx");
  });

  await knex.schema.createTable("rbac_role_permissions", (t) => {
    t.bigInteger("role_id").notNullable().references("id").inTable("rbac_roles").onDelete("CASCADE");
    t.bigInteger("permission_id").notNullable().references("id").inTable("rbac_permissions").onDelete("CASCADE");
    t.primary(["role_id", "permission_id"]);
  });

  await knex.schema.alterTable("app_users", (t) => {
    t.bigInteger("role_id").nullable();
  });

  await knex.schema.raw(`
    ALTER TABLE app_users
    ADD CONSTRAINT app_users_role_id_fk
    FOREIGN KEY (role_id) REFERENCES rbac_roles(id)
    ON DELETE RESTRICT;
  `);

  await knex.schema.raw(`
    INSERT INTO rbac_permissions (permission_key, description)
    VALUES
      ('campaigns:read', 'View campaigns'),
      ('campaigns:write', 'Create and edit campaigns'),
      ('campaigns:approve', 'Approve campaigns'),
      ('reports:read', 'View analytics and reports'),
      ('reports:export', 'Export reports and segments'),
      ('segments:read', 'View segmentation data'),
      ('segments:write', 'Create and edit segments'),
      ('settings:read', 'Read account settings'),
      ('settings:write', 'Update account settings'),
      ('billing:read', 'View billing details'),
      ('billing:write', 'Update billing details'),
      ('team:read', 'View teams and roles'),
      ('team:invite', 'Invite team members'),
      ('team:roles:write', 'Create and update custom roles'),
      ('teams:manage', 'Create, edit, and delete teams'),
      ('integrations:read', 'View integration settings'),
      ('integrations:write', 'Update integration settings'),
      ('push:read', 'View push settings'),
      ('push:write', 'Update push settings')
    ON CONFLICT (permission_key) DO NOTHING;
  `);

  await knex.schema.raw(`
    INSERT INTO rbac_roles (org_id, role_key, name, description, is_system, is_editable)
    VALUES
      (NULL, 'admin', 'Admin', 'Full access to all modules, teams, billing and settings', true, false),
      (NULL, 'manager', 'Manager', 'Operational access without team create/edit/delete', true, false),
      (NULL, 'marketer', 'Marketer', 'Can create and manage campaigns with approval workflow support', true, false),
      (NULL, 'developer', 'Developer', 'Integration focused role with limited live access', true, false),
      (NULL, 'analyst', 'Analyst', 'Can view and export reports and segmentation data', true, false)
    ON CONFLICT (org_id, role_key) DO NOTHING;
  `);

  await knex.schema.raw(`
    INSERT INTO rbac_role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM rbac_roles r
    JOIN rbac_permissions p ON p.permission_key = ANY (CASE r.role_key
      WHEN 'admin' THEN ARRAY[
        'campaigns:read','campaigns:write','campaigns:approve',
        'reports:read','reports:export','segments:read','segments:write',
        'settings:read','settings:write','billing:read','billing:write',
        'team:read','team:invite','team:roles:write','teams:manage',
        'integrations:read','integrations:write','push:read','push:write'
      ]
      WHEN 'manager' THEN ARRAY[
        'campaigns:read','campaigns:write','campaigns:approve',
        'reports:read','reports:export','segments:read','segments:write',
        'settings:read','settings:write','team:read','team:invite',
        'integrations:read','integrations:write','push:read','push:write'
      ]
      WHEN 'marketer' THEN ARRAY[
        'campaigns:read','campaigns:write',
        'reports:read','segments:read','segments:write',
        'settings:read','team:read'
      ]
      WHEN 'developer' THEN ARRAY[
        'campaigns:read','reports:read','segments:read',
        'settings:read','integrations:read','integrations:write','push:read'
      ]
      WHEN 'analyst' THEN ARRAY[
        'reports:read','reports:export','segments:read','campaigns:read'
      ]
      ELSE ARRAY[]::text[]
    END)
    WHERE r.org_id IS NULL
    ON CONFLICT DO NOTHING;
  `);

  await knex.schema.raw(`
    UPDATE app_users u
    SET role_id = r.id
    FROM rbac_roles r
    WHERE r.org_id IS NULL
      AND r.role_key = CASE u.role
        WHEN 'owner' THEN 'admin'
        WHEN 'admin' THEN 'admin'
        WHEN 'manager' THEN 'manager'
        WHEN 'viewer' THEN 'analyst'
        ELSE 'marketer'
      END;
  `);

  await knex.schema.alterTable("app_users", (t) => {
    t.dropColumn("role");
  });

  await knex.schema.raw(`DROP TYPE IF EXISTS app_user_role;`);

  await knex.schema.alterTable("app_users", (t) => {
    t.bigInteger("role_id").notNullable().alter();
  });
};

exports.down = async (knex) => {
  await knex.schema.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_user_role') THEN
        CREATE TYPE app_user_role AS ENUM ('owner','admin','manager','viewer');
      END IF;
    END $$;
  `);

  await knex.schema.alterTable("app_users", (t) => {
    t.specificType("role", "app_user_role").notNullable().defaultTo("manager");
  });

  await knex.schema.raw(`
    UPDATE app_users u
    SET role = CASE r.role_key
      WHEN 'admin' THEN 'admin'::app_user_role
      WHEN 'manager' THEN 'manager'::app_user_role
      WHEN 'analyst' THEN 'viewer'::app_user_role
      ELSE 'manager'::app_user_role
    END
    FROM rbac_roles r
    WHERE u.role_id = r.id;
  `);

  await knex.schema.raw(`ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_id_fk;`);
  await knex.schema.alterTable("app_users", (t) => {
    t.dropColumn("role_id");
  });

  await knex.schema.dropTableIfExists("rbac_role_permissions");
  await knex.schema.dropTableIfExists("rbac_roles");
  await knex.schema.dropTableIfExists("rbac_permissions");
};
