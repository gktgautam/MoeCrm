export type ErrorCode =
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
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

const defaultMessageByCode: Record<ErrorCode, string> = {
  BAD_REQUEST: "Bad request",
  VALIDATION_ERROR: "Validation failed",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not found",
  CONFLICT: "Conflict",
  INVALID_CREDENTIALS: "Invalid credentials",
  EMAIL_EXISTS: "Email already exists",
  INVALID_UPDATED_AFTER: "Invalid updatedAfter parameter",
  SERVICE_UNAVAILABLE: "Service unavailable",
  INTERNAL_SERVER_ERROR: "Internal server error",
};

function createError(statusCode: number, code: ErrorCode, message?: string, details?: unknown): AppError {
  return new AppError(statusCode, code, message ?? defaultMessageByCode[code], details);
}

export const Errors = {
  badRequest: (message?: string, details?: unknown) => createError(400, "BAD_REQUEST", message, details),
  validation: (message?: string, details?: unknown) => createError(400, "VALIDATION_ERROR", message, details),
  unauthorized: (message?: string) => createError(401, "UNAUTHORIZED", message),
  forbidden: (message?: string) => createError(403, "FORBIDDEN", message),
  notFound: (message?: string) => createError(404, "NOT_FOUND", message),
  conflict: (message?: string) => createError(409, "CONFLICT", message),
  invalidCredentials: (message?: string) => createError(401, "INVALID_CREDENTIALS", message),
  emailExists: (message?: string) => createError(409, "EMAIL_EXISTS", message),
  invalidUpdatedAfter: (message?: string) => createError(400, "INVALID_UPDATED_AFTER", message),
  serviceUnavailable: (message?: string) => createError(503, "SERVICE_UNAVAILABLE", message),
  internal: (message?: string, details?: unknown) =>
    createError(500, "INTERNAL_SERVER_ERROR", message, details),
};
