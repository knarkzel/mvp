import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "$lib/db";
import * as schema from "$lib/schema";

// Create adapter for Lucia using tables defined with Drizzle
const adapter = new DrizzleSQLiteAdapter(db, schema.session, schema.user);
export const lucia = new Lucia(adapter);
