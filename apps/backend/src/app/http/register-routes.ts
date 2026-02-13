import type { FastifyInstance, FastifyPluginAsync } from "fastify";

import { API_V1_MODULES } from "@/modules/api-v1.registry";
import { PUBLIC_MODULES } from "@/modules/public.registry";

const registerModuleList = async (
  app: FastifyInstance,
  modules: { prefix: string; routes: FastifyPluginAsync }[]
) => {
  for (const moduleDefinition of modules) {
    await app.register(moduleDefinition.routes, { prefix: moduleDefinition.prefix });
  }
};

const v1Routes: FastifyPluginAsync = async (app) => {
  await registerModuleList(app, API_V1_MODULES);
};

const routes: FastifyPluginAsync = async (app) => {
  await registerModuleList(app, PUBLIC_MODULES);
  await app.register(v1Routes, { prefix: "/api/v1" });
};

export default routes;
