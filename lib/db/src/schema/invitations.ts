import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";

export const invitationTemplateEnum = pgEnum("invitation_template", [
  "classic",
  "modern",
  "floral",
  "minimalist",
  "luxury",
]);

export const invitationsTable = pgTable("invitations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .unique()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  template: invitationTemplateEnum("template").notNull().default("classic"),
  couplePhoto: text("couple_photo"),
  coupleName: text("couple_name").notNull(),
  message: text("message"),
  musicUrl: text("music_url"),
  showCountdown: boolean("show_countdown").notNull().default(true),
  showMap: boolean("show_map").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertInvitationSchema = createInsertSchema(invitationsTable).omit(
  { id: true, createdAt: true },
);
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitationsTable.$inferSelect;
