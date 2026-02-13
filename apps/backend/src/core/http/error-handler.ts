import type { FastifyInstance, FastifyRequest } from "fastify";
import { AppError, type ErrorCode } from "./app-error.js";
import { buildErrorResponse } from "./error-response.js";

type HttpError = {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
};

function isValidationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { validation?: unknown; code?: string };
  return Array.isArray(e.validation) || e.code === "FST_ERR_VALIDATION";
}

export function toHttpError(error: unknown, _requestId?: string): HttpError {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (isValidationError(error)) {
    const e = error as { message?: string; validation?: unknown };
    return {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: e.message ?? "Validation failed",
      details: e.validation,
    };
  }

  return {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  };
}

export function registerErrorHandling(app: FastifyInstance): void {
  app.setErrorHandler((error, req, reply) => {
    const requestId = String(req.id);
    const httpError = toHttpError(error, requestId);
    const payload = buildErrorResponse(requestId, httpError);

    if (httpError.statusCode >= 500) {
      req.log.error(
        { err: error, requestId, code: httpError.code, statusCode: httpError.statusCode },
        "Request failed"
      );
    } else {
      req.log.warn(
        { err: error, requestId, code: httpError.code, statusCode: httpError.statusCode },
        "Request rejected"
      );
    }

    reply.code(httpError.statusCode).send(payload);
  });

  app.setNotFoundHandler((req, reply) => {
    const requestId = String(req.id);
    const notFoundError = toHttpError(new AppError(404, "NOT_FOUND", "Route not found"), requestId);
    reply.code(404).send(buildErrorResponse(requestId, notFoundError));
  });

  app.addHook("onResponse", (req: FastifyRequest, reply, done) => {
    const path = req.routeOptions?.url ?? req.url;
    const payload = {
      requestId: String(req.id),
      method: req.method,
      path,
      statusCode: reply.statusCode,
      responseTimeMs: reply.elapsedTime,
    };

    if (reply.statusCode >= 500) {
      req.log.error(payload, "Request completed");
    } else if (reply.statusCode >= 400) {
      req.log.warn(payload, "Request completed");
    } else {
      req.log.info(payload, "Request completed");
    }

    done();
  });
}
