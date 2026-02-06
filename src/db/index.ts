import { env } from "../env";
import { drizzle } from "drizzle-orm/bun-sql";
import { SQL } from "bun";
import * as schema from "./schemas";

const client = new SQL(env.DATABASE_URL);

export const db = drizzle(client, {
  schema,
});
