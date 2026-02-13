import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

function listEntries(dir) {
  return readdirSync(dir, { withFileTypes: true }).map((entry) => ({
    name: entry.name,
    isDirectory: entry.isDirectory(),
    path: join(dir, entry.name),
  }));
}

function fail(errors) {
  if (errors.length === 0) return;
  console.error("\n❌ Structure validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const errors = [];

const backendSrc = "apps/backend/src";
const frontendSrc = "apps/frontend/src";

const backendAllowedDirs = new Set(["app", "core", "db", "modules"]);
const backendAllowedFiles = new Set(["server.ts"]);
const frontendAllowedDirs = new Set(["app", "features", "shared", "pages"]);
const frontendAllowedFiles = new Set(["App.tsx", "main.tsx", "index.css"]);
const frontendForbiddenLegacyDirs = ["core", "lib", "utils", "config"];

if (!existsSync(backendSrc) || !existsSync(frontendSrc)) {
  errors.push("Missing backend/frontend src folders required for validation.");
  fail(errors);
}

for (const entry of listEntries(backendSrc)) {
  if (entry.isDirectory && !backendAllowedDirs.has(entry.name)) {
    errors.push(`Unexpected backend top-level directory: ${entry.path}`);
  }
  if (!entry.isDirectory && !backendAllowedFiles.has(entry.name)) {
    errors.push(`Unexpected backend top-level file: ${entry.path}`);
  }
}

const modulesDir = join(backendSrc, "modules");
if (existsSync(modulesDir)) {
  for (const mod of listEntries(modulesDir)) {
    if (!mod.isDirectory) continue;
    const hasRoutesFile = listEntries(mod.path).some((entry) => !entry.isDirectory && entry.name.endsWith(".routes.ts"));
    if (!hasRoutesFile) {
      errors.push(`Backend module '${mod.name}' must include a *.routes.ts file.`);
    }
  }
}

for (const entry of listEntries(frontendSrc)) {
  if (entry.isDirectory && !frontendAllowedDirs.has(entry.name)) {
    errors.push(`Unexpected frontend top-level directory: ${entry.path}`);
  }
  if (!entry.isDirectory && !frontendAllowedFiles.has(entry.name)) {
    errors.push(`Unexpected frontend top-level file: ${entry.path}`);
  }
}

for (const legacyDir of frontendForbiddenLegacyDirs) {
  const fullPath = join(frontendSrc, legacyDir);
  if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
    errors.push(`Legacy frontend directory should not exist anymore: ${fullPath}`);
  }
}

fail(errors);

console.log("✅ Structure validation passed.");
