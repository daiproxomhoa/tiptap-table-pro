import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "core/index": "src/core/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // react / react-dom / @tiptap/* are peers; radix/lucide/etc are runtime deps.
  // tsup externalizes everything in dependencies + peerDependencies by default,
  // so the bundle stays thin and consumers dedupe a single copy of each lib.
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
