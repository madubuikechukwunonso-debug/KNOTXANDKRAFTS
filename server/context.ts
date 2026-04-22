import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { LocalUser, User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyLocalToken } from "./modules/auth/local-utils";

export type UnifiedRole = "user" | "worker" | "admin" | "super_admin";
export type UnifiedUserType = "oauth" | "local";

export type UnifiedUser = {
  id: number;
  name: string;
  email: string | null;
  avatar?: string | null;
  role: UnifiedRole;
  userType: UnifiedUserType;
  isBlocked: boolean;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  localUser?: LocalUser;
  unifiedUser?: UnifiedUser;
};

function toUnifiedUser(
  user?: User,
  localUser?: LocalUser,
): UnifiedUser | undefined {
  if (user) {
    return {
      id: user.id,
      name: user.name || "User",
      email: user.email,
      avatar: user.avatar,
      role: (user.role as UnifiedRole) || "user",
      userType: "oauth",
      isBlocked: Boolean(user.isBlocked),
    };
  }

  if (localUser) {
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

  return undefined;
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = {
    req: opts.req,
    resHeaders: opts.resHeaders,
  };

  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // OAuth auth is optional
  }

  if (!ctx.user) {
    try {
      const token = opts.req.headers.get("x-local-auth-token");

      if (token) {
        ctx.localUser = await verifyLocalToken(token);
      }
    } catch {
      // Local auth is optional
    }
  }

  ctx.unifiedUser = toUnifiedUser(ctx.user, ctx.localUser);

  return ctx;
}
