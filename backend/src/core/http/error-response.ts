import { Type, type Static } from "@sinclair/typebox";
import type { ErrorCode } from "./app-error";

export const ErrorCodeSchema = Type.Union([
  Type.Literal("BAD_REQUEST"),
  Type.Literal("VALIDATION_ERROR"),
  Type.Literal("UNAUTHORIZED"),
  Type.Literal("FORBIDDEN"),
  Type.Literal("NOT_FOUND"),
  Type.Literal("CONFLICT"),
  Type.Literal("INVALID_CREDENTIALS"),
  Type.Literal("EMAIL_EXISTS"),
  Type.Literal("INVALID_UPDATED_AFTER"),
  Type.Literal("SERVICE_UNAVAILABLE"),
  Type.Literal("INTERNAL_SERVER_ERROR"),
]);

export const ErrorResponseSchema = Type.Object({
  ok: Type.Literal(false),
  error: Type.Object({
    code: ErrorCodeSchema,
    message: Type.String(),
    requestId: Type.String(),
    details: Type.Optional(Type.Unknown()),
  }),
});

export type ErrorResponse = Static<typeof ErrorResponseSchema>;

export function buildErrorResponse(
  requestId: string,
  error: { code: ErrorCode; message: string; details?: unknown }
): ErrorResponse {
  return {
    ok: false,
    error: {
      code: error.code,
      message: error.message,
      requestId,
      ...(error.details === undefined ? {} : { details: error.details }),
    },
  };
}
