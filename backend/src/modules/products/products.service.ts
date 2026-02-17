// apps/backend/src/modules/engage/products/products.service.ts
import type { FastifyInstance } from "fastify";

type AuthCtx = { orgId: string; userId: string };

export type ProductCreateInput = {
  name: string;
  description: string;
  defaultEmailSenderId?: number | null;
  emailHeaderHtml?: string | null;
  emailFooterHtml?: string | null;
  branding?: {
    displayName?: string | null;
    websiteUrl?: string | null;
    trackingDomain?: string | null;
    senderDomain?: string | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    brandColor?: string | null;
    supportEmail?: string | null;
    addressText?: string | null;
    privacyPolicyUrl?: string | null;
    termsUrl?: string | null;
    unsubscribeUrl?: string | null;
    isActive?: boolean;
  };
};

export type ProductPatchInput = Partial<{
  name: string;
  description: string;
  isActive: boolean;
}>;

export type ProductEmailSettingsPutInput = Partial<{
  isEnabled: boolean;
  defaultEmailSenderId: number | null;
  emailHeaderHtml: string | null;
  emailFooterHtml: string | null;
}>;

export type ProductBrandingPutInput = Partial<{
  displayName: string | null;
  websiteUrl: string | null;
  trackingDomain: string | null;
  senderDomain: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  brandColor: string | null;
  supportEmail: string | null;
  addressText: string | null;
  privacyPolicyUrl: string | null;
  termsUrl: string | null;
  unsubscribeUrl: string | null;
  isActive: boolean;
}>;

export function productsService(infra: { dbEngage: any }) {
 

  return {
    async list(orgId:number) {  
    const res = await infra.dbEngage.query(
        `SELECT id, org_id AS "orgId", name, description,
                is_active AS "isActive",
                created_at AS "createdAt", updated_at AS "updatedAt"
         FROM products
         WHERE org_id=$1
         ORDER BY id DESC`,
        [orgId]
      );
      return res.rows[0];
    },

    async get(ctx: AuthCtx, id: number) {
      return db.oneOrNone(
        `SELECT id, org_id AS "orgId", name, description,
                is_active AS "isActive",
                created_at AS "createdAt", updated_at AS "updatedAt"
         FROM products
         WHERE org_id=$1 AND id=$2`,
        [ctx.orgId, id]
      );
    },

    async create(ctx: AuthCtx, input: ProductCreateInput) {
      return db.tx(async (tx: any) => {
        const product = await tx.one(
          `INSERT INTO products (org_id, name, description, is_active, created_by, updated_by)
           VALUES ($1,$2,$3,true,$4,$4)
           RETURNING id, org_id AS "orgId", name, description,
                     is_active AS "isActive",
                     created_at AS "createdAt", updated_at AS "updatedAt"`,
          [ctx.orgId, input.name, input.description, ctx.userId]
        );

        // Email settings row (channel='email') always ensured
        await tx.none(
          `INSERT INTO product_channel_settings
           (org_id, product_id, channel, default_email_sender_id, email_header_html, email_footer_html, is_enabled)
           VALUES ($1,$2,'email',$3,$4,$5,true)
           ON CONFLICT (product_id, channel) DO NOTHING`,
          [
            ctx.orgId,
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
           (product_id, org_id, display_name, website_url, tracking_domain, sender_domain,
            logo_url, favicon_url, brand_color, support_email, address_text,
            privacy_policy_url, terms_url, unsubscribe_url, is_active, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, COALESCE($15,true), now(), now())
           ON CONFLICT (product_id) DO NOTHING`,
          [
            product.id, ctx.orgId,
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

    async patch(ctx: AuthCtx, id: number, input: ProductPatchInput) {
      return db.oneOrNone(
        `UPDATE products
         SET name=COALESCE($3,name),
             description=COALESCE($4,description),
             is_active=COALESCE($5,is_active),
             updated_by=$6,
             updated_at=now()
         WHERE org_id=$1 AND id=$2
         RETURNING id, org_id AS "orgId", name, description,
                   is_active AS "isActive",
                   created_at AS "createdAt", updated_at AS "updatedAt"`,
        [ctx.orgId, id, input.name ?? null, input.description ?? null, input.isActive ?? null, ctx.userId]
      );
    },

    async getEmailSettings(ctx: AuthCtx, productId: number) {
      return db.oneOrNone(
        `SELECT product_id AS "productId",
                channel,
                is_enabled AS "isEnabled",
                default_email_sender_id AS "defaultEmailSenderId",
                email_header_html AS "emailHeaderHtml",
                email_footer_html AS "emailFooterHtml"
         FROM product_channel_settings
         WHERE org_id=$1 AND product_id=$2 AND channel='email'`,
        [ctx.orgId, productId]
      );
    },

    async putEmailSettings(ctx: AuthCtx, productId: number, input: ProductEmailSettingsPutInput) {
      return db.oneOrNone(
        `UPDATE product_channel_settings
         SET is_enabled=COALESCE($3,is_enabled),
             default_email_sender_id=COALESCE($4,default_email_sender_id),
             email_header_html=COALESCE($5,email_header_html),
             email_footer_html=COALESCE($6,email_footer_html),
             updated_at=now()
         WHERE org_id=$1 AND product_id=$2 AND channel='email'
         RETURNING product_id AS "productId",
                channel,
                is_enabled AS "isEnabled",
                default_email_sender_id AS "defaultEmailSenderId",
                email_header_html AS "emailHeaderHtml",
                email_footer_html AS "emailFooterHtml"`,
        [ctx.orgId, productId, input.isEnabled ?? null, input.defaultEmailSenderId ?? null, input.emailHeaderHtml ?? null, input.emailFooterHtml ?? null]
      );
    },

    async getBranding(ctx: AuthCtx, productId: number) {
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
         WHERE org_id=$1 AND product_id=$2`,
        [ctx.orgId, productId]
      );
    },

    async putBranding(ctx: AuthCtx, productId: number, input: ProductBrandingPutInput) {
      // upsert (insert if missing, else update)
      return db.one(
        `INSERT INTO product_branding
         (product_id, org_id, display_name, website_url, tracking_domain, sender_domain,
          logo_url, favicon_url, brand_color, support_email, address_text,
          privacy_policy_url, terms_url, unsubscribe_url, is_active, created_at, updated_at)
         VALUES ($2,$1,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, COALESCE($15,true), now(), now())
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
          ctx.orgId, productId,
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
