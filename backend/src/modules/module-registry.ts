 
import type { FastifyPluginAsync } from "fastify";

export type ApiModule = {
  name: string;
  prefix: string;
  routes: FastifyPluginAsync;
};


const ensureUnique = (modules: ApiModule[], field: "name" | "prefix") => {
  const seen = new Set<string>();

  for (const moduleDefinition of modules) {
    const value = moduleDefinition[field];
    if (seen.has(value)) {
      throw new Error(`Duplicate api module ${field}: ${value}`);
    }
    seen.add(value);
  }
};

export const defineModules = (modules: ApiModule[]) => {
  ensureUnique(modules, "name");
  ensureUnique(modules, "prefix");
  return modules;
};
