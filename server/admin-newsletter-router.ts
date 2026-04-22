import { asc, desc } from "drizzle-orm";
import { z } from "zod";
import { adminQuery, createRouter } from "./middleware";
import {
  bookings,
  newsletterCampaigns,
  newsletterRecipients,
  orders,
  subscribers,
  users,
} from "@db/schema";
import { getDb } from "./queries/connection";
import { sendMail } from "./mail";

type Recipient = {
  email: string;
  name?: string | null;
};

function dedupeRecipients(items: Recipient[]) {
  const map = new Map<string, Recipient>();

  for (const item of items) {
    if (!item.email) continue;
    map.set(item.email.toLowerCase(), {
      email: item.email,
      name: item.name || null,
    });
  }

  return Array.from(map.values());
}

export const adminNewsletterRouter = createRouter({
  suggestions: adminQuery
    .input(z.object({ query: z.string().trim().default("") }))
    .query(async ({ input }) => {
      const db = getDb();

      const [subscriberRows, orderRows, bookingRows, userRows] = await Promise.all([
        db.select().from(subscribers).orderBy(desc(subscribers.createdAt)),
        db.select().from(orders).orderBy(desc(orders.createdAt)),
        db.select().from(bookings).orderBy(desc(bookings.createdAt)),
        db.select().from(users).orderBy(desc(users.lastSignInAt)),
      ]);

      const allRecipients = dedupeRecipients([
        ...subscriberRows
          .filter((row) => Boolean(row.isActive))
          .map((row) => ({ email: row.email, name: row.name })),
        ...orderRows.map((row) => ({
          email: row.customerEmail,
          name: row.customerName,
        })),
        ...bookingRows.map((row) => ({
          email: row.customerEmail,
          name: row.customerName,
        })),
        ...userRows
          .filter((row) => Boolean(row.email))
          .map((row) => ({
            email: row.email!,
            name: row.name,
          })),
      ]);

      const term = input.query.toLowerCase();

      return allRecipients
        .filter((item) => {
          if (!term) return true;
          return (
            item.email.toLowerCase().includes(term) ||
            (item.name || "").toLowerCase().includes(term)
          );
        })
        .slice(0, 20);
    }),

  send: adminQuery
    .input(
      z.object({
        subject: z.string().min(2),
        htmlBody: z.string().min(2),
        sendToEveryone: z.boolean().default(false),
        recipients: z.array(
          z.object({
            email: z.string().email(),
            name: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      let recipients: Recipient[] = input.recipients;

      if (input.sendToEveryone) {
        const [subscriberRows, orderRows, bookingRows, userRows] = await Promise.all([
          db.select().from(subscribers).orderBy(asc(subscribers.id)),
          db.select().from(orders).orderBy(asc(orders.id)),
          db.select().from(bookings).orderBy(asc(bookings.id)),
          db.select().from(users).orderBy(asc(users.id)),
        ]);

        recipients = dedupeRecipients([
          ...subscriberRows
            .filter((row) => Boolean(row.isActive))
            .map((row) => ({ email: row.email, name: row.name })),
          ...orderRows.map((row) => ({
            email: row.customerEmail,
            name: row.customerName,
          })),
          ...bookingRows.map((row) => ({
            email: row.customerEmail,
            name: row.customerName,
          })),
          ...userRows
            .filter((row) => Boolean(row.email))
            .map((row) => ({
              email: row.email!,
              name: row.name,
            })),
        ]);
      }

      const campaignResult = await db.insert(newsletterCampaigns).values({
        subject: input.subject,
        htmlBody: input.htmlBody,
        audienceType: input.sendToEveryone ? "everyone" : "selected",
        sendToEveryone: input.sendToEveryone ? 1 : 0,
        createdById: ctx.unifiedUser!.id,
        sentAt: new Date(),
      });

      const campaignId = Number(campaignResult[0].insertId);

      for (const recipient of recipients) {
        try {
          await sendMail({
            to: recipient.email,
            subject: input.subject,
            html: input.htmlBody,
          });

          await db.insert(newsletterRecipients).values({
            campaignId,
            email: recipient.email,
            name: recipient.name,
            deliveryStatus: "sent",
          });
        } catch {
          await db.insert(newsletterRecipients).values({
            campaignId,
            email: recipient.email,
            name: recipient.name,
            deliveryStatus: "failed",
          });
        }
      }

      const campaign = await db
        .select()
        .from(newsletterCampaigns)
        .where((table, { eq }) => eq(table.id, campaignId))
        .limit(1);

      return {
        campaign: campaign[0],
        recipientCount: recipients.length,
      };
    }),
});
