import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subscribers } from "@db/schema";

export const subscriberRouter = createRouter({
  subscribe: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already subscribed",
        });
      }

      await db.insert(subscribers).values({ email: input.email });
      return { success: true };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(subscribers).orderBy(subscribers.createdAt);
  }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(subscribers).where(eq(subscribers.id, input.id));
      return { success: true };
    }),
});
