import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { createRouter, publicQuery } from "../../middleware";
import { getDb } from "../../queries/connection";
import { localUsers } from "@db/schema";
import { signLocalToken, verifyLocalToken } from "./local-utils";

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
      const db = getDb();

      const existing = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      const existingEmail = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.email, input.email))
        .limit(1);

      if (existingEmail.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      const result = await db.insert(localUsers).values({
        username: input.username,
        email: input.email,
        displayName: input.displayName || input.username,
        passwordHash,
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
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const users = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (users.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const user = users[0];
      const valid = await bcrypt.compare(input.password, user.passwordHash);

      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
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
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const token = ctx.req.headers.get("x-local-auth-token");
    if (!token) return null;

    const user = await verifyLocalToken(token);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.displayName || user.username,
      role: user.role,
    };
  }),
});
