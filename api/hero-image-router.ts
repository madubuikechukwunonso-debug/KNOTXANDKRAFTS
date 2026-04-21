import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { heroImages } from "@db/schema";

export const heroImageRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(heroImages)
      .where(eq(heroImages.active, 1))
      .orderBy(asc(heroImages.sortOrder));
  }),

  listAll: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(heroImages).orderBy(asc(heroImages.sortOrder));
  }),

  create: adminQuery
    .input(
      z.object({
        url: z.string().min(1),
        alt: z.string().optional(),
        sortOrder: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(heroImages).values({
        url: input.url,
        alt: input.alt,
        sortOrder: input.sortOrder,
        active: 1,
      });
      const id = Number(result[0].insertId);
      return { id, ...input, active: 1 };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        url: z.string().optional(),
        alt: z.string().optional(),
        sortOrder: z.number().optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (data.active !== undefined) {
        updateData.active = data.active ? 1 : 0;
      }
      await db.update(heroImages).set(updateData).where(eq(heroImages.id, id));
      const result = await db
        .select()
        .from(heroImages)
        .where(eq(heroImages.id, id))
        .limit(1);
      return result[0];
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(heroImages).where(eq(heroImages.id, input.id));
      return { success: true };
    }),
});
