import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

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

    instance = drizzle(pool, {
      schema: fullSchema,
    });
  }

  return instance;
}
