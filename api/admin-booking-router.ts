import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { adminQuery, createRouter, publicQuery } from "./middleware";
import {
  bookings,
  serviceStaffAssignments,
  services,
  staffProfiles,
  staffTimeOff,
  staffWorkingHours,
} from "@db/schema";
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

export const adminBookingRouter = createRouter({
  getAvailability: publicQuery
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        serviceId: z.number().int(),
      }),
    )
    .query(async ({ input }) => {
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

      const assignments = await db
        .select()
        .from(serviceStaffAssignments)
        .where(eq(serviceStaffAssignments.serviceId, service.id));

      const staffIds = assignments.map((row) => row.staffUserId);

      if (staffIds.length === 0) {
        return [];
      }

      const profiles = await db.select().from(staffProfiles);
      const hours = await db.select().from(staffWorkingHours);
      const timeOffRows = await db.select().from(staffTimeOff);
      const bookingRows = await db
        .select()
        .from(bookings)
        .where(eq(bookings.date, input.date));

      const availableByStaff = staffIds.flatMap((staffUserId) => {
        const profile = profiles.find(
          (item) => item.userId === staffUserId && Boolean(item.bookingEnabled),
        );

        if (!profile) {
          return [];
        }

        const working = hours.find(
          (item) =>
            item.staffUserId === staffUserId &&
            item.dayOfWeek === dayOfWeek &&
            Boolean(item.isWorking),
        );

        if (!working) {
          return [];
        }

        const timeOffForDay = timeOffRows.some((item) => {
          if (item.staffUserId !== staffUserId) return false;
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
                row.staffUserId === staffUserId && row.status !== "cancelled",
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
            staffUserId,
            staffName: profile.displayName,
            time: slot,
          }));
      });

      return availableByStaff;
    }),

  listHours: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(staffWorkingHours);
  }),
});
