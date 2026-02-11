// apps/api/src/db/migrations/engage/20260211_000002_create_engage_core_tables.js

exports.up = async (knex) => {
  await knex.schema.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'segment_status') THEN
        CREATE TYPE segment_status AS ENUM ('draft', 'active', 'archived');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_channel') THEN
        CREATE TYPE campaign_channel AS ENUM ('email', 'whatsapp');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
        CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'running', 'paused', 'completed', 'failed');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
        CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed');
      END IF;
    END $$;
  `);

  await knex.schema.createTable('contacts', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('org_id').notNullable();
    t.bigInteger('crm_customer_id').notNullable();

    t.text('email');
    t.text('phone');
    t.text('first_name');
    t.text('last_name');
    t.text('city');
    t.text('plan');

    t.timestamp('last_purchase_at', { useTz: true });
    t.jsonb('traits').notNullable().defaultTo('{}');

    t.timestamp('last_synced_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.unique(['org_id', 'crm_customer_id']);
    t.index(['org_id'], 'contacts_org_id_idx');
    t.index(['org_id', 'email'], 'contacts_org_email_idx');
  });

  await knex.schema.createTable('events', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('org_id').notNullable();
    t.bigInteger('contact_id').notNullable().references('id').inTable('contacts').onDelete('CASCADE');

    t.text('event_name').notNullable();
    t.text('event_source').notNullable();
    t.timestamp('occurred_at', { useTz: true }).notNullable();
    t.jsonb('properties').notNullable().defaultTo('{}');

    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.index(['org_id', 'event_name', 'occurred_at'], 'events_org_name_occurred_idx');
    t.index(['org_id', 'contact_id', 'occurred_at'], 'events_org_contact_occurred_idx');
  });

  await knex.schema.createTable('segments', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('org_id').notNullable();

    t.text('name').notNullable();
    t.text('description');
    t.specificType('status', 'segment_status').notNullable().defaultTo('draft');

    t.jsonb('rule_tree').notNullable();
    t.timestamp('last_computed_at', { useTz: true });

    t.bigInteger('created_by_user_id').references('id').inTable('app_users').onDelete('SET NULL');
    t.bigInteger('updated_by_user_id').references('id').inTable('app_users').onDelete('SET NULL');

    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.unique(['org_id', 'name']);
    t.index(['org_id', 'status'], 'segments_org_status_idx');
  });

  await knex.schema.createTable('segment_members', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('org_id').notNullable();

    t.bigInteger('segment_id').notNullable().references('id').inTable('segments').onDelete('CASCADE');
    t.bigInteger('contact_id').notNullable().references('id').inTable('contacts').onDelete('CASCADE');

    t.timestamp('computed_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.unique(['segment_id', 'contact_id']);
    t.index(['org_id', 'segment_id'], 'segment_members_org_segment_idx');
  });

  await knex.schema.createTable('campaigns', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('org_id').notNullable();

    t.text('name').notNullable();
    t.specificType('channel', 'campaign_channel').notNullable().defaultTo('email');
    t.specificType('status', 'campaign_status').notNullable().defaultTo('draft');

    t.bigInteger('segment_id').references('id').inTable('segments').onDelete('SET NULL');

    t.text('subject');
    t.text('from_email');
    t.text('reply_to_email');
    t.text('template_id');
    t.jsonb('template_payload').notNullable().defaultTo('{}');

    t.integer('throttle_per_minute').notNullable().defaultTo(600);
    t.timestamp('scheduled_at', { useTz: true });
    t.timestamp('started_at', { useTz: true });
    t.timestamp('completed_at', { useTz: true });

    t.bigInteger('created_by_user_id').references('id').inTable('app_users').onDelete('SET NULL');

    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.index(['org_id', 'status'], 'campaigns_org_status_idx');
    t.index(['org_id', 'scheduled_at'], 'campaigns_org_scheduled_idx');
  });

  await knex.schema.createTable('campaign_messages', (t) => {
    t.bigIncrements('id').primary();
    t.bigInteger('org_id').notNullable();

    t.bigInteger('campaign_id').notNullable().references('id').inTable('campaigns').onDelete('CASCADE');
    t.bigInteger('contact_id').notNullable().references('id').inTable('contacts').onDelete('CASCADE');

    t.specificType('status', 'message_status').notNullable().defaultTo('queued');

    t.timestamp('queued_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('sent_at', { useTz: true });
    t.timestamp('delivered_at', { useTz: true });
    t.timestamp('opened_at', { useTz: true });
    t.timestamp('clicked_at', { useTz: true });
    t.timestamp('bounced_at', { useTz: true });

    t.text('provider_message_id');
    t.text('failure_reason');
    t.jsonb('metadata').notNullable().defaultTo('{}');

    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    t.unique(['campaign_id', 'contact_id']);
    t.index(['org_id', 'campaign_id', 'status'], 'campaign_messages_org_campaign_status_idx');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('campaign_messages');
  await knex.schema.dropTableIfExists('campaigns');
  await knex.schema.dropTableIfExists('segment_members');
  await knex.schema.dropTableIfExists('segments');
  await knex.schema.dropTableIfExists('events');
  await knex.schema.dropTableIfExists('contacts');

  await knex.schema.raw(`
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
        DROP TYPE message_status;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
        DROP TYPE campaign_status;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_channel') THEN
        DROP TYPE campaign_channel;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'segment_status') THEN
        DROP TYPE segment_status;
      END IF;
    END $$;
  `);
};
