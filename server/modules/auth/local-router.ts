import { z } from "zod";
import { eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { createRouter, publicQuery } from "../../middleware";
import { getDb } from "../../queries/connection";
import { localUsers } from "@db/schema";
import { signLocalToken } from "./local-utils";

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(50),
        email: z.string().email(),
        password: z.string().min(6),
        displayName: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();

        const existingUsername = await db
          .select()
          .from(localUsers)
          .where(eq(localUsers.username, input.username))
          .limit(1);
        if (existingUsername.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "Username already taken" });
        }

        const existingEmail = await db
          .select()
          .from(localUsers)
          .where(eq(localUsers.email, input.email))
          .limit(1);
        if (existingEmail.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        const result = await db.insert(localUsers).values({
          username: input.username,
          email: input.email,
          displayName: input.displayName || input.username,
          passwordHash,
          role: "user",
          isActive: 1,
          isBlocked: 0,
        });

        const userId = Number(result[0].insertId);
        const token = await signLocalToken(userId);

        return {
          token,
          user: {
            id: userId,
            username: input.username,
            email: input.email,
            name: input.displayName || input.username,
            role: "user",
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Register error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account. Please try again.",
        });
      }
    }),

  login: publicQuery
    .input(
      z.object({
        identifier: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const db = getDb();

        const users = await db
          .select()
          .from(localUsers)
          .where(
            or(
              eq(localUsers.username, input.identifier),
              eq(localUsers.email, input.identifier),
            ),
          )
          .limit(1);

        if (users.length === 0) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        const user = users[0];
        const valid = await bcrypt.compare(input.password, user.passwordHash);

        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        if (user.isBlocked || !user.isActive) {
          throw new TRPCError({ code: "FORBIDDEN", message: "This account is unavailable" });
        }

        const token = await signLocalToken(user.id);

        return {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.displayName || user.username,
            role: user.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Login error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed. Please check your credentials and try again.",
        });
      }
    }),

  // ✅ Now uses context (much faster + consistent with authRouter)
  me: publicQuery.query(({ ctx }) => {
    if (!ctx.localUser) return null;

    return {
      id: ctx.localUser.id,
      username: ctx.localUser.username,
      email: ctx.localUser.email,
      name: ctx.localUser.displayName || ctx.localUser.username,
      role: ctx.localUser.role,
    };
  }),

  logout: publicQuery.mutation(async () => {
    return { success: true };
  }),
});
