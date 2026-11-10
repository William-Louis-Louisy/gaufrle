import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  preview: { port: 4173 },
  build: { outDir: "dist" },
  test: {
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
