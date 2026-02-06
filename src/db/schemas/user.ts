import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: text().primaryKey(),
  username: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
});
