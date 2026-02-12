import { z } from "zod";

const EnvSchema = z.object({
  VITE_APP_ENV: z.enum(["uat", "production"]).optional().default("uat"),
  VITE_API_URL: z.string().url(),
  VITE_API_TIMEOUT_MS: z.coerce.number().default(15000),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error("❌ Invalid env:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
