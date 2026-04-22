import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const staticRoot = path.resolve(import.meta.dirname, "public");

  app.use(
    "/assets/*",
    serveStatic({
      root: staticRoot,
    }),
  );

  app.use(
    "/*",
    serveStatic({
      root: staticRoot,
    }),
  );

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";

    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }

    const indexPath = path.resolve(staticRoot, "index.html");
    const html = fs.readFileSync(indexPath, "utf-8");
    return c.html(html);
  });
}
