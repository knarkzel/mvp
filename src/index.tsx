import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { db } from "$lib/db";
import { auth } from "$lib/auth";
import { Page } from "$lib/template";
import * as schema from "$lib/schema";

const app = new Elysia()
  .use(auth)
  .use(html())
  .use(staticPlugin())
  .get("/", async ({ user, session }) => {
    const result = await db.select().from(schema.userTable);
    console.log(user, session);
    return (
      <Page title="Twitter">
        <p>Welcome to Twitter</p>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </Page>
    );
  })
  .listen(3000);

console.log(`🦊 Server is running at http://${app.server?.hostname}:${app.server?.port}`);
