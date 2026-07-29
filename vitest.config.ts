import { defineConfig } from "vitest/config";

// Tests run against the TypeScript source in src/ (not the built dist). The
// core extensions instantiate a real TipTap editor, which needs a DOM, so the
// environment is jsdom — same test stack (vitest) used by exam-bank-web.
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.ts"],
  },
});
