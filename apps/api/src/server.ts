// src/server.ts
import "dotenv/config";
import { buildApp } from "./app.js";

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? "0.0.0.0";

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
    const address = await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 Server listening at ${address}`);
  } catch (err) {
    app.log.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
