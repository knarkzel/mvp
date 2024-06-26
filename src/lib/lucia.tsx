import { db } from "$lib/db";
import { userTable, sessionTable } from "$lib/schema" 
import { Lucia } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

// Create adapter for Lucia using tables defined with Drizzle
const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);
export const lucia = new Lucia(adapter);
