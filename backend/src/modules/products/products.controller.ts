import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { productsService } from "./products.service";
import { Errors } from "@/core/http/app-error";

function ctx(req: FastifyRequest) {
  return {
    dbEngage: req.server.dbEngage,
    userId: req.auth!.userId,
  };
}

export function productsController(app: FastifyInstance) {
  const svc = productsService({ dbEngage: app.dbEngage });

  return {
    list: async (_req: FastifyRequest) => {
      const items = await svc.list();
      if (!items) throw Errors.notFound();
      return { ok: true, items };
    },

    get: async (req: FastifyRequest, reply: FastifyReply) => {
      const id = Number((req.params as any).id);
      const product = await svc.get(ctx(req), id);
      if (!product) return reply.code(404).send({ ok: false, error: "PRODUCT_NOT_FOUND" });
      return reply.send({ ok: true, product });
    },

    create: async (req: FastifyRequest, reply: FastifyReply) => {
      const product = await svc.create(ctx(req), req.body as any);
      return reply.send({ ok: true, product });
    },

    patch: async (req: FastifyRequest, reply: FastifyReply) => {
      const id = Number((req.params as any).id);
      const product = await svc.patch(ctx(req), id, req.body as any);
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
      if (!branding) return reply.send({ ok: true, branding: { productId, isActive: true } });
      return reply.send({ ok: true, branding });
    },

    putBranding: async (req: FastifyRequest, reply: FastifyReply) => {
      const productId = Number((req.params as any).id);
      const branding = await svc.putBranding(productId, req.body as any);
      return reply.send({ ok: true, branding });
    },
  };
}
