import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { adminQuery, createRouter, publicQuery } from "./middleware";
import { galleryItems } from "@db/schema";
import { getDb } from "./queries/connection";

export const adminGalleryRouter = createRouter({
  listPublic: publicQuery
    .input(
      z
        .object({
          featuredOnly: z.boolean().default(false),
          limit: z.number().int().positive().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();

      const rows = await db
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.isActive, 1))
        .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id));

      let filtered = rows;
      if (input?.featuredOnly) {
        filtered = filtered.filter((row) => Boolean(row.isFeatured));
      }

      if (input?.limit) {
        filtered = filtered.slice(0, input.limit);
      }

      return filtered;
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(galleryItems)
      .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id));
  }),

  create: adminQuery
    .input(
      z.object({
        type: z.enum(["image", "video"]),
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        title: z.string().optional(),
        caption: z.string().optional(),
        category: z.string().default("general"),
        isFeatured: z.boolean().default(false),
        isActive: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const result = await db.insert(galleryItems).values({
        type: input.type,
        url: input.url,
        thumbnailUrl: input.thumbnailUrl,
        title: input.title,
        caption: input.caption,
        category: input.category,
        isFeatured: input.isFeatured ? 1 : 0,
        isActive: input.isActive ? 1 : 0,
        sortOrder: input.sortOrder,
        createdById: ctx.unifiedUser!.id,
      });

      const id = Number(result[0].insertId);

      const created = await db
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.id, id))
        .limit(1);

      return created[0];
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number().int(),
        type: z.enum(["image", "video"]),
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        title: z.string().optional(),
        caption: z.string().optional(),
        category: z.string().default("general"),
        isFeatured: z.boolean().default(false),
        isActive: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(galleryItems)
        .set({
          type: input.type,
          url: input.url,
          thumbnailUrl: input.thumbnailUrl,
          title: input.title,
          caption: input.caption,
          category: input.category,
          isFeatured: input.isFeatured ? 1 : 0,
          isActive: input.isActive ? 1 : 0,
          sortOrder: input.sortOrder,
        })
        .where(eq(galleryItems.id, input.id));

      const updated = await db
        .select()
        .from(galleryItems)
        .where(eq(galleryItems.id, input.id))
        .limit(1);

      return updated[0];
    }),
});
