import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    // component tests render whole pages in jsdom; under a busy machine 5 s is too tight
    testTimeout: 15_000,
    // unit tests check the real admin lock; the open demo mode is covered by e2e
    env: { VITE_OPEN_ADMIN: "false" },
    globals: true,
    // the app loads the mock adapter lazily (src/api/client.ts); preloading it here keeps the first
    // request of each test file as fast as before, so findBy* timeouts are not eaten by the import
    setupFiles: ["./src/test/setup.ts", "./src/api/mock/adapter.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});
