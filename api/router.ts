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
import { adminServicesRouter } from "./admin-services-router";
import { adminProductsRouter } from "./admin-products-router";
import { adminGalleryRouter } from "./admin-gallery-router";
import { adminOrdersRouter } from "./admin-orders-router";
import { adminNewsletterRouter } from "./admin-newsletter-router";
import { adminUsersRouter } from "./admin-users-router";
import { adminStaffRouter } from "./admin-staff-router";
import { adminMessagesRouter } from "./admin-messages-router";
import { adminBookingRouter } from "./admin-booking-router";
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

  adminServices: adminServicesRouter,
  adminProducts: adminProductsRouter,
  adminGallery: adminGalleryRouter,
  adminOrders: adminOrdersRouter,
  adminNewsletter: adminNewsletterRouter,
  adminUsers: adminUsersRouter,
  adminStaff: adminStaffRouter,
  adminMessages: adminMessagesRouter,
  adminBooking: adminBookingRouter,
});

export type AppRouter = typeof appRouter;
