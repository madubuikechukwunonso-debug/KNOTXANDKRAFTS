// api/session/register.ts
import { Hono } from "hono";
import { getDb } from "../../server/queries/connection";
import bcrypt from "bcryptjs";
import { env } from "../../server/lib/env";
import { SignJWT } from "jose";

const app = new Hono();

app.post("/register", async (c) => {
  try {
    const { username, email, password, displayName } = await c.req.json();

    if (!username || !email || !password) {
      return c.json({ ok: false, message: "Username, email and password are required" }, 400);
    }

    const db = getDb();

    // Check for existing user
    const existing = await db.query.localUsers.findFirst({
      where: (u, { eq, or }) => or(eq(u.email, email), eq(u.username, username)),
    });

    if (existing) {
      return c.json({ ok: false, message: "User with this email or username already exists" }, 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db
      .insert(db.schema.localUsers)
      .values({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        displayName: displayName?.trim() || null,
        passwordHash,
        role: "user",
        isActive: 1,
      })
      .returning();

    // Generate JWT
    const secret = new TextEncoder().encode(env.appSecret);
    const token = await new SignJWT({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    return c.json({
      ok: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
      },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return c.json({ ok: false, message: err.message || "Registration failed" }, 500);
  }
});

export default app;
