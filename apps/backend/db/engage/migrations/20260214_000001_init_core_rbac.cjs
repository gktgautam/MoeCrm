// apps/backend/db/engage/migrations/20260214_000001_init_core_rbac.cjs

exports.up = async function up(knex) {
  await knex.schema.raw(`CREATE EXTENSION IF NOT EXISTS citext;`);

  // ---- Orgs ----
  await knex.schema.createTable("app_orgs", (t) => {
    t.bigIncrements("id").primary();
    t.text("name").notNullable();
    t.text("slug").notNullable().unique(); // e.g. "equentis"
    t.text("status").notNullable().defaultTo("active"); // active/disabled
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // ---- Roles (org-scoped; unique per org) ----
  await knex.schema.createTable("app_roles", (t) => {
    t.increments("id").primary();
    t.bigInteger("org_id").notNullable().references("id").inTable("app_orgs").onDelete("CASCADE");
    t.text("key").notNullable();   // admin/marketer/analyst/viewer/support/developer
    t.text("name").notNullable();  // display name
    t.text("description").nullable();
    t.boolean("is_system").notNullable().defaultTo(true);
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.unique(["org_id", "key"]);
    t.index(["org_id"]);
  });

  // ---- Permissions (global catalog) ----
  await knex.schema.createTable("app_permissions", (t) => {
    t.increments("id").primary();
    t.text("key").notNullable().unique(); // "segments:read"
    t.text("module").notNullable();       // "segments"
    t.text("action").notNullable();       // "read/write/send/export/manage"
    t.text("description").nullable();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // ---- Role -> Permission ----
  await knex.schema.createTable("app_role_permissions", (t) => {
    t.integer("role_id").notNullable().references("id").inTable("app_roles").onDelete("CASCADE");
    t.integer("permission_id").notNullable().references("id").inTable("app_permissions").onDelete("CASCADE");
    t.primary(["role_id", "permission_id"]);
    t.index(["role_id"]);
    t.index(["permission_id"]);
  });

  // ---- Users (single role via role_id) ----
  await knex.schema.createTable("app_users", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("org_id").notNullable().references("id").inTable("app_orgs").onDelete("CASCADE");

    t.specificType("email", "citext").notNullable(); // case-insensitive
    t.text("first_name").nullable();
    t.text("last_name").nullable();
    t.text("display_name").nullable();

    // auth
    t.text("auth_provider").notNullable().defaultTo("password"); // password/google/sso (future)
    t.text("password_hash").nullable(); // nullable for non-password providers

    // single role
    t.integer("role_id").notNullable().references("id").inTable("app_roles").onDelete("RESTRICT");

    // status + audit
    t.text("status").notNullable().defaultTo("active"); // invited/active/disabled
    t.timestamp("invited_at", { useTz: true }).nullable();
    t.timestamp("last_login_at", { useTz: true }).nullable();

    // soft delete
    t.timestamp("deleted_at", { useTz: true }).nullable();

    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.unique(["org_id", "email"]);
    t.index(["org_id", "role_id"]);
    t.index(["org_id"]);
    t.index(["role_id"]);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("app_users");
  await knex.schema.dropTableIfExists("app_role_permissions");
  await knex.schema.dropTableIfExists("app_permissions");
  await knex.schema.dropTableIfExists("app_roles");
  await knex.schema.dropTableIfExists("app_orgs");
};
