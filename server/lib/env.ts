import "dotenv/config";

/**
 * Required environment variables for the app to run in production.
 * In development we allow missing vars (dotenv loads .env file).
 * In production we throw a clear error with instructions.
 */
const REQUIRED_VARS = ["DATABASE_URL", "APP_SECRET"] as const;

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
      `   ${missing.join(", ")}\n\n` +
      `Please add them in Vercel Dashboard → Settings → Environment Variables\n` +
      `and redeploy.\n\n` +
      `DATABASE_URL → your MySQL connection string\n` +
      `APP_SECRET   → a strong random secret (e.g. openssl rand -hex 32)`
    );
  }
}

// Run validation as soon as this module is imported
validateEnv();

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  appSecret: process.env.APP_SECRET ?? "",
};
