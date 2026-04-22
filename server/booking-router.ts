import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { bookings, services, staffProfiles, staffTimeOff, staffWorkingHours } from "@db/schema";
import { authedQuery, createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";

function dayOfWeekFromDate(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.getDay();
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function buildSlots(startTime: string, endTime: string, stepMinutes: number) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: string[] = [];

  for (let current = start; current + stepMinutes <= end; current += stepMinutes) {
    slots.push(minutesToTime(current));
  }

  return slots;
}

async function getAvailabilityForService(input: { date: string; serviceId: number }) {
  const db = getDb();

  const serviceRows = await db
    .select()
    .from(services)
    .where(and(eq(services.id, input.serviceId), eq(services.active, 1)))
    .limit(1);

  if (serviceRows.length === 0) {
    return [];
  }

  const service = serviceRows[0];
  const dayOfWeek = dayOfWeekFromDate(input.date);

  const profiles = await db.select().from(staffProfiles);
  const hours = await db.select().from(staffWorkingHours);
  const timeOffRows = await db.select().from(staffTimeOff);
  const bookingRows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.date, input.date));

  const bookingEnabledProfiles = profiles.filter((item) => Boolean(item.bookingEnabled));

  const availableByStaff = bookingEnabledProfiles.flatMap((profile) => {
    const working = hours.find(
      (item) =>
        item.staffUserId === profile.userId &&
        item.dayOfWeek === dayOfWeek &&
        Boolean(item.isWorking),
    );

    if (!working) {
      return [];
    }

    const timeOffForDay = timeOffRows.some((item) => {
      if (item.staffUserId !== profile.userId) return false;
      const start = new Date(item.startAt);
      const end = new Date(item.endAt);
      const target = new Date(`${input.date}T12:00:00`);
      return target >= start && target <= end;
    });

    if (timeOffForDay) {
      return [];
    }

    const bookedTimes = new Set(
      bookingRows
        .filter(
          (row) =>
            row.staffUserId === profile.userId && row.status !== "cancelled",
        )
        .map((row) => row.time),
    );

    return buildSlots(
      working.startTime,
      working.endTime,
      service.durationMinutes,
    )
      .filter((slot) => !bookedTimes.has(slot))
      .map((slot) => ({
        staffUserId: profile.userId,
        staffName: profile.displayName,
        time: slot,
      }));
  });

  return availableByStaff;
}

export const bookingRouter = createRouter({
  listServices: publicQuery.query(async () => {
    const db = getDb();

    return db
      .select()
      .from(services)
      .where(eq(services.active, 1));
  }),

  availableSlots: publicQuery
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        serviceId: z.number().int(),
      }),
    )
    .query(async ({ input }) => {
      return getAvailabilityForService(input);
    }),

  create: publicQuery
    .input(
      z.object({
        customerName: z.string().min(2),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        serviceId: z.number().int(),
        staffUserId: z.number().int(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const serviceRows = await db
        .select()
        .from(services)
        .where(and(eq(services.id, input.serviceId), eq(services.active, 1)))
        .limit(1);

      if (serviceRows.length === 0) {
        throw new Error("Service not found");
      }

      const service = serviceRows[0];
      const available = await getAvailabilityForService({
        date: input.date,
        serviceId: input.serviceId,
      });

      const validSlot = available.find(
        (slot) =>
          slot.staffUserId === input.staffUserId && slot.time === input.time,
      );

      if (!validSlot) {
        throw new Error("Selected booking slot is no longer available");
      }

      const result = await db.insert(bookings).values({
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        serviceId: service.id,
        staffUserId: input.staffUserId,
        serviceType: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
        date: input.date,
        time: input.time,
        status: "pending",
        paymentStatus: "unpaid",
        notes: input.notes,
      });

      const id = Number(result[0].insertId);

      const created = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, id))
        .limit(1);

      return created[0];
    }),

  listMine: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.unifiedUser!;

    if (user.userType === "local") {
      return db
        .select()
        .from(bookings)
        .where(eq(bookings.customerEmail, user.email || ""));
    }

    return db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, user.id));
  }),
});
