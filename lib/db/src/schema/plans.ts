import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const plansTable = pgTable("plans", {
  id: text("id").primaryKey(), // "basic", "pro", "custom"
  name: text("name").notNull(),
  price: integer("price").notNull(), // in cents, e.g. 1000 = €10
  eventLimit: integer("event_limit").notNull().default(1),
  paddlePriceId: text("paddle_price_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Plan = typeof plansTable.$inferSelect;
