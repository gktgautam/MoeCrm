import { FastifyRequest, FastifyReply } from "fastify";

export async function getStats(req: FastifyRequest, reply: FastifyReply) {
  return { users: 2, jobs: 2, revenue: 1000 };
}
