import type { FastifyReply } from "fastify";

type SuccessPayload<T> = { ok: true } & T;

type ErrorPayload = {
  ok: false;
  error: string;
};

export class BaseController {
  protected sendOk<T extends Record<string, unknown>>(reply: FastifyReply, payload: T): FastifyReply {
    return reply.send({ ok: true, ...payload } satisfies SuccessPayload<T>);
  }

  protected sendCreated<T extends Record<string, unknown>>(reply: FastifyReply, payload: T): FastifyReply {
    return reply.code(201).send({ ok: true, ...payload } satisfies SuccessPayload<T>);
  }

  protected sendError(reply: FastifyReply, statusCode: number, error: string): FastifyReply {
    return reply.code(statusCode).send({ ok: false, error } satisfies ErrorPayload);
  }
}
