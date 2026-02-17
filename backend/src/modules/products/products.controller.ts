 
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Errors } from "@/core/http/app-error";

import { productsService } from "./products.service";

 

export function productsController(app: FastifyInstance) {
 const svc = productsService(app);

  return {
    list: async (req: FastifyRequest, reply: FastifyReply) => { 
      const items = await svc.list();
      if (!items) {
            throw Errors.notFound()
      }

      return { ok: true, items }; 
    },

    get: async (req: FastifyRequest, reply: FastifyReply) => {
      const id = Number((req.params as any).id);
      const product = await svc.get(id);
      if (!product) return reply.code(404).send({ ok: false, error: "PRODUCT_NOT_FOUND" });
      return reply.send({ ok: true, product });
    },

    create: async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = Number(req.auth?.userId);

      const product = await svc.create(userId, req.body as any);
      return reply.send({ ok: true, product });
    },

    patch: async (req: FastifyRequest, reply: FastifyReply) => {
      const id = Number((req.params as any).id);
      const userId = Number(req.auth?.userId);

      const product = await svc.patch(userId, id, req.body as any);
      if (!product) return reply.code(404).send({ ok: false, error: "PRODUCT_NOT_FOUND" });
      return reply.send({ ok: true, product });
    },

    getEmailSettings: async (req: FastifyRequest, reply: FastifyReply) => {
      const productId = Number((req.params as any).id);
      const settings = await svc.getEmailSettings(productId);
      if (!settings) return reply.code(404).send({ ok: false, error: "EMAIL_SETTINGS_NOT_FOUND" });
      return reply.send({ ok: true, settings });
    },

    putEmailSettings: async (req: FastifyRequest, reply: FastifyReply) => {
      const productId = Number((req.params as any).id);
      const settings = await svc.putEmailSettings(productId, req.body as any);
      if (!settings) return reply.code(404).send({ ok: false, error: "EMAIL_SETTINGS_NOT_FOUND" });
      return reply.send({ ok: true, settings });
    },

    getBranding: async (req: FastifyRequest, reply: FastifyReply) => {
      const productId = Number((req.params as any).id);
      const branding = await svc.getBranding(productId);

      // UI-friendly: if no row, return defaults (optional)
      if (!branding) {
        return reply.send({
          ok: true,
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

      return reply.send({ ok: true, branding });
    },

    putBranding: async (req: FastifyRequest, reply: FastifyReply) => {
      const productId = Number((req.params as any).id);
      const branding = await svc.putBranding(productId, req.body as any);
      return reply.send({ ok: true, branding });
    },
  };
}
