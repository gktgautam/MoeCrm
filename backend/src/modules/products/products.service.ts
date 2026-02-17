export type AuthCtx = { userId: string };

export type ProductCreateInput = {
  name: string;
  description: string;
};

export type ProductPatchInput = Partial<{ name: string; description: string; isActive: boolean }>;
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
    async list() {
      const res = await infra.dbEngage.query(
        `SELECT id, name, description, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
         FROM products
         ORDER BY id DESC`,
      );
      return res.rows;
    },

    async get(_ctx: AuthCtx, id: number) {
      const { rows } = await infra.dbEngage.query(
        `SELECT id, name, description, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
         FROM products
         WHERE id=$1`,
        [id],
      );
      return rows[0] ?? null;
    },

    async create(ctx: AuthCtx, input: ProductCreateInput) {
      const { rows } = await infra.dbEngage.query(
        `INSERT INTO products (name, description, is_active, created_by, updated_by)
         VALUES ($1,$2,true,$3,$3)
         RETURNING id, name, description, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"`,
        [input.name, input.description, ctx.userId],
      );
      return rows[0];
    },

    async patch(ctx: AuthCtx, id: number, input: ProductPatchInput) {
      const { rows } = await infra.dbEngage.query(
        `UPDATE products
         SET name=COALESCE($2,name), description=COALESCE($3,description), is_active=COALESCE($4,is_active), updated_by=$5, updated_at=now()
         WHERE id=$1
         RETURNING id, name, description, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"`,
        [id, input.name ?? null, input.description ?? null, input.isActive ?? null, ctx.userId],
      );
      return rows[0] ?? null;
    },

    async getEmailSettings(productId: number) {
      const { rows } = await infra.dbEngage.query(
        `SELECT product_id AS "productId", channel, is_enabled AS "isEnabled", default_email_sender_id AS "defaultEmailSenderId", email_header_html AS "emailHeaderHtml", email_footer_html AS "emailFooterHtml"
         FROM product_channel_settings
         WHERE product_id=$1 AND channel='email'`,
        [productId],
      );
      return rows[0] ?? null;
    },

    async putEmailSettings(productId: number, input: ProductEmailSettingsPutInput) {
      const { rows } = await infra.dbEngage.query(
        `UPDATE product_channel_settings
         SET is_enabled=COALESCE($2,is_enabled), default_email_sender_id=COALESCE($3,default_email_sender_id), email_header_html=COALESCE($4,email_header_html), email_footer_html=COALESCE($5,email_footer_html), updated_at=now()
         WHERE product_id=$1 AND channel='email'
         RETURNING product_id AS "productId", channel, is_enabled AS "isEnabled", default_email_sender_id AS "defaultEmailSenderId", email_header_html AS "emailHeaderHtml", email_footer_html AS "emailFooterHtml"`,
        [productId, input.isEnabled ?? null, input.defaultEmailSenderId ?? null, input.emailHeaderHtml ?? null, input.emailFooterHtml ?? null],
      );
      return rows[0] ?? null;
    },

    async getBranding(productId: number) {
      const { rows } = await infra.dbEngage.query(
        `SELECT product_id AS "productId", display_name AS "displayName", website_url AS "websiteUrl", tracking_domain AS "trackingDomain", sender_domain AS "senderDomain", logo_url AS "logoUrl", favicon_url AS "faviconUrl", brand_color AS "brandColor", support_email AS "supportEmail", address_text AS "addressText", privacy_policy_url AS "privacyPolicyUrl", terms_url AS "termsUrl", unsubscribe_url AS "unsubscribeUrl", is_active AS "isActive"
         FROM product_branding
         WHERE product_id=$1`,
        [productId],
      );
      return rows[0] ?? null;
    },

    async putBranding(productId: number, input: ProductBrandingPutInput) {
      const { rows } = await infra.dbEngage.query(
        `INSERT INTO product_branding
         (product_id, display_name, website_url, tracking_domain, sender_domain, logo_url, favicon_url, brand_color, support_email, address_text, privacy_policy_url, terms_url, unsubscribe_url, is_active, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,COALESCE($14,true),now(),now())
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
         RETURNING product_id AS "productId", display_name AS "displayName", website_url AS "websiteUrl", tracking_domain AS "trackingDomain", sender_domain AS "senderDomain", logo_url AS "logoUrl", favicon_url AS "faviconUrl", brand_color AS "brandColor", support_email AS "supportEmail", address_text AS "addressText", privacy_policy_url AS "privacyPolicyUrl", terms_url AS "termsUrl", unsubscribe_url AS "unsubscribeUrl", is_active AS "isActive"`,
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
        ],
      );
      return rows[0];
    },
  };
}
