// Single shared Drizzle client over postgres.js. Used by the Next.js app
// (server components) and the pipeline scripts. Cached on globalThis so dev
// hot-reload and serverless invocations don't open a new pool every time.

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and fill it in."
  );
}

const globalForDb = globalThis as unknown as {
  __ttSql?: ReturnType<typeof postgres>;
};

const sql =
  globalForDb.__ttSql ??
  postgres(url, { ssl: "require", prepare: false, max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ttSql = sql;
}

export const db = drizzle(sql, { schema });
export { schema, sql };
