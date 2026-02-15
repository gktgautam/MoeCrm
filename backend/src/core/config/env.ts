import "dotenv/config";
import { z } from "zod";

const EnvSchema = z
  .object({
    NODE_ENV: z.string().default("development"),

    // Derived values
    ISPROD: z.boolean().default(false), // <-- calculated later

    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().default(8080),

    COOKIE_SECRET: z.string(),
    JWT_SECRET: z.string(),

    CRM_DB_URL: z.string(),
    ENGAGE_DB_URL: z.string(),

    PG_POOL_MAX: z.coerce.number().default(5),
    PG_CONN_TIMEOUT_MS: z.coerce.number().default(5000),
    PG_IDLE_TIMEOUT_MS: z.coerce.number().default(30000),

    DB_RETRY_ENABLED: z
      .string()
      .optional()
      .transform((v) => v?.toLowerCase() === "true")
      .default(false),

    DB_RETRY_ATTEMPTS: z.coerce.number().default(10),
    DB_RETRY_DELAY_MS: z.coerce.number().default(800),
    DB_RETRY_MAX_DELAY_MS: z.coerce.number().default(6000),
  })
  .passthrough();

const parsed = EnvSchema.parse(process.env);

// Set ISPROD dynamically based on NODE_ENV
parsed.ISPROD = parsed.NODE_ENV === "production";

export const env = parsed;
