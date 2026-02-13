import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();

const checks = [];

const fail = (message) => {
  checks.push({ ok: false, message });
};

const pass = (message) => {
  checks.push({ ok: true, message });
};

const expectDirectoriesOnly = async (relativeDir, allowedFiles = []) => {
  const absoluteDir = path.join(repoRoot, relativeDir);
  const entries = await readdir(absoluteDir);

  for (const entry of entries) {
    const entryPath = path.join(absoluteDir, entry);
    const isDirectory = (await stat(entryPath)).isDirectory();
    if (!isDirectory && !allowedFiles.includes(entry)) {
      fail(`${relativeDir} should not contain loose file: ${entry}`);
    }
  }
};

const expectFeatureRouteFiles = async () => {
  const featuresDir = path.join(repoRoot, "apps/frontend/src/features");
  const entries = await readdir(featuresDir);

  for (const feature of entries) {
    const featurePath = path.join(featuresDir, feature);
    if (!(await stat(featurePath)).isDirectory()) continue;

    const featureEntries = await readdir(featurePath);
    const routeFile = `${feature}.routes.tsx`;

    if (!featureEntries.includes("pages") && !featureEntries.includes(routeFile)) {
      fail(`feature ${feature} should contain pages/ or ${routeFile}`);
    }
  }
};

const expectBackendModuleRouteFiles = async () => {
  const modulesDir = path.join(repoRoot, "apps/backend/src/modules");
  const entries = await readdir(modulesDir);

  for (const moduleName of entries) {
    const modulePath = path.join(modulesDir, moduleName);
    if (!(await stat(modulePath)).isDirectory()) continue;

    const moduleEntries = await readdir(modulePath);
    const hasRoutes = moduleEntries.some((entry) => entry.endsWith(".routes.ts"));

    if (!hasRoutes) {
      fail(`backend module ${moduleName} should define at least one *.routes.ts file`);
    }
  }
};

await expectDirectoriesOnly("apps/frontend/src/features");
await expectDirectoriesOnly("apps/backend/src/modules", [
  "api-v1.registry.ts",
  "module-contract.ts",
  "module-registry.ts",
  "public.registry.ts",
]);
await expectFeatureRouteFiles();
await expectBackendModuleRouteFiles();

if (checks.every((check) => check.ok)) {
  pass("structure checks passed");
}

for (const check of checks) {
  const label = check.ok ? "✓" : "✗";
  console.log(`${label} ${check.message}`);
}

if (checks.some((check) => !check.ok)) {
  process.exit(1);
}
