// apps/backend/src/modules/engage/products/products.controller.ts
import type { FastifyInstance, FastifyRequest } from "fastify";
import { BaseController } from "@/core/http/BaseController";
import { productsService } from "./products.service";

function ctx(req: FastifyRequest) {
  return { dbEngage: req.server.dbEngage, orgId: req.auth!.orgId, userId: req.auth!.userId };
}

class ProductsController extends BaseController {
  constructor(private readonly app: FastifyInstance) {
    super();
  }

  private get svc() {
    return productsService(this.app);
  }

  list = async (req: FastifyRequest) => {
    const items = await this.svc.list(ctx(req));
    return { ok: true, items };
  };

  get = async (req: FastifyRequest, reply: import("fastify").FastifyReply) => {
    const id = Number((req.params as any).id);
    const product = await this.svc.get(ctx(req), id);
    if (!product) return this.sendError(reply, 404, "PRODUCT_NOT_FOUND");
    return this.sendOk(reply, { product });
  };

  create = async (req: FastifyRequest, reply: import("fastify").FastifyReply) => {
    const product = await this.svc.create(ctx(req), req.body as any);
    return this.sendOk(reply, { product });
  };

  patch = async (req: FastifyRequest, reply: import("fastify").FastifyReply) => {
    const id = Number((req.params as any).id);
    const product = await this.svc.patch(ctx(req), id, req.body as any);
    if (!product) return this.sendError(reply, 404, "PRODUCT_NOT_FOUND");
    return this.sendOk(reply, { product });
  };

  getEmailSettings = async (req: FastifyRequest, reply: import("fastify").FastifyReply) => {
    const productId = Number((req.params as any).id);
    const settings = await this.svc.getEmailSettings(ctx(req), productId);
    if (!settings) return this.sendError(reply, 404, "EMAIL_SETTINGS_NOT_FOUND");
    return this.sendOk(reply, { settings });
  };

  putEmailSettings = async (req: FastifyRequest, reply: import("fastify").FastifyReply) => {
    const productId = Number((req.params as any).id);
    const settings = await this.svc.putEmailSettings(ctx(req), productId, req.body as any);
    if (!settings) return this.sendError(reply, 404, "EMAIL_SETTINGS_NOT_FOUND");
    return this.sendOk(reply, { settings });
  };

  getBranding = async (req: FastifyRequest, reply: import("fastify").FastifyReply) => {
    const productId = Number((req.params as any).id);
    const branding = await this.svc.getBranding(ctx(req), productId);

    if (!branding) {
      return this.sendOk(reply, {
        branding: {
          productId,
          displayName: null,
          websiteUrl: null,
          trackingDomain: null,
          senderDomain: null,
          logoUrl: null,
          faviconUrl: null,
          brandColor: null,
          supportEmail: null,
          addressText: null,
          privacyPolicyUrl: null,
          termsUrl: null,
          unsubscribeUrl: null,
          isActive: true,
        },
      });
    }

    return this.sendOk(reply, { branding });
  };

  putBranding = async (req: FastifyRequest, reply: import("fastify").FastifyReply) => {
    const productId = Number((req.params as any).id);
    const branding = await this.svc.putBranding(ctx(req), productId, req.body as any);
    return this.sendOk(reply, { branding });
  };
}

export function productsController(app: FastifyInstance) {
  return new ProductsController(app);
}
