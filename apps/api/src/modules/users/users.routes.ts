import { FastifyPluginAsync } from "fastify";
import { getUsers } from "./users.controller.js";

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", getUsers);
};

export default usersRoutes;
