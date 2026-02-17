import type { FastifyInstance } from "fastify";

import type {
  ProductBrandingPutBodyType,
  ProductCreateBodyType,
  ProductEmailSettingsPutBodyType,
  ProductPatchBodyType,
} from "./products.schemas";
import { Pool } from "pg";

type AuthCtx = { userId: string };



export function productsService(app: FastifyInstance) {
 const db = app.dbEngage as unknown as Pool;

  return {
    async list() {
      const res = await db.query(
        `SELECT id, name, description,
                is_active AS "isActive",
                created_at AS "createdAt", updated_at AS "updatedAt"
         FROM products
         ORDER BY id DESC`
      );
      return res.rows;
    },

    async get(id: number) {
      return db.oneOrNone(
        `SELECT id, name, description,
                is_active AS "isActive",
                created_at AS "createdAt", updated_at AS "updatedAt"
         FROM products
         WHERE id=$1`,
        [id]
      );
    },

    // NOTE: create uses ctx like other methods (patch / branding / settings)
    async create(userId:number, input: ProductCreateBodyType) {
      return db.tx(async (tx: any) => {
        const product = await tx.one(
          `INSERT INTO products (name, description, is_active, created_by, updated_by)
           VALUES ($1,$2,$3,$4,$4)
           RETURNING id, name, description,
                     is_active AS "isActive",
                     created_at AS "createdAt", updated_at AS "updatedAt"`,
          [input.name, input.description, true, userId]
        );

        // Email settings row (channel='email') always ensured
        await tx.none(
          `INSERT INTO product_channel_settings
           (product_id, channel, default_email_sender_id, email_header_html, email_footer_html, is_enabled)
           VALUES ($1,'email',$2,$3,$4,true)
           ON CONFLICT (product_id, channel) DO NOTHING`,
          [
            product.id,
            input.defaultEmailSenderId ?? null,
            input.emailHeaderHtml ?? null,
            input.emailFooterHtml ?? null,
          ]
        );

        // Branding row ensured (optional values)
        const b = input.branding ?? {};
        await tx.none(
          `INSERT INTO product_branding
           (product_id, display_name, website_url, tracking_domain, sender_domain,
            logo_url, favicon_url, brand_color, support_email, address_text,
            privacy_policy_url, terms_url, unsubscribe_url, is_active, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, COALESCE($14,true), now(), now())
           ON CONFLICT (product_id) DO NOTHING`,
          [
            product.id,
            b.displayName ?? null,
            b.websiteUrl ?? null,
            b.trackingDomain ?? null,
            b.senderDomain ?? null,
            b.logoUrl ?? null,
            b.faviconUrl ?? null,
            b.brandColor ?? null,
            b.supportEmail ?? null,
            b.addressText ?? null,
            b.privacyPolicyUrl ?? null,
            b.termsUrl ?? null,
            b.unsubscribeUrl ?? null,
            b.isActive ?? null,
          ]
        );

        return product;
      });
    },

    async patch(userId: number, id: number, input: ProductPatchBodyType) {
      return db.oneOrNone(
        `UPDATE products
         SET name=COALESCE($2,name),
             description=COALESCE($3,description),
             is_active=COALESCE($4,is_active),
             updated_by=$5,
             updated_at=now()
         WHERE id=$1
         RETURNING id, name, description,
                   is_active AS "isActive",
                   created_at AS "createdAt", updated_at AS "updatedAt"`,
        [id, input.name ?? null, input.description ?? null, input.isActive ?? null, userId]
      );
    },

    async getEmailSettings(productId: number) {
      return db.oneOrNone(
        `SELECT product_id AS "productId",
                channel,
                is_enabled AS "isEnabled",
                default_email_sender_id AS "defaultEmailSenderId",
                email_header_html AS "emailHeaderHtml",
                email_footer_html AS "emailFooterHtml"
         FROM product_channel_settings
         WHERE product_id=$1 AND channel='email'`,
        [productId]
      );
    },

    async putEmailSettings( 
      productId: number,
      input: ProductEmailSettingsPutBodyType
    ) {
      return db.oneOrNone(
        `UPDATE product_channel_settings
         SET is_enabled=COALESCE($2,is_enabled),
             default_email_sender_id=COALESCE($3,default_email_sender_id),
             email_header_html=COALESCE($4,email_header_html),
             email_footer_html=COALESCE($5,email_footer_html),
             updated_at=now()
         WHERE product_id=$1 AND channel='email'
         RETURNING product_id AS "productId",
                channel,
                is_enabled AS "isEnabled",
                default_email_sender_id AS "defaultEmailSenderId",
                email_header_html AS "emailHeaderHtml",
                email_footer_html AS "emailFooterHtml"`,
        [
          productId,
          input.isEnabled ?? null,
          input.defaultEmailSenderId ?? null,
          input.emailHeaderHtml ?? null,
          input.emailFooterHtml ?? null,
        ]
      );
    },

    async getBranding(productId: number) {
      return db.oneOrNone(
        `SELECT product_id AS "productId",
                display_name AS "displayName",
                website_url AS "websiteUrl",
                tracking_domain AS "trackingDomain",
                sender_domain AS "senderDomain",
                logo_url AS "logoUrl",
                favicon_url AS "faviconUrl",
                brand_color AS "brandColor",
                support_email AS "supportEmail",
                address_text AS "addressText",
                privacy_policy_url AS "privacyPolicyUrl",
                terms_url AS "termsUrl",
                unsubscribe_url AS "unsubscribeUrl",
                is_active AS "isActive"
         FROM product_branding
         WHERE product_id=$1`,
        [productId]
      );
    },

    async putBranding(productId: number, input: ProductBrandingPutBodyType) {
      // upsert (insert if missing, else update)
      return db.one(
        `INSERT INTO product_branding
         (product_id, display_name, website_url, tracking_domain, sender_domain,
          logo_url, favicon_url, brand_color, support_email, address_text,
          privacy_policy_url, terms_url, unsubscribe_url, is_active, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, COALESCE($14,true), now(), now())
         ON CONFLICT (product_id)
         DO UPDATE SET
           display_name=COALESCE(EXCLUDED.display_name, product_branding.display_name),
           website_url=COALESCE(EXCLUDED.website_url, product_branding.website_url),
           tracking_domain=COALESCE(EXCLUDED.tracking_domain, product_branding.tracking_domain),
           sender_domain=COALESCE(EXCLUDED.sender_domain, product_branding.sender_domain),
           logo_url=COALESCE(EXCLUDED.logo_url, product_branding.logo_url),
           favicon_url=COALESCE(EXCLUDED.favicon_url, product_branding.favicon_url),
           brand_color=COALESCE(EXCLUDED.brand_color, product_branding.brand_color),
           support_email=COALESCE(EXCLUDED.support_email, product_branding.support_email),
           address_text=COALESCE(EXCLUDED.address_text, product_branding.address_text),
           privacy_policy_url=COALESCE(EXCLUDED.privacy_policy_url, product_branding.privacy_policy_url),
           terms_url=COALESCE(EXCLUDED.terms_url, product_branding.terms_url),
           unsubscribe_url=COALESCE(EXCLUDED.unsubscribe_url, product_branding.unsubscribe_url),
           is_active=COALESCE(EXCLUDED.is_active, product_branding.is_active),
           updated_at=now()
         RETURNING product_id AS "productId",
           display_name AS "displayName",
           website_url AS "websiteUrl",
           tracking_domain AS "trackingDomain",
           sender_domain AS "senderDomain",
           logo_url AS "logoUrl",
           favicon_url AS "faviconUrl",
           brand_color AS "brandColor",
           support_email AS "supportEmail",
           address_text AS "addressText",
           privacy_policy_url AS "privacyPolicyUrl",
           terms_url AS "termsUrl",
           unsubscribe_url AS "unsubscribeUrl",
           is_active AS "isActive"`,
        [
          productId,
          input.displayName ?? null,
          input.websiteUrl ?? null,
          input.trackingDomain ?? null,
          input.senderDomain ?? null,
          input.logoUrl ?? null,
          input.faviconUrl ?? null,
          input.brandColor ?? null,
          input.supportEmail ?? null,
          input.addressText ?? null,
          input.privacyPolicyUrl ?? null,
          input.termsUrl ?? null,
          input.unsubscribeUrl ?? null,
          input.isActive ?? null,
        ]
      );
    },
  };
}
