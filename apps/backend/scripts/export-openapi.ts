import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

// Adjust import if your buildApp path is different
import { buildApp } from "../src/bootstrap/app.js";

async function main() {
  const app = await buildApp();

  await app.ready();

  // @fastify/swagger adds this method
  const spec = app.swagger();

  const outPath = path.resolve(process.cwd(), "openapi.json");
  await fs.writeFile(outPath, JSON.stringify(spec, null, 2), "utf8");

  await app.close();
  console.log("✅ OpenAPI exported to:", outPath);
}

main().catch((err) => {
  console.error("❌ Failed to export OpenAPI:", err);
  process.exit(1);
});
