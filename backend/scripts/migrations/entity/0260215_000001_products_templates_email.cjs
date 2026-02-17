// apps/backend/db/engage/migrations/20260215_000001_products_templates_email.cjs

/**
 * Engage DB: Products + Templates (email-only now, multi-channel ready)
 *
 * Tables:
 *  - products
 *  - email_senders
 *  - product_channel_settings
 *  - templates
 *  - email_templates
 */

exports.up = async function up(knex) {
  // -----------------------------
  // 1) products (channel-agnostic)
  // -----------------------------
  const hasProducts = await knex.schema.hasTable("products");
  if (!hasProducts) {
    await knex.schema.createTable("products", (t) => {
      t.bigIncrements("id").primary();
      t.text("name").notNullable();
      t.text("description").notNullable();

      t.boolean("is_active").notNullable().defaultTo(true);

      t.bigInteger("created_by").nullable();
      t.bigInteger("updated_by").nullable();

      t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

      t.unique(["name"], { indexName: "products_name_unique" });
    });
  }

  // -----------------------------
  // 2) email_senders (email-only)
  // -----------------------------
  const hasEmailSenders = await knex.schema.hasTable("email_senders");
  if (!hasEmailSenders) {
    await knex.schema.createTable("email_senders", (t) => {
      t.bigIncrements("id").primary();
      t.text("name").notNullable();
      t.text("from_email").notNullable();
      t.text("reply_to_email").nullable();

      t.boolean("is_verified").notNullable().defaultTo(false);
      t.boolean("is_active").notNullable().defaultTo(true);

      t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

      t.unique(["from_email"], { indexName: "email_senders_email_unique" });
    });
  }

  // ---------------------------------------------
  // 3) product_channel_settings (channel configs)
  //    - uses channel='email' now
  // ---------------------------------------------
  const hasPCS = await knex.schema.hasTable("product_channel_settings");
  if (!hasPCS) {
    await knex.schema.createTable("product_channel_settings", (t) => {
      t.bigIncrements("id").primary();

      t.bigInteger("product_id").notNullable().index();

      // Keep TEXT + CHECK instead of creating enum (easier migrations)
      t.text("channel").notNullable();

      // Email settings (future: add sms/whatsapp/push columns later)
      t.bigInteger("default_email_sender_id").nullable().index();
      t.text("email_header_html").nullable();
      t.text("email_footer_html").nullable();

      t.boolean("is_enabled").notNullable().defaultTo(true);

      t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

      t.unique(["product_id", "channel"], { indexName: "pcs_product_channel_unique" });

      t
        .foreign("product_id", "pcs_product_fk")
        .references("products.id")
        .onDelete("CASCADE");

      t
        .foreign("default_email_sender_id", "pcs_default_email_sender_fk")
        .references("email_senders.id")
        .onDelete("SET NULL");
    });

    // Channel CHECK constraint (safe now; you can expand list later)
    await knex.schema.raw(`
      ALTER TABLE product_channel_settings
      ADD CONSTRAINT pcs_channel_check
      CHECK (channel IN ('email','sms','whatsapp','push'))
    `);
  }

  // -----------------------------
  // 4) templates (common metadata)
  // -----------------------------
  const hasTemplates = await knex.schema.hasTable("templates");
  if (!hasTemplates) {
    await knex.schema.createTable("templates", (t) => {
      t.bigIncrements("id").primary();

      t.bigInteger("product_id").notNullable().index();

      t.text("name").notNullable();
      t.text("description").nullable();

      // common lifecycle fields
      t.text("status").notNullable().defaultTo("draft"); // draft/active/archived
      t.boolean("is_active").notNullable().defaultTo(true);

      t.bigInteger("created_by").nullable();
      t.bigInteger("updated_by").nullable();

      t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

      t.unique(["product_id", "name"], {
        indexName: "templates_product_name_unique",
      });

      t
        .foreign("product_id", "templates_product_fk")
        .references("products.id")
        .onDelete("CASCADE");
    });

    await knex.schema.raw(`
      CREATE INDEX IF NOT EXISTS templates_status_idx
      ON templates (status)
    `);
  }

  // --------------------------------
  // 5) email_templates (email content)
  //    1:1 with templates via template_id PK
  // --------------------------------
  const hasEmailTemplates = await knex.schema.hasTable("email_templates");
  if (!hasEmailTemplates) {
    await knex.schema.createTable("email_templates", (t) => {
      t.bigInteger("template_id").primary();

      t.text("subject").notNullable();
      t.text("preheader").nullable();

      t.text("body_html").notNullable();
      t.text("body_text").nullable();

      // Optional overrides
      t.bigInteger("sender_id").nullable().index();
      t.text("header_html_override").nullable();
      t.text("footer_html_override").nullable();

      t
        .foreign("template_id", "email_templates_template_fk")
        .references("templates.id")
        .onDelete("CASCADE");

      t
        .foreign("sender_id", "email_templates_sender_fk")
        .references("email_senders.id")
        .onDelete("SET NULL");
    });
  }

  // ----------------------------------------------------
  // 6) Helpful: ensure 1 email settings row per product
  //    (Not forced by DB, but good default for your UI)
  //    We won't auto-insert here (migration should be pure schema),
  //    but your app can create channel='email' row on product create.
  // ----------------------------------------------------
};

exports.down = async function down(knex) {
  // Drop in reverse dependency order
  const hasEmailTemplates = await knex.schema.hasTable("email_templates");
  if (hasEmailTemplates) await knex.schema.dropTable("email_templates");

  const hasTemplates = await knex.schema.hasTable("templates");
  if (hasTemplates) await knex.schema.dropTable("templates");

  const hasPCS = await knex.schema.hasTable("product_channel_settings");
  if (hasPCS) await knex.schema.dropTable("product_channel_settings");

  const hasEmailSenders = await knex.schema.hasTable("email_senders");
  if (hasEmailSenders) await knex.schema.dropTable("email_senders");

  const hasProducts = await knex.schema.hasTable("products");
  if (hasProducts) await knex.schema.dropTable("products");
};
