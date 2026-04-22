import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { adminQuery, createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { services } from "@db/schema";
import { upsertStripeCatalogItem } from "./stripe-sync";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const adminServicesRouter = createRouter({
  listPublic: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(services)
      .where(eq(services.active, 1))
      .orderBy(asc(services.sortOrder), asc(services.id));
  }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(services).orderBy(asc(services.sortOrder), asc(services.id));
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        price: z.number().int().nonnegative(),
        priceCurrency: z.string().default("cad"),
        durationMinutes: z.number().int().positive(),
        image: z.string().url().optional(),
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
          type: "service",
          slug,
        },
      });

      const result = await db.insert(services).values({
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        priceCurrency: input.priceCurrency,
        durationMinutes: input.durationMinutes,
        image: input.image,
        featured: input.featured ? 1 : 0,
        active: input.active ? 1 : 0,
        sortOrder: input.sortOrder,
        stripeProductId: stripeIds.stripeProductId,
        stripePriceId: stripeIds.stripePriceId,
      });

      const id = Number(result[0].insertId);

      const created = await db
        .select()
        .from(services)
        .where(eq(services.id, id))
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
        durationMinutes: z.number().int().positive(),
        image: z.string().url().optional(),
        featured: z.boolean().default(false),
        active: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(services)
        .where(eq(services.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new Error("Service not found");
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
          type: "service",
          slug,
        },
      });

      await db
        .update(services)
        .set({
          name: input.name,
          slug,
          description: input.description,
          price: input.price,
          priceCurrency: input.priceCurrency,
          durationMinutes: input.durationMinutes,
          image: input.image,
          featured: input.featured ? 1 : 0,
          active: input.active ? 1 : 0,
          sortOrder: input.sortOrder,
          stripeProductId: stripeIds.stripeProductId,
          stripePriceId: stripeIds.stripePriceId,
        })
        .where(eq(services.id, input.id));

      const updated = await db
        .select()
        .from(services)
        .where(eq(services.id, input.id))
        .limit(1);

      return updated[0];
    }),
});
