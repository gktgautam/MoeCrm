import axios, { type AxiosError } from "axios";

export type ApiErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    details?: unknown;
  };
};

export type ApiError = AxiosError<ApiErrorResponse>;

function isApiErrorResponse(x: unknown): x is ApiErrorResponse {
  if (!x || typeof x !== "object") return false;
  const anyX = x as any;
  return anyX.ok === false && anyX.error && typeof anyX.error.message === "string";
}

export function getApiErrorMessage(err: unknown): string {
  // ✅ If someone threw response.data (plain object)
  if (isApiErrorResponse(err)) return err.error.message;

  // ✅ Real axios error
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (isApiErrorResponse(data)) return data.error.message;
    return err.message || "REQUEST_FAILED";
  }

  // ✅ Normal Error
  if (err instanceof Error) return err.message;

  return "REQUEST_FAILED";
}

export function getApiErrorCode(err: unknown): string | undefined {
  if (isApiErrorResponse(err)) return err.error.code;
  if (axios.isAxiosError(err)) return err.response?.data?.error?.code;
  return undefined;
}

export function getApiRequestId(err: unknown): string | undefined {
  if (isApiErrorResponse(err)) return err.error.requestId;
  if (axios.isAxiosError(err)) return err.response?.data?.error?.requestId;
  return undefined;
}
