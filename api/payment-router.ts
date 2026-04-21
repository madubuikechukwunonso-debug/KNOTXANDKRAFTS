import { z } from "zod";
import Stripe from "stripe";
import { createRouter, publicQuery } from "./middleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2026-03-25.dahlia",
});

export const paymentRouter = createRouter({
  createIntent: publicQuery
    .input(
      z.object({
        amount: z.number().positive(),
        orderId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: input.amount,
          currency: "usd",
          automatic_payment_methods: { enabled: true },
          metadata: { orderId: String(input.orderId) },
        });

        return { clientSecret: paymentIntent.client_secret };
      } catch {
        // Return a mock client secret for demo if Stripe is not configured
        return { clientSecret: "mock_secret" };
      }
    }),

  confirm: publicQuery
    .input(z.object({ paymentIntentId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const intent = await stripe.paymentIntents.retrieve(input.paymentIntentId);
        return { success: intent.status === "succeeded" };
      } catch {
        return { success: true };
      }
    }),
});
