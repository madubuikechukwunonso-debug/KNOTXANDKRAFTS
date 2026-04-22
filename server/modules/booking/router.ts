import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery, adminQuery } from "../../middleware";
import { getDb } from "../../queries/connection";
import { bookings } from "@db/schema";

const SERVICE_SLOTS: Record<string, string[]> = {
  "box-braids": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
  "knotless-braids": ["09:00", "10:30", "12:00", "13:30", "15:00"],
  "cornrows": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
  "goddess-locs": ["09:00", "11:00", "13:00", "15:00"],
  "twists": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
  "braid-touchup": ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
};

export const bookingRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        serviceType: z.string().min(1),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        notes: z.string().optional(),
        userId: z.number().optional(),
        userType: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(bookings).values({
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        serviceType: input.serviceType,
        date: input.date,
        time: input.time,
        notes: input.notes,
        userId: input.userId,
        userType: input.userType,
        status: "pending",
      });
      const id = Number(result[0].insertId);
      return { id, ...input, status: "pending" };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(bookings).orderBy(bookings.createdAt);
  }),

  myBookings: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.unifiedUser!;
    return db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, user.id),
          eq(bookings.userType || "", user.userType),
        ),
      )
      .orderBy(bookings.createdAt);
  }),

  updateStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(bookings)
        .set({ status: input.status })
        .where(eq(bookings.id, input.id));
      const result = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1);
      return result[0];
    }),

  reschedule: adminQuery
    .input(
      z.object({
        id: z.number(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(bookings)
        .set({ date: input.date, time: input.time, status: "rescheduled" })
        .where(eq(bookings.id, input.id));
      const result = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1);
      return result[0];
    }),

  cancel: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(bookings)
        .set({ status: "cancelled" })
        .where(eq(bookings.id, input.id));
      return { success: true };
    }),

  getAvailableSlots: publicQuery
    .input(
      z.object({
        date: z.string(),
        serviceType: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const slots = SERVICE_SLOTS[input.serviceType] || SERVICE_SLOTS["box-braids"];

      const existingBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.date, input.date),
            eq(bookings.serviceType, input.serviceType),
          ),
        );

      const bookedTimes = new Set(
        existingBookings
          .filter((b) => b.status !== "cancelled")
          .map((b) => b.time),
      );

      return slots.filter((slot) => !bookedTimes.has(slot));
    }),
});
