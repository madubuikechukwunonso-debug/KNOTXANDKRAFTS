import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "./queries/connection.js";
import { localUsers } from "@db/schema";

function readBootstrapEnv() {
  return {
    email: process.env.INITIAL_ADMIN_EMAIL ?? "",
    password: process.env.INITIAL_ADMIN_PASSWORD ?? "",
    name: process.env.INITIAL_ADMIN_NAME ?? "Owner",
    username:
      process.env.INITIAL_ADMIN_USERNAME ??
      (process.env.INITIAL_ADMIN_EMAIL?.split("@")[0] || "owner"),
  };
}

export async function bootstrapInitialAdmin() {
  const { email, password, name, username } = readBootstrapEnv();

  if (!email || !password) {
    return;
  }

  const db = getDb();

  const existingSuperAdmin = await db
    .select()
    .from(localUsers)
    .where(eq(localUsers.role, "super_admin"))
    .limit(1);

  if (existingSuperAdmin.length > 0) {
    return;
  }

  const existingByEmail = await db
    .select()
    .from(localUsers)
    .where(eq(localUsers.email, email))
    .limit(1);

  if (existingByEmail.length > 0) {
    await db
      .update(localUsers)
      .set({
        role: "super_admin",
        isActive: 1,
        isBlocked: 0,
        blockedAt: null,
        blockedReason: null,
      })
      .where(eq(localUsers.id, existingByEmail[0].id));

    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(localUsers).values({
    username,
    email,
    displayName: name,
    passwordHash,
    role: "super_admin",
    isActive: 1,
    isBlocked: 0,
  });
}
