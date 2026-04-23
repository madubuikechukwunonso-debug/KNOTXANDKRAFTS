import { initTRPC } from '@trpc/server';
import type { TrpcContext } from './context';           // Make sure this path is correct
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

// ==================== IMPROVED tRPC SETUP WITH BETTER ERROR LOGGING ====================

const t = initTRPC.context<TrpcContext>().create({
  /**
   * Global error formatter - This catches ALL tRPC errors (especially 500s)
   * and logs detailed information so we can finally see why product.list is failing.
   */
  errorFormatter({ shape, error, ctx }) {
    const isInternalError = error.code === 'INTERNAL_SERVER_ERROR';
    const path = shape.data?.path ?? 'unknown';

    const logData = {
      timestamp: new Date().toISOString(),
      path,
      procedureType: shape.data?.type ?? 'unknown',
      code: error.code,
      message: error.message,
      cause: error.cause ? String(error.cause) : undefined,
      userId: ctx?.unifiedUser?.id ?? null,
      userRole: ctx?.unifiedUser?.role ?? null,
    };

    if (isInternalError) {
      console.error('🚨 tRPC INTERNAL SERVER ERROR:', logData);
      console.error('Full Error Details:', {
        name: error.name,
        stack: error.stack,
        cause: error.cause,
      });
    } else {
      console.warn('⚠️ tRPC Error:', logData);
    }

    // Return sanitized error to client (never leak sensitive info in production)
    return {
      ...shape,
      message:
        process.env.NODE_ENV === 'production' && isInternalError
          ? 'Internal server error. Please try again later.'
          : shape.message,
    };
  },
});

// Re-export the enhanced router and procedures
export const createRouter = t.router;
export const publicQuery = t.procedure;           // You were using publicQuery
export const publicProcedure = t.procedure;       // Standard name for consistency

// Optional: You can add protectedProcedure here later if needed
// export const protectedProcedure = t.procedure.use(...);

// ==================== APP ROUTER ====================

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ 
    ok: true, 
    ts: Date.now(),
    env: process.env.NODE_ENV 
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
