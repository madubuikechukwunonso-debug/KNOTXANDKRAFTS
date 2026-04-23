import { Hono } from "hono";
import { getDb } from "../../server/queries/connection";
import { verifyPassword, generateToken } from "../../server/lib/auth"; // adjust path if needed

const app = new Hono();

app.post("/login", async (c) => {
  const { identifier, password } = await c.req.json();

  const db = getDb();
  // Add your login logic here (reuse code from your old localAuth.login if possible)
  // For now, this is a placeholder — replace with your real auth code
  const user = await db.query.localUsers.findFirst({
    where: (user, { eq }) => eq(user.email, identifier) || eq(user.username, identifier),
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ ok: false, message: "Invalid credentials" }, 401);
  }

  const token = generateToken(user);

  return c.json({ ok: true, token });
});

export default app;
