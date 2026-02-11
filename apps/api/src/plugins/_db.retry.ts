// src/plugins/_db.retry.ts
export type LoggerLike = {
  info: (obj: any, msg?: string) => void;
  warn: (obj: any, msg?: string) => void;
  error: (obj: any, msg?: string) => void;
};

function isTransientDbError(err: any): boolean {
  const code = err?.code as string | undefined;  // pg error codes or node codes
  const msg = String(err?.message ?? "").toLowerCase();

  // Node/network transient
  const transientNodeCodes = new Set([
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "EAI_AGAIN",
    "ENOTFOUND",
  ]);

  if (code && transientNodeCodes.has(code)) return true;

  // Postgres transient-ish
  // 53300: too_many_connections
  // 57P03: cannot_connect_now
  // 08006/08001: connection_failure/sqlclient_unable_to_establish_sqlconnection
  const transientPgCodes = new Set(["53300", "57P03", "08006", "08001"]);
  if (code && transientPgCodes.has(code)) return true;

  // Message heuristics (fallback)
  if (
    msg.includes("too many clients") ||
    msg.includes("terminating connection") ||
    msg.includes("connection refused") ||
    msg.includes("timeout") ||
    msg.includes("could not connect") ||
    msg.includes("server closed the connection") ||
    msg.includes("getaddrinfo")
  ) return true;

  return false;
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
  }
) {
  const enabled = opts?.enabled ?? ((process.env.DB_RETRY_ENABLED ?? "false") === "true");
  const attempts = opts?.attempts ?? Number(process.env.DB_RETRY_ATTEMPTS ?? 10);
  const baseDelayMs = opts?.baseDelayMs ?? Number(process.env.DB_RETRY_DELAY_MS ?? 800);
  const maxDelayMs = opts?.maxDelayMs ?? Number(process.env.DB_RETRY_MAX_DELAY_MS ?? 6000);

  if (!enabled) {
    await fn();
    log.info({ label }, `[${label}] ready (no retry) ✅`);
    return;
  }

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await fn();
      log.info({ label, attempt }, `[${label}] ready ✅`);
      return;
    } catch (err: any) {
      const transient = isTransientDbError(err);

      // Non-transient? fail fast (bad password, wrong DB name, etc.)
      if (!transient) {
        log.error(
          { label, attempt, code: err?.code, message: err?.message },
          `[${label}] non-transient DB error, not retrying ❌`
        );
        throw err;
      }

      // Transient & last attempt => throw
      if (attempt === attempts) {
        log.error(
          { label, attempt, attempts, code: err?.code, message: err?.message },
          `[${label}] still failing after retries ❌`
        );
        throw err;
      }

      const delay = Math.min(maxDelayMs, baseDelayMs * attempt); // simple backoff
      log.warn(
        { label, attempt, attempts, delay, code: err?.code, message: err?.message },
        `[${label}] transient DB error, retrying...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
