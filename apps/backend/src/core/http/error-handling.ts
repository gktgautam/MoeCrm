import { Type } from "@sinclair/typebox";
import type { FastifyRequest } from "fastify";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_CREDENTIALS"
  | "EMAIL_EXISTS"
  | "INVALID_UPDATED_AFTER"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_SERVER_ERROR";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(params: { statusCode: number; code: ApiErrorCode; message: string; details?: unknown }) {
    super(params.message);
    this.name = "AppError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
  }
}

export const apiErrorSchema = Type.Object({
  ok: Type.Literal(false),
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Unknown()),
  }),
  requestId: Type.String(),
});

export function makeApiErrorPayload(requestId: string, error: { code: string; message: string; details?: unknown }) {
  return {
    ok: false as const,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
    requestId,
  };
}

export function mapErrorToHttp(error: unknown, req: FastifyRequest) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      payload: makeApiErrorPayload(req.id, {
        code: error.code,
        message: error.message,
        details: error.details,
      }),
      level: error.statusCode >= 500 ? "error" : "warn",
    } as const;
  }

  if ((error as { validation?: unknown })?.validation) {
    return {
      statusCode: 400,
      payload: makeApiErrorPayload(req.id, {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: (error as { validation: unknown }).validation,
      }),
      level: "warn",
    } as const;
  }

  const statusCode = (error as { statusCode?: number })?.statusCode;
  if (statusCode === 401) {
    return {
      statusCode: 401,
      payload: makeApiErrorPayload(req.id, {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      }),
      level: "warn",
    } as const;
  }

  if (statusCode === 403) {
    return {
      statusCode: 403,
      payload: makeApiErrorPayload(req.id, {
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      }),
      level: "warn",
    } as const;
  }

  if (statusCode === 404) {
    return {
      statusCode: 404,
      payload: makeApiErrorPayload(req.id, {
        code: "NOT_FOUND",
        message: "Resource not found",
      }),
      level: "warn",
    } as const;
  }

  return {
    statusCode: 500,
    payload: makeApiErrorPayload(req.id, {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error",
    }),
    level: "error",
  } as const;
}
