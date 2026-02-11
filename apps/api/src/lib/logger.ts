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
        const err = error as {
          name?: string;
          code?: string;
          message?: string;
          stack?: string;
          aggregateErrors?: Array<{ code?: string; message?: string; address?: string; port?: number }>;
        };

        return {
          type: err.name ?? "Error",
          code: err.code,
          message: err.message ?? "",
          causes: Array.isArray(err.aggregateErrors)
            ? err.aggregateErrors.map((cause) => ({
                code: cause.code,
                message: cause.message,
                address: cause.address,
                port: cause.port,
              }))
            : undefined,
          stack: err.stack ?? "",
        };
      },
    },
  };
}
