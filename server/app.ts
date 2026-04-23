import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

// Global body limit
app.use(
  "*",
  bodyLimit({
    maxSize: 50 * 1024 * 1024, // 50MB
  }),
);

/**
 * tRPC Handler with enhanced error logging
 */
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,

    // ==================== CRITICAL: ON ERROR LOGGING ====================
    onError({ error, type, path, input, ctx, req }) {
      const isInternalError = error.code === "INTERNAL_SERVER_ERROR";

      const logData = {
        timestamp: new Date().toISOString(),
        type,                    // query | mutation | subscription
        path,
        code: error.code,
        message: error.message,
        cause: error.cause ? String(error.cause) : undefined,
        userId: ctx?.unifiedUser?.id ?? null,
        userRole: ctx?.unifiedUser?.role ?? null,
        input: input ? JSON.stringify(input).slice(0, 300) : null, // prevent huge logs
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

// Catch-all for other /api routes
app.all("/api/*", (c) => {
  return c.json(
    { 
      error: "Not Found",
      message: "The requested API endpoint does not exist" 
    }, 
    404
  );
});

// Production server setup (only runs locally in production mode)
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
