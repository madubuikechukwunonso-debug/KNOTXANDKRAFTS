import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { adminQuery, createRouter } from "./middleware";
import { contactMessages, contactReplies } from "@db/schema";
import { getDb } from "./queries/connection";
import { sendMail } from "./mail";

export const adminMessagesRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }),

  reply: adminQuery
    .input(
      z.object({
        messageId: z.number().int(),
        body: z.string().min(2),
        status: z.string().default("replied"),
        followUpAt: z.string().optional(),
        followUpNotes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const messages = await db
        .select()
        .from(contactMessages)
        .where(eq(contactMessages.id, input.messageId))
        .limit(1);

      if (messages.length === 0) {
        throw new Error("Message not found");
      }

      const message = messages[0];

      await sendMail({
        to: message.email,
        subject: `Re: ${message.subject || "Your message to KNOTXANDKRAFTS"}`,
        replyTo: process.env.SMTP_FROM_EMAIL,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Hi ${message.name},</p>
            <div>${input.body.replace(/\n/g, "<br/>")}</div>
            <p style="margin-top: 24px;">Best,<br/>KNOTXANDKRAFTS</p>
          </div>
        `,
      });

      await db.insert(contactReplies).values({
        messageId: input.messageId,
        sentById: ctx.unifiedUser!.id,
        body: input.body,
      });

      await db
        .update(contactMessages)
        .set({
          read: 1,
          status: input.status,
          assignedToId: ctx.unifiedUser!.id,
          lastRepliedAt: new Date(),
          followUpAt: input.followUpAt ? new Date(input.followUpAt) : null,
          followUpNotes: input.followUpNotes,
        })
        .where(eq(contactMessages.id, input.messageId));

      const updated = await db
        .select()
        .from(contactMessages)
        .where(eq(contactMessages.id, input.messageId))
        .limit(1);

      return updated[0];
    }),
});
