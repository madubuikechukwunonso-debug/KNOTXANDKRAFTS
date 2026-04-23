import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext, UnifiedRole } from "./context.js";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.unifiedUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  if (ctx.unifiedUser.isBlocked) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This account has been blocked.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      unifiedUser: ctx.unifiedUser,
    },
  });
});

function requireAnyRole(roles: UnifiedRole[]) {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.unifiedUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.unauthenticated,
      });
    }

    if (ctx.unifiedUser.isBlocked) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This account has been blocked.",
      });
    }

    if (!roles.includes(ctx.unifiedUser.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({
      ctx: {
        ...ctx,
        unifiedUser: ctx.unifiedUser,
      },
    });
  });
}

export const authedQuery = t.procedure.use(requireAuth);

export const staffQuery = authedQuery.use(
  requireAnyRole(["worker", "admin", "super_admin"]),
);

export const adminQuery = authedQuery.use(
  requireAnyRole(["admin", "super_admin"]),
);

export const superAdminQuery = authedQuery.use(
  requireAnyRole(["super_admin"]),
);
