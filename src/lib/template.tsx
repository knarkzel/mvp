import { type PropsWithChildren } from "@kitajs/html";

export function Page(props: PropsWithChildren<{ title: string }>) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <link rel="stylesheet" href="/public/pico.css" />
        <title safe>{props.title}</title>
      </head>
      <body>
        <main class="container">{props.children}</main>
        <script src="/public/htmx.js"></script>
      </body>
    </html>
  );
}
