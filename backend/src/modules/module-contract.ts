import type { FastifyPluginAsync } from "fastify";

export type ApiModule = {
  name: string;
  prefix: string;
  routes: FastifyPluginAsync;
};
