// apps/backend/src/modules/engage/products/products.routes.ts
import type { FastifyPluginAsync } from "fastify"; 
import { requireAuth, requireOrgAccess, requirePermission } from "../auth/auth.guard";
import { productsController } from "./products.controller";
import {
  ProductCreateBody,
  ProductCreateResponse,
  ProductGetResponse,
  ProductListResponse,
  ProductPatchBody,
  ProductEmailSettingsGetResponse,
  ProductEmailSettingsPutBody,
  ProductBrandingGetResponse,
  ProductBrandingPutBody,
} from "./products.schemas";

export const productsRoutes: FastifyPluginAsync = async (app) => {
  const ctrl = productsController(app);
  
  // Add default tags to all routes in this plugin
  app.addHook("onRoute", (routeOptions) => {
    routeOptions.schema = routeOptions.schema ?? {};
    routeOptions.schema.tags = [
      ...(routeOptions.schema.tags ?? []),
      "product",
    ];
  });

  app.addHook("preHandler", requireAuth); 

  app.get("/products", {
    preHandler: [ requirePermission({ anyOf: ["products:read"] })],
    schema: { response: { 200: ProductListResponse } },
    handler: ctrl.list,
  });

  app.post("/products", {
    preHandler: [ requirePermission({ anyOf: ["products:write"] })],
    schema: { body: ProductCreateBody, response: { 200: ProductCreateResponse } },
    handler: ctrl.create,
  });

  app.get("/products/:id", {
    preHandler: [requirePermission({ anyOf: ["products:read"] })],
    schema: { response: { 200: ProductGetResponse } },
    handler: ctrl.get,
  });

  app.patch("/products/:id", {
    preHandler: [ requirePermission({ anyOf: ["products:write"] })],
    schema: { body: ProductPatchBody },
    handler: ctrl.patch,
  });

  // Email settings
  app.get("/products/:id/email-settings", {
    preHandler: [requirePermission({ anyOf: ["products:read"] })],
    schema: { response: { 200: ProductEmailSettingsGetResponse } },
    handler: ctrl.getEmailSettings,
  });

  app.put("/products/:id/email-settings", {
    preHandler: [ requirePermission({ anyOf: ["products:write"] })],
    schema: { body: ProductEmailSettingsPutBody, response: { 200: ProductEmailSettingsGetResponse } },
    handler: ctrl.putEmailSettings,
  });

  // Branding
  app.get("/products/:id/branding", {
    preHandler: [requirePermission({ anyOf: ["products:read"] })],
    schema: { response: { 200: ProductBrandingGetResponse } },
    handler: ctrl.getBranding,
  });

  app.put("/products/:id/branding", {
    preHandler: [requirePermission({ anyOf: ["products:write"] })],
    schema: { body: ProductBrandingPutBody, response: { 200: ProductBrandingGetResponse } },
    handler: ctrl.putBranding,
  });
};
