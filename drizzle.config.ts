import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/schema.tsx",
  out: "./drizzle",
  dbCredentials: {
    url: "./database.db",
  },
});
