const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (!value) return fallback;
  return value.toLowerCase() === "true";
};

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: (process.env.NODE_ENV ?? "development") === "production",

  host: process.env.HOST ?? "0.0.0.0",
  port: toNumber(process.env.PORT, 8080),

  cookieSecret: required("COOKIE_SECRET"),
  jwtSecret: required("JWT_SECRET"),

  crmDbUrl: required("CRM_DB_URL"),
  engageDbUrl: required("ENGAGE_DB_URL"),

  pgPoolMax: toNumber(process.env.PG_POOL_MAX, 5),
  pgConnTimeoutMs: toNumber(process.env.PG_CONN_TIMEOUT_MS, 5000),
  pgIdleTimeoutMs: toNumber(process.env.PG_IDLE_TIMEOUT_MS, 30000),

  dbRetryEnabled: toBoolean(process.env.DB_RETRY_ENABLED, false),
  dbRetryAttempts: toNumber(process.env.DB_RETRY_ATTEMPTS, 10),
  dbRetryDelayMs: toNumber(process.env.DB_RETRY_DELAY_MS, 800),
  dbRetryMaxDelayMs: toNumber(process.env.DB_RETRY_MAX_DELAY_MS, 6000),
};
