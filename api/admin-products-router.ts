import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { adminQuery, createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products } from "@db/schema";
import { upsertStripeCatalogItem } from "./stripe-sync";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const adminProductsRouter = createRouter({
  listPublic: publicQuery.query(async () => {
    const db = getDb();

    return db
      .select()
      .from(products)
      .where(eq(products.active, 1))
      .orderBy(asc(products.sortOrder), asc(products.id));
  }),

  list: adminQuery.query(async () => {
    const db = getDb();

    return db.select().from(products).orderBy(asc(products.sortOrder), asc(products.id));
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        price: z.number().int().nonnegative(),
        priceCurrency: z.string().default("cad"),
        image: z.string().url().optional(),
        category: z.string().default("general"),
        inventory: z.number().int().nonnegative().default(0),
        featured: z.boolean().default(false),
        active: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const slug = slugify(input.name);

      const stripeIds = await upsertStripeCatalogItem({
        name: input.name,
        description: input.description,
        image: input.image,
        amount: input.price,
        currency: input.priceCurrency,
        metadata: {
          type: "product",
          slug,
        },
      });

      const result = await db.insert(products).values({
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        priceCurrency: input.priceCurrency,
        image: input.image,
        category: input.category,
        inventory: input.inventory,
        featured: input.featured ? 1 : 0,
        active: input.active ? 1 : 0,
        sortOrder: input.sortOrder,
        stripeProductId: stripeIds.stripeProductId,
        stripePriceId: stripeIds.stripePriceId,
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
        id: z.number().int(),
        name: z.string().min(2),
        description: z.string().optional(),
        price: z.number().int().nonnegative(),
        priceCurrency: z.string().default("cad"),
        image: z.string().url().optional(),
        category: z.string().default("general"),
        inventory: z.number().int().nonnegative().default(0),
        featured: z.boolean().default(false),
        active: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new Error("Product not found");
      }

      const slug = slugify(input.name);

      const stripeIds = await upsertStripeCatalogItem({
        existingStripeProductId: existing[0].stripeProductId,
        existingStripePriceId: existing[0].stripePriceId,
        name: input.name,
        description: input.description,
        image: input.image,
        amount: input.price,
        currency: input.priceCurrency,
        metadata: {
          type: "product",
          slug,
        },
      });

      await db
        .update(products)
        .set({
          name: input.name,
          slug,
          description: input.description,
          price: input.price,
          priceCurrency: input.priceCurrency,
          image: input.image,
          category: input.category,
          inventory: input.inventory,
          featured: input.featured ? 1 : 0,
          active: input.active ? 1 : 0,
          sortOrder: input.sortOrder,
          stripeProductId: stripeIds.stripeProductId,
          stripePriceId: stripeIds.stripePriceId,
        })
        .where(eq(products.id, input.id));

      const updated = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      return updated[0];
    }),

  updateInventory: adminQuery
    .input(
      z.object({
        id: z.number().int(),
        inventory: z.number().int().nonnegative(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(products)
        .set({
          inventory: input.inventory,
        })
        .where(eq(products.id, input.id));

      const updated = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);

      return updated[0];
    }),
});
