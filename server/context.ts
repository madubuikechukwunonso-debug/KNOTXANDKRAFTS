import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { LocalUser } from "@db/schema";
import { verifyLocalToken } from "./modules/auth/local-utils";

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
  if (!localUser) {
    return undefined;
  }

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

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = {
    req: opts.req,
    resHeaders: opts.resHeaders,
  };

  try {
    const token =
      opts.req.headers.get("x-local-auth-token") ||
      opts.req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (token) {
      ctx.localUser = await verifyLocalToken(token);
    }
  } catch {
    // Local auth is optional
  }

  ctx.unifiedUser = toUnifiedUser(ctx.localUser);

  return ctx;
}
