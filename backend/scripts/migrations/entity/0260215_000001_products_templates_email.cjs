// apps/backend/db/engage/migrations/20260215_000001_products_templates_email.cjs

exports.up = async function up(knex) {
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

  const hasPCS = await knex.schema.hasTable("product_channel_settings");
  if (!hasPCS) {
    await knex.schema.createTable("product_channel_settings", (t) => {
      t.bigIncrements("id").primary();
      t.bigInteger("product_id").notNullable().index();
      t.text("channel").notNullable();
      t.bigInteger("default_email_sender_id").nullable().index();
      t.text("email_header_html").nullable();
      t.text("email_footer_html").nullable();
      t.boolean("is_enabled").notNullable().defaultTo(true);
      t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

      t.unique(["product_id", "channel"], { indexName: "pcs_product_channel_unique" });
      t.foreign("product_id", "pcs_product_fk").references("products.id").onDelete("CASCADE");
      t.foreign("default_email_sender_id", "pcs_default_email_sender_fk").references("email_senders.id").onDelete("SET NULL");
    });

    await knex.schema.raw(`
      ALTER TABLE product_channel_settings
      ADD CONSTRAINT pcs_channel_check
      CHECK (channel IN ('email','sms','whatsapp','push'))
    `);
  }

  const hasTemplates = await knex.schema.hasTable("templates");
  if (!hasTemplates) {
    await knex.schema.createTable("templates", (t) => {
      t.bigIncrements("id").primary();
      t.bigInteger("product_id").notNullable().index();
      t.text("name").notNullable();
      t.text("description").nullable();
      t.text("status").notNullable().defaultTo("draft");
      t.boolean("is_active").notNullable().defaultTo(true);
      t.bigInteger("created_by").nullable();
      t.bigInteger("updated_by").nullable();
      t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

      t.unique(["product_id", "name"], { indexName: "templates_product_name_unique" });
      t.foreign("product_id", "templates_product_fk").references("products.id").onDelete("CASCADE");
    });

    await knex.schema.raw(`
      CREATE INDEX IF NOT EXISTS templates_status_idx
      ON templates (status)
    `);
  }

  const hasEmailTemplates = await knex.schema.hasTable("email_templates");
  if (!hasEmailTemplates) {
    await knex.schema.createTable("email_templates", (t) => {
      t.bigInteger("template_id").primary();
      t.text("subject").notNullable();
      t.text("preheader").nullable();
      t.text("body_html").notNullable();
      t.text("body_text").nullable();
      t.bigInteger("sender_id").nullable().index();
      t.text("header_html_override").nullable();
      t.text("footer_html_override").nullable();
      t.foreign("template_id", "email_templates_template_fk").references("templates.id").onDelete("CASCADE");
      t.foreign("sender_id", "email_templates_sender_fk").references("email_senders.id").onDelete("SET NULL");
    });
  }
};

exports.down = async function down(knex) {
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
