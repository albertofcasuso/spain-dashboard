import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./worker/modules/indicators/infrastructure/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
});
