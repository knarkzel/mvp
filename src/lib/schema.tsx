import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
	.notNull()
	.references(() => user.id),
  expiresAt: integer("expires_at").notNull(),
});
