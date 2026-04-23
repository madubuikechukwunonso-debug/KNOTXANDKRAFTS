import * as jose from "jose";
import { eq } from "drizzle-orm";
import { env } from "../../lib/env";
import { getDb } from "../../queries/connection";
import { localUsers } from "@db/schema";
import type { LocalUser } from "@db/schema";

const JWT_SECRET = new TextEncoder().encode(env.appSecret);

export async function signLocalToken(userId: number): Promise<string> {
  return new jose.SignJWT({ userId, type: "local" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyLocalToken(
  token: string,
): Promise<LocalUser | undefined> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });

    const userId = payload.userId as number;
    if (!userId) return undefined;

    const db = getDb();
    const user = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.id, userId))
      .limit(1);

    return user[0] || undefined;
  } catch (error) {
    console.error("verifyLocalToken failed:", error);
    return undefined;
  }
}
