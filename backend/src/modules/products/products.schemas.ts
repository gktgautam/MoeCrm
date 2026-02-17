// apps/backend/src/modules/engage/products/products.schemas.ts
import { Static, Type } from "@sinclair/typebox";

export const ProductRow = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  description: Type.String(),
  isActive: Type.Boolean(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

export type ProductRowType = Static<typeof ProductRow>;

export const ProductListResponse = Type.Object({
  ok: Type.Boolean(),
  items: Type.Array(ProductRow),
});

export type ProductListResponseType = Static<typeof ProductListResponse>;

export const ProductGetResponse = Type.Object({
  ok: Type.Boolean(),
  product: ProductRow,
});

export type ProductGetResponseType = Static<typeof ProductGetResponse>;

export const ProductCreateBody = Type.Object({
  name: Type.String({ minLength: 2 }),
  description: Type.String({ minLength: 1 }),

  // email defaults (writes to product_channel_settings row for channel='email')
  defaultEmailSenderId: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  emailHeaderHtml: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  emailFooterHtml: Type.Optional(Type.Union([Type.String(), Type.Null()])),

  // branding (writes to product_branding)
  branding: Type.Optional(
    Type.Object({
      displayName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      websiteUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      trackingDomain: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      senderDomain: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      logoUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      faviconUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      brandColor: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      supportEmail: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      addressText: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      privacyPolicyUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      termsUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      unsubscribeUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      isActive: Type.Optional(Type.Boolean()),
    })
  ),
});

export type ProductCreateBodyType = Static<typeof ProductCreateBody>;

export const ProductCreateResponse = Type.Object({
  ok: Type.Boolean(),
  product: ProductRow,
});

export type ProductCreateResponseType = Static<typeof ProductCreateResponse>;

export const ProductPatchBody = Type.Partial(
  Type.Object({
    name: Type.String({ minLength: 2 }),
    description: Type.String({ minLength: 1 }),
    isActive: Type.Boolean(),
  })
);

export type ProductPatchBodyType = Static<typeof ProductPatchBody>;

export const ProductEmailSettingsRow = Type.Object({
  productId: Type.Number(),
  channel: Type.Literal("email"),
  isEnabled: Type.Boolean(),
  defaultEmailSenderId: Type.Union([Type.Number(), Type.Null()]),
  emailHeaderHtml: Type.Union([Type.String(), Type.Null()]),
  emailFooterHtml: Type.Union([Type.String(), Type.Null()]),
});

export type ProductEmailSettingsRowType = Static<typeof ProductEmailSettingsRow>;

export const ProductEmailSettingsGetResponse = Type.Object({
  ok: Type.Boolean(),
  settings: ProductEmailSettingsRow,
});

export type ProductEmailSettingsGetResponseType = Static<
  typeof ProductEmailSettingsGetResponse
>;

export const ProductEmailSettingsPutBody = Type.Partial(
  Type.Object({
    isEnabled: Type.Boolean(),
    defaultEmailSenderId: Type.Union([Type.Number(), Type.Null()]),
    emailHeaderHtml: Type.Union([Type.String(), Type.Null()]),
    emailFooterHtml: Type.Union([Type.String(), Type.Null()]),
  })
);

export type ProductEmailSettingsPutBodyType = Static<
  typeof ProductEmailSettingsPutBody
>;

export const ProductBrandingRow = Type.Object({
  productId: Type.Number(),
  displayName: Type.Union([Type.String(), Type.Null()]),
  websiteUrl: Type.Union([Type.String(), Type.Null()]),
  trackingDomain: Type.Union([Type.String(), Type.Null()]),
  senderDomain: Type.Union([Type.String(), Type.Null()]),
  logoUrl: Type.Union([Type.String(), Type.Null()]),
  faviconUrl: Type.Union([Type.String(), Type.Null()]),
  brandColor: Type.Union([Type.String(), Type.Null()]),
  supportEmail: Type.Union([Type.String(), Type.Null()]),
  addressText: Type.Union([Type.String(), Type.Null()]),
  privacyPolicyUrl: Type.Union([Type.String(), Type.Null()]),
  termsUrl: Type.Union([Type.String(), Type.Null()]),
  unsubscribeUrl: Type.Union([Type.String(), Type.Null()]),
  isActive: Type.Boolean(),
});

export type ProductBrandingRowType = Static<typeof ProductBrandingRow>;

export const ProductBrandingGetResponse = Type.Object({
  ok: Type.Boolean(),
  branding: ProductBrandingRow,
});

export type ProductBrandingGetResponseType = Static<typeof ProductBrandingGetResponse>;

export const ProductBrandingPutBody = Type.Partial(
  Type.Object({
    displayName: Type.Union([Type.String(), Type.Null()]),
    websiteUrl: Type.Union([Type.String(), Type.Null()]),
    trackingDomain: Type.Union([Type.String(), Type.Null()]),
    senderDomain: Type.Union([Type.String(), Type.Null()]),
    logoUrl: Type.Union([Type.String(), Type.Null()]),
    faviconUrl: Type.Union([Type.String(), Type.Null()]),
    brandColor: Type.Union([Type.String(), Type.Null()]),
    supportEmail: Type.Union([Type.String(), Type.Null()]),
    addressText: Type.Union([Type.String(), Type.Null()]),
    privacyPolicyUrl: Type.Union([Type.String(), Type.Null()]),
    termsUrl: Type.Union([Type.String(), Type.Null()]),
    unsubscribeUrl: Type.Union([Type.String(), Type.Null()]),
    isActive: Type.Boolean(),
  })
);

export type ProductBrandingPutBodyType = Static<typeof ProductBrandingPutBody>;
