import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";

export const guestCategoryEnum = pgEnum("guest_category", [
  "family",
  "friends",
  "colleagues",
  "other",
]);

export const guestStatusEnum = pgEnum("guest_status", [
  "pending",
  "invited",
  "confirmed",
  "declined",
  "checked_in",
]);

export const guestsTable = pgTable("guests", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  partySize: integer("party_size").notNull().default(1),
  category: guestCategoryEnum("category").notNull().default("other"),
  status: guestStatusEnum("status").notNull().default("pending"),
  tableId: integer("table_id"), // assigned table
  seatNumber: integer("seat_number"),
  rsvpToken: text("rsvp_token").notNull().unique(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertGuestSchema = createInsertSchema(guestsTable).omit({
  id: true,
  tableId: true,
  seatNumber: true,
  rsvpToken: true,
  createdAt: true,
});
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Guest = typeof guestsTable.$inferSelect;
