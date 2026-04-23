import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { LocalUser } from "@db/schema";
import { verifyLocalToken } from "./modules/auth/local-utils";
import { TRPCError } from "@trpc/server";

export type UnifiedRole = "user" | "worker" | "admin" | "super_admin";

export type UnifiedUser = {
  id: number;
  name: string;
  email: string | null;
  avatar?: string | null;
  role: UnifiedRole;
  userType: "local";
  isBlocked: boolean;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  localUser?: LocalUser;
  unifiedUser?: UnifiedUser;
};

function toUnifiedUser(localUser?: LocalUser): UnifiedUser | undefined {
  if (!localUser) return undefined;

  return {
    id: localUser.id,
    name: localUser.displayName || localUser.username,
    email: localUser.email,
    avatar: null,
    role: (localUser.role as UnifiedRole) || "user",
    userType: "local",
    isBlocked: Boolean(localUser.isBlocked) || !Boolean(localUser.isActive),
  };
}

/**
 * Enhanced createContext with detailed logging for debugging 500 errors
 */
export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const startTime = Date.now();

  const ctx: TrpcContext = {
    req: opts.req,
    resHeaders: opts.resHeaders,
  };

  try {
    const token =
      opts.req.headers.get("x-local-auth-token") ||
      opts.req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (token) {
      console.log(`🔑 [tRPC Context] Verifying token for request: ${opts.req.url}`);
      ctx.localUser = await verifyLocalToken(token);
      console.log(`✅ [tRPC Context] Token verified successfully for user: ${ctx.localUser?.id || 'unknown'}`);
    } else {
      console.log(`ℹ️ [tRPC Context] No auth token provided for request: ${opts.req.url}`);
    }
  } catch (error: any) {
    // Log auth errors clearly but don't break the context (auth is optional)
    console.warn(`⚠️ [tRPC Context] Token verification failed:`, {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      url: opts.req.url,
    });

    // Do not throw — local auth is optional as per your original code
  }

  ctx.unifiedUser = toUnifiedUser(ctx.localUser);

  console.log(`⏱️ [tRPC Context] Context created in ${Date.now() - startTime}ms for ${opts.req.url}`);

  return ctx;
}
