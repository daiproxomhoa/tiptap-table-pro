import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Alias the package name to the LIVE source in ../src, so editing the library
// source hot-reloads here instantly — no build / pack / install step needed
// while debugging. styles.css is the prebuilt file (run `npm run build` in the
// library once, or `npm run build:css`).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^tiptap-ui-pro\/styles\.css$/, replacement: r("../dist/styles.css") },
      { find: /^tiptap-ui-pro\/core$/, replacement: r("../src/core/index.ts") },
      { find: /^tiptap-ui-pro$/, replacement: r("../src/index.ts") },
    ],
    dedupe: ["react", "react-dom", "@tiptap/core", "@tiptap/react", "@tiptap/pm"],
  },
});
