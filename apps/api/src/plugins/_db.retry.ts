import { env } from "../config.env.js";

export type LoggerLike = {
  info: (obj: unknown, msg?: string) => void;
  warn: (obj: unknown, msg?: string) => void;
  error: (obj: unknown, msg?: string) => void;
};

const TRANSIENT_NODE_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EAI_AGAIN",
  "ENOTFOUND",
]);

const TRANSIENT_PG_CODES = new Set(["53300", "57P03", "08006", "08001"]);

function isTransientDbError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  const code = err.code;
  const message = String(err.message ?? "").toLowerCase();

  if (code && TRANSIENT_NODE_CODES.has(code)) return true;
  if (code && TRANSIENT_PG_CODES.has(code)) return true;

  return (
    message.includes("too many clients") ||
    message.includes("terminating connection") ||
    message.includes("connection refused") ||
    message.includes("timeout") ||
    message.includes("could not connect") ||
    message.includes("server closed the connection") ||
    message.includes("getaddrinfo")
  );
}

export async function connectWithRetry(
  label: string,
  fn: () => Promise<void>,
  log: LoggerLike,
  opts?: {
    attempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    enabled?: boolean;
  },
) {
  const enabled = opts?.enabled ?? env.dbRetryEnabled;
  const attempts = opts?.attempts ?? env.dbRetryAttempts;
  const baseDelayMs = opts?.baseDelayMs ?? env.dbRetryDelayMs;
  const maxDelayMs = opts?.maxDelayMs ?? env.dbRetryMaxDelayMs;

  if (!enabled) {
    await fn();
    log.info({ label }, `[${label}] ready (no retry) ✅`);
    return;
  }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await fn();
      log.info({ label, attempt }, `[${label}] ready ✅`);
      return;
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const transient = isTransientDbError(err);

      if (!transient) {
        log.error({ label, attempt, code: err.code, message: err.message }, `[${label}] non-transient DB error, not retrying ❌`);
        throw err;
      }

      if (attempt === attempts) {
        log.error({ label, attempt, attempts, code: err.code, message: err.message }, `[${label}] still failing after retries ❌`);
        throw err;
      }

      const delay = Math.min(maxDelayMs, baseDelayMs * attempt);
      log.warn({ label, attempt, attempts, delay, code: err.code, message: err.message }, `[${label}] transient DB error, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
