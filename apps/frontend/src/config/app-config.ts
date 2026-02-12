const DEFAULT_API_URL = "http://localhost:8080";
const DEFAULT_API_TIMEOUT_MS = 15000;

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const appConfig = {
  env: import.meta.env.VITE_APP_ENV || "uat",
  apiUrl: import.meta.env.VITE_API_URL || DEFAULT_API_URL,
  apiTimeoutMs: toNumber(import.meta.env.VITE_API_TIMEOUT_MS, DEFAULT_API_TIMEOUT_MS),
} as const;
