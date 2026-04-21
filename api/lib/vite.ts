import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  // boot.js lives in dist/ → this points to the exact folder where vite build put index.html + assets
  const staticRoot = import.meta.dirname;

  // Serve all static files (JS, CSS, images, etc.)
  app.use("*", serveStatic({ root: staticRoot }));

  // SPA fallback – any unmatched route that wants HTML gets index.html
  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(staticRoot, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
