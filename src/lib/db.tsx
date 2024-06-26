import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

// Create database and run migrations
const sqlite = new Database("database.db");
export const db = drizzle(sqlite);
migrate(db, { migrationsFolder: "./drizzle" });
