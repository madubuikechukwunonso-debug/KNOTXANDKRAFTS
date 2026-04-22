import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminQuery, createRouter } from "./middleware";
import { getDb } from "./queries/connection";
import { orderStatusEvents, orders } from "@db/schema";
import { sendMail } from "./mail";

function shippedEmailHtml(name: string, trackingNumber?: string | null) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Your order has shipped</h2>
      <p>Hi ${name},</p>
      <p>Your KNOTXANDKRAFTS order is now on its way.</p>
      ${
        trackingNumber
          ? `<p><strong>Tracking number:</strong> ${trackingNumber}</p>`
          : ""
      }
      <p>Thank you for shopping with us.</p>
    </div>
  `;
}

function fulfilledEmailHtml(name: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Your order is complete</h2>
      <p>Hi ${name},</p>
      <p>Your order has been marked as fulfilled.</p>
      <p>Thank you for choosing KNOTXANDKRAFTS.</p>
    </div>
  `;
}

export const adminOrdersRouter = createRouter({
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(orders);
  }),

  updateShippingStatus: adminQuery
    .input(
      z.object({
        id: z.number().int(),
        shippingStatus: z.enum(["pending", "processing", "shipped", "fulfilled", "cancelled"]),
        shippingCarrier: z.string().optional(),
        trackingNumber: z.string().optional(),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new Error("Order not found");
      }

      const updatePayload: Record<string, unknown> = {
        shippingStatus: input.shippingStatus,
        status:
          input.shippingStatus === "fulfilled"
            ? "fulfilled"
            : input.shippingStatus === "cancelled"
              ? "cancelled"
              : existing[0].status,
        shippingCarrier: input.shippingCarrier,
        trackingNumber: input.trackingNumber,
      };

      if (input.shippingStatus === "fulfilled") {
        updatePayload.fulfilledAt = new Date();
        updatePayload.fulfilledById = ctx.unifiedUser!.id;
      }

      await db.update(orders).set(updatePayload).where(eq(orders.id, input.id));

      await db.insert(orderStatusEvents).values({
        orderId: input.id,
        status: input.shippingStatus,
        note: input.note,
        changedById: ctx.unifiedUser!.id,
      });

      const updated = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      const order = updated[0];

      if (input.shippingStatus === "shipped") {
        await sendMail({
          to: order.customerEmail,
          subject: "Your order has shipped",
          html: shippedEmailHtml(order.customerName, order.trackingNumber),
        });
      }

      if (input.shippingStatus === "fulfilled") {
        await sendMail({
          to: order.customerEmail,
          subject: "Your order is fulfilled",
          html: fulfilledEmailHtml(order.customerName),
        });
      }

      return order;
    }),
});
