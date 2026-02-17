import type { FastifyServerOptions } from "fastify";

export function makeLoggerConfig(isProd: boolean): FastifyServerOptions["logger"] {
  if (isProd) return true;

  return {
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        messageKey: "msg",
        errorLikeObjectKeys: ["err", "error"],
      },
    },
  serializers: {
  err: (error: unknown) => {
    const e: any = error;

    // pg pool AggregateError uses `errors` array
    const inner = Array.isArray(e?.errors) ? e.errors : undefined;

    return {
      type: e?.name ?? "Error",
      code: e?.code,
      message: e?.message ?? "",
      // show inner connection errors (ECONNREFUSED on ::1 / 127.0.0.1 etc.)
      causes: inner
        ? inner.map((c: any) => ({
            type: c?.name,
            code: c?.code,
            message: c?.message,
            address: c?.address,
            port: c?.port,
          }))
        : undefined,
      stack: e?.stack ?? "",
    };
  },
  }, 
  };
}
