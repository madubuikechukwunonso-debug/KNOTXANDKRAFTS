import { authRouter } from "./modules/auth/router";
import { localAuthRouter } from "./modules/auth/local-router";
import { productRouter } from "./modules/product/router";
import { orderRouter } from "./modules/order/router";
import { bookingRouter } from "./modules/booking/router";
import { heroImageRouter } from "./modules/hero-image/router";
import { subscriberRouter } from "./modules/subscriber/router";
import { userRouter } from "./modules/user/router";
import { contactRouter } from "./modules/contact/router";
import { paymentRouter } from "./modules/payment/router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({
    ok: true,
    ts: Date.now(),
    env: process.env.NODE_ENV,
  })),

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
