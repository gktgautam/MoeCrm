import { FastifyRequest, FastifyReply } from "fastify";
import { userProfiles } from "./users.model.js";

export async function getUsers(req: FastifyRequest, reply: FastifyReply) {
  return { users: userProfiles };
}
