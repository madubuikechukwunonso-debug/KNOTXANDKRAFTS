// server/queries/connection.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | undefined;
let pool: mysql.Pool | undefined;

export function getDb() {
  if (!instance) {
    pool = mysql.createPool({
      uri: env.databaseUrl,
      connectionLimit: 10,
      enableKeepAlive: true,
    });

    // FIXED: Added mode: "default" (required for mysql2 driver)
    instance = drizzle(pool, {
      schema: fullSchema,
      mode: "default",
    });
  }

  return instance;
}
