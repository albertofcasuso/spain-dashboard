import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@worker": path.resolve(__dirname, "worker"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "worker/**/*.test.ts"],
  },
});
