import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { adminQuery, createRouter } from "./middleware";
import { getDb } from "./queries/connection";
import {
  localUsers,
  serviceStaffAssignments,
  staffProfiles,
  staffTimeOff,
  staffWorkingHours,
} from "@db/schema";

export const adminStaffRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();

    const users = await db.select().from(localUsers);
    const profiles = await db.select().from(staffProfiles);
    const hours = await db.select().from(staffWorkingHours);

    return users
      .filter((user) => ["worker", "admin", "super_admin"].includes(user.role))
      .map((user) => ({
        ...user,
        profile: profiles.find((profile) => profile.userId === user.id) || null,
        hours: hours.filter((hour) => hour.staffUserId === user.id),
      }));
  }),

  upsertProfile: adminQuery
    .input(
      z.object({
        userId: z.number().int(),
        displayName: z.string().min(1),
        bio: z.string().optional(),
        bookingEnabled: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(staffProfiles)
        .where(eq(staffProfiles.userId, input.userId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(staffProfiles)
          .set({
            displayName: input.displayName,
            bio: input.bio,
            bookingEnabled: input.bookingEnabled ? 1 : 0,
          })
          .where(eq(staffProfiles.userId, input.userId));
      } else {
        await db.insert(staffProfiles).values({
          userId: input.userId,
          displayName: input.displayName,
          bio: input.bio,
          bookingEnabled: input.bookingEnabled ? 1 : 0,
        });
      }

      const updated = await db
        .select()
        .from(staffProfiles)
        .where(eq(staffProfiles.userId, input.userId))
        .limit(1);

      return updated[0];
    }),

  setWorkingHour: adminQuery
    .input(
      z.object({
        staffUserId: z.number().int(),
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        isWorking: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(staffWorkingHours)
        .where(
          and(
            eq(staffWorkingHours.staffUserId, input.staffUserId),
            eq(staffWorkingHours.dayOfWeek, input.dayOfWeek),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(staffWorkingHours)
          .set({
            startTime: input.startTime,
            endTime: input.endTime,
            isWorking: input.isWorking ? 1 : 0,
          })
          .where(eq(staffWorkingHours.id, existing[0].id));
      } else {
        await db.insert(staffWorkingHours).values({
          staffUserId: input.staffUserId,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
          isWorking: input.isWorking ? 1 : 0,
        });
      }

      return { success: true };
    }),

  addTimeOff: adminQuery
    .input(
      z.object({
        staffUserId: z.number().int(),
        startAt: z.string(),
        endAt: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const result = await db.insert(staffTimeOff).values({
        staffUserId: input.staffUserId,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        reason: input.reason,
      });

      return { id: Number(result[0].insertId) };
    }),

  assignService: adminQuery
    .input(
      z.object({
        serviceId: z.number().int(),
        staffUserId: z.number().int(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(serviceStaffAssignments)
        .where(
          and(
            eq(serviceStaffAssignments.serviceId, input.serviceId),
            eq(serviceStaffAssignments.staffUserId, input.staffUserId),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(serviceStaffAssignments).values({
          serviceId: input.serviceId,
          staffUserId: input.staffUserId,
        });
      }

      return { success: true };
    }),
});
