import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],     // <-- change if your entry file name differs
  format: ["esm"],
  target: "node20",
  sourcemap: true,
  clean: true,
  outDir: "dist",
  // splitting: false is usually best for a backend (single output file)
  splitting: false,
});
