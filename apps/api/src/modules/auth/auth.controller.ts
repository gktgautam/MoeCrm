import { FastifyRequest, FastifyReply } from "fastify";
import { users } from "./auth.model.js";
import { setSession, clearSession } from "../../lib/session.js";

export async function login(req: FastifyRequest, reply: FastifyReply) {
  const { email, password } = req.body as any;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return reply.status(401).send({ message: "Invalid credentials" });

  setSession(reply, user.id);
  return { user: { id: user.id, email: user.email, role: user.role, name: user.name } };
}

export async function me(req: FastifyRequest, reply: FastifyReply) {
  const session = req.cookies.session;
  if (!session) return reply.status(401).send({ message: "Not logged in" });

  const user = users.find(u => u.id === session);
  if (!user) return reply.status(401).send({ message: "Invalid session" });

  return { user: { id: user.id, email: user.email, role: user.role, name: user.name } };
}

export async function logout(req: FastifyRequest, reply: FastifyReply) {
  clearSession(reply);
  return { ok: true };
}
