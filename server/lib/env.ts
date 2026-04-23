// server/lib/env.ts
import "dotenv/config"; // ← This line is kept but will be skipped in production

/**
 * Required environment variables for the app to run in production.
 * In development we allow missing vars (dotenv loads .env file).
 * In production we throw a clear error with instructions.
 */
const REQUIRED_VARS = [
  "DATABASE_URL",
  "APP_SECRET",
  "INITIAL_ADMIN_EMAIL",
  "INITIAL_ADMIN_USERNAME",
  "INITIAL_ADMIN_PASSWORD",
  "INITIAL_ADMIN_NAME",
] as const;

function validateEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const missing: string[] = [];
  for (const name of REQUIRED_VARS) {
    if (!process.env[name]) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables in production:\n` +
        ` ${missing.join(", ")}\n\n` +
        `Please add them in Vercel Dashboard → Settings → Environment Variables\n` +
        `and redeploy.\n\n` +
        `DATABASE_URL → your MySQL connection string\n` +
        `APP_SECRET → a strong random secret (32+ chars)\n` +
        `INITIAL_ADMIN_* → used for first-time admin account creation`,
    );
  }
}

// Run validation as soon as this module is imported
validateEnv();

export const env = {
  isProduction: process.env.NODE_ENV === "production",

  // Core
  databaseUrl: process.env.DATABASE_URL ?? "",
  appSecret: process.env.APP_SECRET ?? "",

  // Initial admin (for bootstrap)
  initialAdmin: {
    email: process.env.INITIAL_ADMIN_EMAIL ?? "",
    username: process.env.INITIAL_ADMIN_USERNAME ?? "",
    password: process.env.INITIAL_ADMIN_PASSWORD ?? "",
    name: process.env.INITIAL_ADMIN_NAME ?? "",
  },
};
