import {
  pgTable,
  serial,
  integer,
  real,
  json,
  timestamp,
} from "drizzle-orm/pg-core";
import { eventsTable } from "./events";

export interface HallElementData {
  id: string;
  type:
    | "table"
    | "stage"
    | "dance_floor"
    | "dj"
    | "band"
    | "buffet"
    | "emergency_exit"
    | "entrance";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label?: string | null;
  tableId?: number | null;
  shape?: string | null;
}

export const hallLayoutsTable = pgTable("hall_layouts", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .unique()
    .references(() => eventsTable.id, { onDelete: "cascade" }),
  width: real("width").notNull().default(800),
  height: real("height").notNull().default(600),
  elements: json("elements").$type<HallElementData[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type HallLayout = typeof hallLayoutsTable.$inferSelect;
