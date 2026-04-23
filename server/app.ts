import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { bootstrapInitialAdmin } from "./admin-bootstrap";

await bootstrapInitialAdmin();

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(
  "*",
  bodyLimit({
    maxSize: 50 * 1024 * 1024,
  }),
);

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError({ error, type, path, input, ctx, req }) {
      const isInternalError = error.code === "INTERNAL_SERVER_ERROR";

      const logData = {
        timestamp: new Date().toISOString(),
        type,
        path,
        code: error.code,
        message: error.message,
        cause: error.cause ? String(error.cause) : undefined,
        userId: ctx?.unifiedUser?.id ?? null,
        userRole: ctx?.unifiedUser?.role ?? null,
        input: input ? JSON.stringify(input).slice(0, 300) : null,
        url: req.url,
      };

      if (isInternalError) {
        console.error("🚨 tRPC INTERNAL SERVER ERROR:", logData);
        console.error("Full Error:", {
          name: error.name,
          stack: error.stack,
          cause: error.cause,
        });
      } else {
        console.warn("⚠️ tRPC Error:", logData);
      }
    },
  });
});

app.all("/api/*", (c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested API endpoint does not exist",
    },
    404,
  );
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
      console.log(`🚀 Server running on http://localhost:${port}`);
    },
  );
}

export default app;
