// src/config.ts
export const config = {
  env: import.meta.env.VITE_APP_ENV || "uat",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8080",
  logLevel: (import.meta.env.VITE_LOG_LEVEL || "debug") as
    | "debug"
    | "info"
    | "warn"
    | "error",
};
