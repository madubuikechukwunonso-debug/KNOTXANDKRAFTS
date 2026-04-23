import { authRouter } from "./modules/auth/router.js";
import { localAuthRouter } from "./modules/auth/local-router.js";
import { productRouter } from "./modules/product/router.js";
import { orderRouter } from "./modules/order/router.js";
import { bookingRouter } from "./modules/booking/router.js";
import { heroImageRouter } from "./modules/hero-image/router.js";
import { subscriberRouter } from "./modules/subscriber/router.js";
import { userRouter } from "./modules/user/router.js";
import { contactRouter } from "./modules/contact/router.js";
import { paymentRouter } from "./modules/payment/router.js";
import { createRouter, publicQuery } from "./middleware.js";

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
