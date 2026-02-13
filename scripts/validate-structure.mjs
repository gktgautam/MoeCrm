import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const checks = [];

const fail = (message) => checks.push({ ok: false, message });
const pass = (message) => checks.push({ ok: true, message });

const structureConfig = JSON.parse(
  await readFile(path.join(repoRoot, "scripts/structure.config.json"), "utf8")
);

const walkFiles = async (startDir, matcher) => {
  const out = [];
  const queue = [path.join(repoRoot, startDir)];

  while (queue.length) {
    const current = queue.pop();
    const entries = await readdir(current);

    for (const entry of entries) {
      if (entry === "node_modules" || entry === ".git") continue;

      const full = path.join(current, entry);
      const rel = path.relative(repoRoot, full);
      const info = await stat(full);
      if (info.isDirectory()) {
        queue.push(full);
      } else if (!matcher || matcher(rel)) {
        out.push(rel);
      }
    }
  }

  return out;
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

const expectTopLevelContract = async () => {
  const entries = await readdir(repoRoot);
  const allowed = new Set(structureConfig.allowedTopLevel);
  const ignored = new Set([".git", "node_modules", ".DS_Store"]);

  for (const entry of entries) {
    if (ignored.has(entry)) continue;
    if (!allowed.has(entry)) {
      fail(`top-level entry is not in structure contract: ${entry}`);
    }
  }
};

const isPathInside = (child, parent) => child === parent || child.startsWith(`${parent}/`);

const expectLabelContract = async () => {
  const labels = structureConfig.labels;
  const allLabelPaths = Object.entries(labels).flatMap(([label, paths]) =>
    paths.map((entry) => ({ label, path: entry }))
  );

  for (const { label, path: labelPath } of allLabelPaths) {
    const absolute = path.join(repoRoot, labelPath);
    try {
      await stat(absolute);
    } catch {
      fail(`label ${label} references missing path: ${labelPath}`);
    }
  }

  for (let i = 0; i < allLabelPaths.length; i += 1) {
    for (let j = i + 1; j < allLabelPaths.length; j += 1) {
      const a = allLabelPaths[i];
      const b = allLabelPaths[j];
      if (a.label === b.label) continue;

      if (isPathInside(a.path, b.path) || isPathInside(b.path, a.path)) {
        fail(
          `label scope overlap detected between ${a.label}:${a.path} and ${b.label}:${b.path}`
        );
      }
    }
  }
};

const expectFrontendFeatureContracts = async () => {
  const featuresDir = path.join(repoRoot, "apps/frontend/src/features");
  const features = await readdir(featuresDir);

  for (const feature of features) {
    const featurePath = path.join(featuresDir, feature);
    if (!(await stat(featurePath)).isDirectory()) continue;

    const entries = await readdir(featurePath);
    if (!entries.includes("index.ts")) {
      fail(`feature ${feature} must expose a public API file index.ts`);
    }

    if (feature !== "auth" && !entries.includes(`${feature}.routes.tsx`)) {
      fail(`feature ${feature} must define ${feature}.routes.tsx`);
    }
  }
};

const expectBackendModuleContracts = async () => {
  const modulesDir = path.join(repoRoot, "apps/backend/src/modules");
  const moduleEntries = await readdir(modulesDir);

  for (const moduleName of moduleEntries) {
    const modulePath = path.join(modulesDir, moduleName);
    if (!(await stat(modulePath)).isDirectory()) continue;

    const entries = await readdir(modulePath);
    if (!entries.includes("index.ts")) {
      fail(`backend module ${moduleName} must expose a public API file index.ts`);
    }

    const hasRoutes = entries.some((entry) => entry.endsWith(".routes.ts"));
    if (!hasRoutes) {
      fail(`backend module ${moduleName} should define at least one *.routes.ts file`);
    }
  }
};

const parseImportTargets = (source) => {
  const targets = [];
  const regex = /from\s+["']([^"']+)["']/g;
  let m;
  while ((m = regex.exec(source)) !== null) {
    targets.push(m[1]);
  }
  return targets;
};

const enforceFrontendImportBoundaries = async () => {
  const files = await walkFiles("apps/frontend/src", (rel) => rel.endsWith(".ts") || rel.endsWith(".tsx"));

  for (const rel of files) {
    const source = await readFile(path.join(repoRoot, rel), "utf8");
    const imports = parseImportTargets(source);

    const owner = rel.includes("apps/frontend/src/features/")
      ? rel.split("apps/frontend/src/features/")[1].split("/")[0]
      : null;

    for (const target of imports) {
      const match = target.match(/^@\/features\/([^/]+)\/(.+)$/);
      if (!match) continue;

      const [, targetFeature] = match;
      const importingInsideSameFeature = owner !== null && owner === targetFeature;
      const importingFeatureRoot = rel === `apps/frontend/src/features/${targetFeature}/index.ts`;

      if (!importingInsideSameFeature && !importingFeatureRoot) {
        fail(`${rel} must import feature ${targetFeature} via @/features/${targetFeature} (public API), not deep path ${target}`);
      }
    }
  }
};

const enforceBackendImportBoundaries = async () => {
  const files = await walkFiles("apps/backend/src", (rel) => rel.endsWith(".ts"));

  for (const rel of files) {
    const source = await readFile(path.join(repoRoot, rel), "utf8");
    const imports = parseImportTargets(source);

    const owner = rel.includes("apps/backend/src/modules/")
      ? rel.split("apps/backend/src/modules/")[1].split("/")[0]
      : null;

    for (const target of imports) {
      const match = target.match(/^@\/modules\/([^/]+)\/(.+)$/);
      if (!match) continue;
      const [, targetModule] = match;

      const importingInsideSameModule = owner !== null && owner === targetModule;
      const importingModuleRoot = rel === `apps/backend/src/modules/${targetModule}/index.ts`;

      if (!importingInsideSameModule && !importingModuleRoot) {
        fail(`${rel} must import module ${targetModule} via @/modules/${targetModule} (public API), not deep path ${target}`);
      }
    }
  }
};

await expectTopLevelContract();
await expectLabelContract();
await expectDirectoriesOnly("apps/frontend/src/features");
await expectDirectoriesOnly("apps/backend/src/modules", [
  "api-v1.registry.ts",
  "module-contract.ts",
  "module-registry.ts",
  "public.registry.ts",
]);
await expectFrontendFeatureContracts();
await expectBackendModuleContracts();
await enforceFrontendImportBoundaries();
await enforceBackendImportBoundaries();

if (checks.every((check) => check.ok)) {
  pass("structure checks passed");
}

for (const check of checks) {
  const label = check.ok ? "✓" : "✗";
  console.log(`${label} ${check.message}`);
}

if (checks.some((check) => !check.ok)) process.exit(1);
