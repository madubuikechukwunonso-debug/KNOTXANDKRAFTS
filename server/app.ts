import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(
  "*",
  bodyLimit({
    maxSize: 50 * 1024 * 1024,
  }),
);

app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => {
  return c.json({ error: "Not Found" }, 404);
});

if (env.isProduction && !process.env.VERCEL) {
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const { serve } = await import("@hono/node-server");
  const port = Number(process.env.PORT || 3000);

  serve(
    {
      fetch: app.fetch,
      port,
    },
    () => {
      console.log(`Server running on http://localhost:${port}`);
    },
  );
}

export default app;
