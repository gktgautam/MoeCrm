// apps/backend/db/engage/migrations/20260215_000002_product_branding.cjs

exports.up = async function up(knex) {
  const has = await knex.schema.hasTable("product_branding");
  if (!has) {
    await knex.schema.createTable("product_branding", (t) => {
      t.bigInteger("product_id").primary(); // 1:1

      // basics
      t.text("display_name").nullable(); // label name shown in UI/email footer etc.

      // URLs / domains
      t.text("website_url").nullable();     // https://example.com
      t.text("tracking_domain").nullable(); // links.example.com (optional for email tracking)
      t.text("sender_domain").nullable();   // example.com (optional for SPF/DKIM alignment)

      // assets
      t.text("logo_url").nullable();        // stored in GCS/CDN
      t.text("favicon_url").nullable();
      t.text("brand_color").nullable();     // "#1A73E8"
      t.text("support_email").nullable();
      t.text("address_text").nullable();    // physical address (CAN-SPAM)

      // policy links
      t.text("privacy_policy_url").nullable();
      t.text("terms_url").nullable();
      t.text("unsubscribe_url").nullable(); // optional override (otherwise your system link)

      // flags
      t.boolean("is_active").notNullable().defaultTo(true);

      t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
      t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

      t
        .foreign("product_id", "product_branding_product_fk")
        .references("products.id")
        .onDelete("CASCADE");

      // Guard: one branding per product
      t.unique(["product_id"], { indexName: "product_branding_product_unique" });
    });

    await knex.schema.raw(`
      CREATE UNIQUE INDEX IF NOT EXISTS product_branding_tracking_domain_unique
      ON product_branding (tracking_domain)
      WHERE tracking_domain IS NOT NULL
    `);
  }
};

exports.down = async function down(knex) {
  const has = await knex.schema.hasTable("product_branding");
  if (has) await knex.schema.dropTable("product_branding");
};
