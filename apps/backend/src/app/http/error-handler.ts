import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

type ErrorPayload = {
  ok: false;
  error: string;
  message?: string;
  requestId: string;
  details?: unknown;
};

type NormalizedError = {
  statusCode: number;
  code: string;
  message?: string;
  details?: unknown;
  shouldLogAsError: boolean;
};

const isValidationError = (error: unknown): boolean => {
  return Boolean((error as { validation?: unknown })?.validation);
};

const normalizeError = (error: FastifyError): NormalizedError => {
  const statusCode = Number(error.statusCode ?? 500);

  if (isValidationError(error)) {
    return {
      statusCode: 400,
      code: "BAD_REQUEST",
      message: "Invalid request payload",
      details: error.validation,
      shouldLogAsError: false,
    };
  }

  if (statusCode >= 400 && statusCode < 500) {
    const code = error.code === "FST_ERR_NOT_FOUND" ? "NOT_FOUND" : "REQUEST_ERROR";
    return {
      statusCode,
      code,
      message: error.message,
      shouldLogAsError: false,
    };
  }

  return {
    statusCode: 500,
    code: "SERVER_ERROR",
    message: "Unexpected server error",
    shouldLogAsError: true,
  };
};

export const sendApiError = (reply: FastifyReply, requestId: string, error: NormalizedError) => {
  const payload: ErrorPayload = {
    ok: false,
    error: error.code,
    requestId,
  };

  if (error.message) {
    payload.message = error.message;
  }

  if (error.details !== undefined) {
    payload.details = error.details;
  }

  return reply.code(error.statusCode).send(payload);
};

export function registerGlobalErrorHandlers(app: {
  setErrorHandler: (handler: (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => unknown) => void;
  setNotFoundHandler: (handler: (request: FastifyRequest, reply: FastifyReply) => unknown) => void;
}) {
  app.setErrorHandler((error, request, reply) => {
    const normalizedError = normalizeError(error);

    if (normalizedError.shouldLogAsError) {
      request.log.error(
        {
          err: error,
          requestId: request.id,
          method: request.method,
          url: request.url,
        },
        "Unhandled API error",
      );
    } else {
      request.log.warn(
        {
          err: error,
          requestId: request.id,
          method: request.method,
          url: request.url,
        },
        "Handled API request error",
      );
    }

    return sendApiError(reply, request.id, normalizedError);
  });

  app.setNotFoundHandler((request, reply) => {
    request.log.warn(
      {
        requestId: request.id,
        method: request.method,
        url: request.url,
      },
      "Route not found",
    );

    return reply.code(404).send({
      ok: false,
      error: "NOT_FOUND",
      requestId: request.id,
      message: "Route not found",
    });
  });
}
