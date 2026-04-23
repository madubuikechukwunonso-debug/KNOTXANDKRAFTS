import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { createRouter, adminQuery } from "../../middleware";
import { getDb } from "../../queries/connection";
import { users, localUsers } from "@db/schema";

export const userRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();

    const oauthUsers = await db.select().from(users);
    const local = await db.select().from(localUsers);

    const unified = [
      ...oauthUsers.map((u) => ({
        id: u.id,
        name: u.name || "User",
        email: u.email,
        role: u.role,
        userType: "oauth" as const,
        createdAt: u.createdAt,
        avatar: u.avatar,
      })),
      ...local.map((u) => ({
        id: u.id,
        name: u.displayName || u.username,
        email: u.email,
        role: u.role,
        userType: "local" as const,
        createdAt: u.createdAt,
        avatar: null,
      })),
    ];

    return unified.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }),

  updateRole: adminQuery
    .input(
      z.object({
        id: z.number(),
        userType: z.enum(["oauth", "local"]),
        role: z.enum(["user", "worker", "admin", "super_admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      if (input.userType === "oauth") {
        await db
          .update(users)
          .set({ role: input.role })
          .where(eq(users.id, input.id));
      } else {
        await db
          .update(localUsers)
          .set({ role: input.role })
          .where(eq(localUsers.id, input.id));
      }

      return { success: true };
    }),

  delete: adminQuery
    .input(
      z.object({
        id: z.number(),
        userType: z.enum(["oauth", "local"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      if (input.userType === "oauth") {
        await db.delete(users).where(eq(users.id, input.id));
      } else {
        await db.delete(localUsers).where(eq(localUsers.id, input.id));
      }

      return { success: true };
    }),
});
