import {
  pgTable,
  text,
  serial,
  timestamp,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "active",
  "completed",
  "cancelled",
]);

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  time: text("time"),
  venue: text("venue"),
  address: text("address"),
  description: text("description"),
  dressCode: text("dress_code"),
  phoneContact: text("phone_contact"),
  status: eventStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
