import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { getDb } from "./queries/connection.js";
import { localUsers } from "@db/schema";
import { signLocalToken, verifyLocalToken } from "./modules/auth/local-utils.js";

type LoginBody = {
  identifier?: string;
  password?: string;
};

type RegisterBody = {
  username?: string;
  email?: string;
  password?: string;
  displayName?: string;
};

function getTokenFromRequest(req: Request) {
  return (
    req.headers.get("x-local-auth-token") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""
  );
}

export const sessionRoutes = new Hono();

sessionRoutes.post("/login", async (c) => {
  try {
    const raw = await c.req.text();
    let body: LoginBody = {};

    try {
      body = raw ? (JSON.parse(raw) as LoginBody) : {};
    } catch {
      return c.json(
        {
          ok: false,
          message: "Invalid JSON request body",
        },
        400,
      );
    }

    const identifier = body.identifier?.trim() || "";
    const password = body.password?.trim() || "";

    if (!identifier || !password) {
      return c.json(
        {
          ok: false,
          message: "Username/email and password are required",
        },
        400,
      );
    }

    const db = getDb();

    const users = await db
      .select()
      .from(localUsers)
      .where(
        or(
          eq(localUsers.username, identifier),
          eq(localUsers.email, identifier),
        ),
      )
      .limit(1);

    if (users.length === 0) {
      return c.json(
        {
          ok: false,
          message: "Invalid credentials",
        },
        401,
      );
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return c.json(
        {
          ok: false,
          message: "Invalid credentials",
        },
        401,
      );
    }

    if (user.isBlocked || !user.isActive) {
      return c.json(
        {
          ok: false,
          message: "This account is unavailable",
        },
        403,
      );
    }

    const token = await signLocalToken(user.id);

    return c.json({
      ok: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.displayName || user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("POST /api/session/login failed:", error);
    return c.json(
      {
        ok: false,
        message: "Login failed",
      },
      500,
    );
  }
});

sessionRoutes.post("/register", async (c) => {
  try {
    const raw = await c.req.text();
    let body: RegisterBody = {};

    try {
      body = raw ? (JSON.parse(raw) as RegisterBody) : {};
    } catch {
      return c.json(
        {
          ok: false,
          message: "Invalid JSON request body",
        },
        400,
      );
    }

    const username = body.username?.trim() || "";
    const email = body.email?.trim() || "";
    const password = body.password?.trim() || "";
    const displayName = body.displayName?.trim() || "";

    if (!username || !email || !password) {
      return c.json(
        {
          ok: false,
          message: "Username, email and password are required",
        },
        400,
      );
    }

    const db = getDb();

    const existingUsername = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      return c.json(
        {
          ok: false,
          message: "Username already taken",
        },
        409,
      );
    }

    const existingEmail = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      return c.json(
        {
          ok: false,
          message: "Email already registered",
        },
        409,
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.insert(localUsers).values({
      username,
      email,
      displayName: displayName || username,
      passwordHash,
      role: "user",
      isActive: 1,
      isBlocked: 0,
    });

    const userId = Number(result[0].insertId);
    const token = await signLocalToken(userId);

    return c.json({
      ok: true,
      token,
      user: {
        id: userId,
        username,
        email,
        name: displayName || username,
        role: "user",
      },
    });
  } catch (error) {
    console.error("POST /api/session/register failed:", error);
    return c.json(
      {
        ok: false,
        message: "Registration failed",
      },
      500,
    );
  }
});

sessionRoutes.get("/me", async (c) => {
  try {
    const token = getTokenFromRequest(c.req.raw);

    if (!token) {
      return c.json({
        ok: true,
        user: null,
      });
    }

    const user = await verifyLocalToken(token);

    if (!user) {
      return c.json({
        ok: true,
        user: null,
      });
    }

    return c.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.displayName || user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("GET /api/session/me failed:", error);
    return c.json(
      {
        ok: false,
        user: null,
        message: "Failed to load session",
      },
      500,
    );
  }
});

sessionRoutes.post("/logout", async (c) => {
  return c.json({ ok: true });
});
