import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "../../middleware";
import { getDb } from "../../queries/connection";
import { products } from "@db/schema";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          category: z.string().optional(),
          featured: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();
      let query = db.select().from(products);

      if (input?.category) {
        query = query.where(eq(products.category, input.category)) as typeof query;
      }

      const allProducts = await query;

      if (input?.featured) {
        return allProducts.filter((p) => p.featured === 1);
      }

      return allProducts;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      return result[0] || null;
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().positive(),
        image: z.string().optional(),
        category: z.string().default("general"),
        inventory: z.number().default(0),
        featured: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values({
        ...input,
        featured: input.featured ? 1 : 0,
      });
      const id = Number(result[0].insertId);
      return { id, ...input, featured: input.featured ? 1 : 0 };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().positive().optional(),
        image: z.string().optional(),
        category: z.string().optional(),
        inventory: z.number().optional(),
        featured: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (data.featured !== undefined) {
        updateData.featured = data.featured ? 1 : 0;
      }
      await db.update(products).set(updateData).where(eq(products.id, id));
      const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
      return result[0];
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),
});
