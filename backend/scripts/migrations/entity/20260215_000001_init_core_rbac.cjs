// backend/db/engage/migrations/20260214_000001_init_core_rbac.cjs

exports.up = async function up(knex) {
  await knex.schema.raw(`CREATE EXTENSION IF NOT EXISTS citext;`);

  // ---- Roles ----
  await knex.schema.createTable("app_roles", (t) => {
    t.increments("id").primary();
    t.text("key").notNullable().unique(); // admin/marketer/analyst/viewer/support/developer
    t.text("name").notNullable();
    t.text("description").nullable();
    t.boolean("is_system").notNullable().defaultTo(true);
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // ---- Permissions (global catalog) ----
  await knex.schema.createTable("app_permissions", (t) => {
    t.increments("id").primary();
    t.text("key").notNullable().unique();
    t.text("module").notNullable();
    t.text("action").notNullable();
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

    t.specificType("email", "citext").notNullable();
    t.text("first_name").nullable();
    t.text("last_name").nullable();
    t.text("display_name").nullable();

    t.text("auth_provider").notNullable().defaultTo("password");
    t.text("password_hash").nullable();

    t.integer("role_id").notNullable().references("id").inTable("app_roles").onDelete("RESTRICT");

    t.text("status").notNullable().defaultTo("active");
    t.timestamp("invited_at", { useTz: true }).nullable();
    t.timestamp("last_login_at", { useTz: true }).nullable();

    t.timestamp("deleted_at", { useTz: true }).nullable();

    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.unique(["email"]);
    t.index(["role_id"]);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("app_users");
  await knex.schema.dropTableIfExists("app_role_permissions");
  await knex.schema.dropTableIfExists("app_permissions");
  await knex.schema.dropTableIfExists("app_roles");
};
