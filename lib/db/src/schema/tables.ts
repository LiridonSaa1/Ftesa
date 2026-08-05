import {
  pgTable,
  text,
  serial,
  integer,
  real,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { eventsTable } from "./events";

export const tableShapeEnum = pgEnum("table_shape", [
  "round",
  "square",
  "rectangle",
  "oval",
]);

export const eventTablesTable = pgTable("event_tables", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  shape: tableShapeEnum("shape").notNull().default("round"),
  capacity: integer("capacity").notNull().default(8),
  positionX: real("position_x"),
  positionY: real("position_y"),
  rotation: real("rotation").default(0),
  width: real("width"),
  height: real("height"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertTableSchema = createInsertSchema(eventTablesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTable = z.infer<typeof insertTableSchema>;
export type EventTable = typeof eventTablesTable.$inferSelect;
