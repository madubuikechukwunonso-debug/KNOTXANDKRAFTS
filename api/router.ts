import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { productRouter } from "./product-router";
import { orderRouter } from "./order-router";
import { bookingRouter } from "./booking-router";
import { heroImageRouter } from "./hero-image-router";
import { subscriberRouter } from "./subscriber-router";
import { userRouter } from "./user-router";
import { contactRouter } from "./contact-router";
import { paymentRouter } from "./payment-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  product: productRouter,
  order: orderRouter,
  booking: bookingRouter,
  heroImage: heroImageRouter,
  subscriber: subscriberRouter,
  user: userRouter,
  contact: contactRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
