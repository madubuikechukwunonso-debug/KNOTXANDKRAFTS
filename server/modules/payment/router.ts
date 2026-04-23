import Stripe from "stripe";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { bookings, orderItems, orders, products, services } from "@db/schema";
import { createRouter, publicQuery } from "../../middleware.js";
import { getDb } from "../../queries/connection.js";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(secretKey);
}

function requiredUrl(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const paymentRouter = createRouter({
  createProductCheckoutSession: publicQuery
    .input(
      z.object({
        customerName: z.string().min(2),
        customerEmail: z.string().email(),
        customerPhone: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number().int(),
            quantity: z.number().int().positive(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const stripe = getStripe();

      const productIds = input.items.map((item) => item.productId);

      const dbProducts = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds));

      if (dbProducts.length === 0) {
        throw new Error("No products found");
      }

      const total = input.items.reduce((sum, item) => {
        const product = dbProducts.find((p) => p.id === item.productId);

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (!product.stripePriceId) {
          throw new Error(`Product ${product.name} is not synced to Stripe`);
        }

        return sum + product.price * item.quantity;
      }, 0);

      const orderResult = await db.insert(orders).values({
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        total,
        status: "pending",
        shippingStatus: "pending",
      });

      const orderId = Number(orderResult[0].insertId);

      for (const item of input.items) {
        const product = dbProducts.find((p) => p.id === item.productId)!;

        await db.insert(orderItems).values({
          orderId,
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      const appUrl = requiredUrl("APP_URL");

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: input.customerEmail,
        success_url: `${appUrl}/checkout?success=1&orderId=${orderId}`,
        cancel_url: `${appUrl}/cart?cancelled=1`,
        client_reference_id: String(orderId),
        metadata: {
          type: "product_order",
          orderId: String(orderId),
        },
        line_items: input.items.map((item) => {
          const product = dbProducts.find((p) => p.id === item.productId)!;

          if (!product.stripePriceId) {
            throw new Error(`Product ${product.name} is not synced to Stripe`);
          }

          return {
            price: product.stripePriceId,
            quantity: item.quantity,
          };
        }),
      });

      return {
        orderId,
        url: session.url,
        sessionId: session.id,
      };
    }),

  createServiceCheckoutSession: publicQuery
    .input(
      z.object({
        bookingId: z.number().int(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const stripe = getStripe();

      const bookingRows = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.bookingId))
        .limit(1);

      if (bookingRows.length === 0) {
        throw new Error("Booking not found");
      }

      const booking = bookingRows[0];

      if (!booking.serviceId) {
        throw new Error("Booking has no service attached");
      }

      const serviceRows = await db
        .select()
        .from(services)
        .where(and(eq(services.id, booking.serviceId), eq(services.active, 1)))
        .limit(1);

      if (serviceRows.length === 0) {
        throw new Error("Service not found");
      }

      const service = serviceRows[0];

      if (!service.stripePriceId) {
        throw new Error(`Service ${service.name} is not synced to Stripe`);
      }

      const appUrl = requiredUrl("APP_URL");

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: booking.customerEmail,
        success_url: `${appUrl}/booking?paid=1&bookingId=${booking.id}`,
        cancel_url: `${appUrl}/booking?cancelled=1&bookingId=${booking.id}`,
        client_reference_id: String(booking.id),
        metadata: {
          type: "service_booking",
          bookingId: String(booking.id),
          serviceId: String(service.id),
        },
        line_items: [
          {
            price: service.stripePriceId,
            quantity: 1,
          },
        ],
      });

      await db
        .update(bookings)
        .set({
          stripeCheckoutSessionId: session.id,
          paymentStatus: "pending",
        })
        .where(eq(bookings.id, booking.id));

      return {
        bookingId: booking.id,
        url: session.url,
        sessionId: session.id,
      };
    }),

  markCheckoutPaid: publicQuery
    .input(
      z.object({
        type: z.enum(["product_order", "service_booking"]),
        id: z.number().int(),
        stripePaymentIntent: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      if (input.type === "product_order") {
        await db
          .update(orders)
          .set({
            status: "paid",
            stripePaymentIntent: input.stripePaymentIntent,
          })
          .where(eq(orders.id, input.id));

        const updated = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.id))
          .limit(1);

        return updated[0];
      }

      await db
        .update(bookings)
        .set({
          paymentStatus: "paid",
        })
        .where(eq(bookings.id, input.id));

      const updated = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, input.id))
        .limit(1);

      return updated[0];
    }),
});
