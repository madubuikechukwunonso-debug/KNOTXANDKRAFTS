import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  bookings,
  services,
  staffProfiles,
  staffTimeOff,
  staffWorkingHours,
} from "@db/schema";
import {
  adminQuery,
  authedQuery,
  createRouter,
  publicQuery,
} from "../../middleware";
import { getDb } from "../../queries/connection";

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

function buildSlots(
  startTime: string,
  endTime: string,
  stepMinutes: number,
): string[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: string[] = [];

  for (
    let current = start;
    current + stepMinutes <= end;
    current += stepMinutes
  ) {
    slots.push(minutesToTime(current));
  }

  return slots;
}

async function getAvailabilityForService(input: {
  date: string;
  serviceId: number;
}) {
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

  const bookingEnabledProfiles = profiles.filter((profile) =>
    Boolean(profile.bookingEnabled),
  );

  const availableByStaff = bookingEnabledProfiles.flatMap((profile) => {
    const working = hours.find(
      (hour) =>
        hour.staffUserId === profile.userId &&
        hour.dayOfWeek === dayOfWeek &&
        Boolean(hour.isWorking),
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
      .where(eq(services.active, 1))
      .orderBy(asc(services.sortOrder), asc(services.id));
  }),

  getAvailableSlots: publicQuery
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
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        serviceId: z.number().int(),
        staffUserId: z.number().int(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        notes: z.string().optional(),
        userId: z.number().optional(),
        userType: z.enum(["oauth", "local"]).optional(),
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
        paymentStatus: "unpaid",
        date: input.date,
        time: input.time,
        notes: input.notes,
        userId: input.userId,
        userType: input.userType,
        status: "pending",
      });

      const id = Number(result[0].insertId);

      const created = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, id))
        .limit(1);

      return created[0];
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }),

  myBookings: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = ctx.unifiedUser!;

    if (user.userType === "local") {
      return db
        .select()
        .from(bookings)
        .where(eq(bookings.customerEmail, user.email || ""))
        .orderBy(desc(bookings.createdAt));
    }

    return db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, user.id),
          eq(bookings.userType, user.userType),
        ),
      )
      .orderBy(desc(bookings.createdAt));
  }),

  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.string(),
      }),
    )
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
        staffUserId: z.number().optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const currentRows = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1);

      if (currentRows.length === 0) {
        throw new Error("Booking not found");
      }

      const current = currentRows[0];

      if (!current.serviceId) {
        throw new Error("Booking has no linked service");
      }

      const staffUserId = input.staffUserId ?? current.staffUserId;

      if (!staffUserId) {
        throw new Error("A staff member is required for rescheduling");
      }

      const availability = await getAvailabilityForService({
        date: input.date,
        serviceId: current.serviceId,
      });

      const validSlot = availability.find(
        (slot) => slot.staffUserId === staffUserId && slot.time === input.time,
      );

      if (!validSlot) {
        throw new Error("Selected reschedule slot is not available");
      }

      await db
        .update(bookings)
        .set({
          staffUserId,
          date: input.date,
          time: input.time,
          status: "rescheduled",
        })
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
});
