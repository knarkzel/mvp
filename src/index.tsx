import { z } from "zod";
import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { generateId } from "lucia";
import { db } from "$lib/db";
import { auth } from "$lib/auth";
import { Page } from "$lib/template";
import * as schema from "$lib/schema";
import { and, eq } from "drizzle-orm";
import { lucia } from "$lib/lucia";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const app = new Elysia()
  .use(auth)
  .use(html())
  .use(staticPlugin())
  .get("/", ({ user }) => {
    return (
      <Page title="Twitter">
        <p>Welcome to Twitter! Here's your user:</p>
        {user && <p>Logged in as {user.id}</p>}
        <ul>
          <li><a href="/register">Register</a></li>
          <li><a href="/login">Login</a></li>
          {user && <li><a href="/logout">Logout</a></li>}
        </ul>
      </Page>
    );
  })
  .get("/logout", async ({ user, cookie: { auth_session }, redirect }) => {
    if (user) {
      await lucia.invalidateSession(user.id);
      auth_session.remove();
    }
    return redirect("/", 302);
  })
  .get("/register", async () => {
    return (
      <Page title="Register">
        <form method="POST" action="/register">
          <label for="email">
            Email:
            <input name="email" type="email" required />
          </label>

          <label for="password">
            Password:
            <input name="password" type="password" min="8" required />
          </label>

          <button type="submit">Register</button>
        </form>
      </Page>
    );
  })
  .post("/register", async ({ body: { email, password }, cookie: { auth_session }, redirect }) => {
    // Validate username and password meets criteria
    const validation = userSchema.safeParse({ email, password });
    if (!validation.success) {
      throw new Error("E-mail or password is invalid");
    }

    // If email exists, return error
    const exists = await db.select().from(schema.user).where(eq(schema.user.email, email));
    if (exists.length > 0) {
      throw new Error("User with e-mail already exists");
    }

    // Create user in database
    const id = generateId(16);
    const passwordHash = await Bun.password.hash(password);
    await db.insert(schema.user).values({
      id,
      email,
      passwordHash,
    });

    // Set session
    const session = await lucia.createSession(id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
    auth_session.set(sessionCookie);
    return redirect("/", 302);
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  })
  .get("/login", async () => {
    return (
      <Page title="Login">
        <form method="POST" action="/login">
          <label for="email">
            Email:
            <input name="email" type="email" required />
          </label>

          <label for="password">
            Password:
            <input name="password" type="password" min="8" required />
          </label>

          <button type="submit">Login</button>
        </form>
      </Page>
    );
  })
  .post("/login", async ({ body: { email, password }, cookie: { auth_session }, redirect }) => {
    // Get user from database
    const validation = userSchema.safeParse({ email, password });
    const users = await db.select().from(schema.user).where(
      eq(schema.user.email, email),
    );
    if (!validation.success || users.length == 0) {
      throw new Error("E-mail or password is invalid");
    }

    // Verify password
    const correctPassword = await Bun.password.verify(password, users[0].passwordHash);
    if (!correctPassword) {
      throw new Error("Password is invalid");
    }
    
    // Set session
    const session = await lucia.createSession(users[0].id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
    auth_session.set(sessionCookie);
    return redirect("/", 302);
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  })
  .listen(3000);

console.log(`🦊 Server is running at http://${app.server?.hostname}:${app.server?.port}`);
