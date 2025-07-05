import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: "./src/drizzle/schema.ts",
  out: "./migrations", // use the existing migrations folder
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});