import "dotenv/config";
import { buildApp } from "./app/bootstrap/build-app.js";
import { env } from "@/core/config/env";

async function start() {
  const app = await buildApp(); // ✅ build once

  const shutdown = async (signal: string) => {
    try {
      app.log.info({ signal }, "Shutting down...");
      await app.close(); // triggers onClose hooks (pg pools + knex.destroy)
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, "Shutdown error");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  try {
    const address = await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info({ address }, "🚀 Server listening");
  } catch (err: any) {
    // If DB plugin throws during startup, it lands here and process exits.
    app.log.error(
      {
        err,
        code: err?.code,
        causes: Array.isArray(err?.errors) ? err.errors : undefined,
      },
      "Failed to start server"
    );
    process.exit(1);
  }
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
