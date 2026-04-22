import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { products } from "@db/schema";
import { adminQuery, createRouter, publicQuery } from "../../middleware";
import { getDb } from "../../queries/connection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

      const allProducts = await db
        .select()
        .from(products)
        .orderBy(asc(products.sortOrder), asc(products.id));

      let filtered = allProducts.filter((product) => Boolean(product.active));

      if (input?.category) {
        filtered = filtered.filter(
          (product) => product.category === input.category,
        );
      }

      if (input?.featured) {
        filtered = filtered.filter((product) => product.featured === 1);
      }

      return filtered;
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

      return result[0] ?? null;
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        price: z.number().int().nonnegative(),
        image: z.string().url().optional(),
        category: z.string().default("general"),
        inventory: z.number().int().nonnegative().default(0),
        featured: z.boolean().default(false),
        active: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
        priceCurrency: z.string().default("cad"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const result = await db.insert(products).values({
        name: input.name,
        slug: slugify(input.name),
        description: input.description,
        price: input.price,
        priceCurrency: input.priceCurrency,
        image: input.image,
        category: input.category,
        inventory: input.inventory,
        featured: input.featured ? 1 : 0,
        active: input.active ? 1 : 0,
        sortOrder: input.sortOrder,
      });

      const id = Number(result[0].insertId);

      const created = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      return created[0];
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2),
        description: z.string().optional(),
        price: z.number().int().nonnegative(),
        image: z.string().url().optional(),
        category: z.string().default("general"),
        inventory: z.number().int().nonnegative().default(0),
        featured: z.boolean().default(false),
        active: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
        priceCurrency: z.string().default("cad"),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(products)
        .set({
          name: input.name,
          slug: slugify(input.name),
          description: input.description,
          price: input.price,
          priceCurrency: input.priceCurrency,
          image: input.image,
          category: input.category,
          inventory: input.inventory,
          featured: input.featured ? 1 : 0,
          active: input.active ? 1 : 0,
          sortOrder: input.sortOrder,
        })
        .where(eq(products.id, input.id));

      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      return result[0];
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(products)
        .set({
          active: 0,
        })
        .where(eq(products.id, input.id));

      return { success: true };
    }),
});
