import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { adminQuery, createRouter, superAdminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";

export const adminUsersRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(localUsers).orderBy(desc(localUsers.lastSignInAt));
  }),

  block: adminQuery
    .input(
      z.object({
        id: z.number().int(),
        blockedReason: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(localUsers)
        .set({
          isBlocked: 1,
          blockedAt: new Date(),
          blockedReason: input.blockedReason,
        })
        .where(eq(localUsers.id, input.id));

      const updated = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, input.id))
        .limit(1);

      return updated[0];
    }),

  unblock: adminQuery
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = getDb();

      await db
        .update(localUsers)
        .set({
          isBlocked: 0,
          blockedAt: null,
          blockedReason: null,
        })
        .where(eq(localUsers.id, input.id));

      const updated = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, input.id))
        .limit(1);

      return updated[0];
    }),

  createStaffUser: superAdminQuery
    .input(
      z.object({
        username: z.string().min(3),
        email: z.string().email(),
        displayName: z.string().min(1),
        password: z.string().min(6),
        role: z.enum(["worker", "admin", "super_admin"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const passwordHash = await bcrypt.hash(input.password, 10);

      const result = await db.insert(localUsers).values({
        username: input.username,
        email: input.email,
        displayName: input.displayName,
        passwordHash,
        role: input.role,
        isActive: 1,
        isBlocked: 0,
        invitedById: ctx.unifiedUser!.id,
      });

      const id = Number(result[0].insertId);

      const created = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, id))
        .limit(1);

      return created[0];
    }),
});
