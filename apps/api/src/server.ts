import "dotenv/config";
import { buildApp } from "./app.js";
import { env } from "./config.env.js";

async function start() {
  const app = await buildApp();

  const shutdown = async (signal: string) => {
    try {
      app.log.info({ signal }, "Shutting down...");
      await app.close();
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, "Shutdown error");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  try {
    const address = await app.listen({ port: env.port, host: env.host });
    app.log.info({ address }, "🚀 Server listening");
  } catch (err) {
    app.log.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
