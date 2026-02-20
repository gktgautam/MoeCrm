export type Product = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductBranding = {
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
};

export type ProductCreateInput = {
  name: string;
  description: string;
  defaultEmailSenderId: number | null;
  emailHeaderHtml: string | null;
  emailFooterHtml: string | null;
  branding?: ProductBranding;
};

export type ProductListResponse = {
  ok: boolean;
  items: Product[];
};

export type ProductCreateResponse = {
  ok: boolean;
  product: Product;
};
