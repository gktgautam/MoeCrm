import { FastifyPluginAsync } from "fastify";
import { getStats } from "./dashboard.controller.js";

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/stats", getStats);
};

export default dashboardRoutes;
