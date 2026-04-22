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
import { adminServicesRouter } from "./modules/admin-services/router";
import { adminProductsRouter } from "./modules/admin-products/router";
import { adminGalleryRouter } from "./modules/admin-gallery/router";
import { adminOrdersRouter } from "./modules/admin-orders/router";
import { adminNewsletterRouter } from "./modules/admin-newsletter/router";
import { adminUsersRouter } from "./modules/admin-users/router";
import { adminStaffRouter } from "./modules/admin-staff/router";
import { adminMessagesRouter } from "./modules/admin-messages/router";
import { adminBookingRouter } from "./modules/admin-booking/router";
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
