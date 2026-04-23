// api/index.ts
import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel"; // Crucial import for Vercel
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/router";
import { createContext } from "../server/context";
import { bootstrapInitialAdmin } from "../server/admin-bootstrap";

await bootstrapInitialAdmin();

const app = new Hono();

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError({ error }) {
      console.error("tRPC error:", error); // Keep logging
    },
  });
});

// This 'handle' function is what Vercel will execute
export default handle(app);
