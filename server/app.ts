// server/app.ts
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { bootstrapInitialAdmin } from "./admin-bootstrap.js";

// Bootstrap admin on cold start (safe in Vercel)
try {
  await bootstrapInitialAdmin();
  console.log("✅ Initial admin bootstrap completed");
} catch (error) {
  console.error("❌ bootstrapInitialAdmin failed:", error);
}

const app = new Hono<{ Bindings: HttpBindings }>();

// Global body limit (protects against large uploads)
app.use(
  "*",
  bodyLimit({
    maxSize: 50 * 1024 * 1024, // 50MB
  }),
);

// tRPC handler (this is the only real API route)
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError({ error, type, path, input, ctx, req }) {
      console.error("tRPC error:", {
        timestamp: new Date().toISOString(),
        type,
        path,
        code: error.code,
        message: error.message,
        cause: error.cause ? String(error.cause) : undefined,
        userId: ctx?.unifiedUser?.id ?? null,
        userRole: ctx?.unifiedUser?.role ?? null,
        input: input ? JSON.stringify(input).slice(0, 500) : null,
        url: req?.url,
        stack: error.stack,
      });
    },
  });
});

// Health check (useful for Vercel debugging)
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.isProduction ? "production" : "development",
  });
});

// Catch-all for any other /api/* routes (prevents 404 confusion)
app.all("/api/*", (c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested API endpoint does not exist. Use /api/trpc/* for tRPC calls.",
    },
    404,
  );
});

// In production (Vercel) we only export the app — no local server needed
export default app;
