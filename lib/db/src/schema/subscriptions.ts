import { pgTable, text, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { usersTable, subscriptionPlanEnum } from "./users";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "paused",
]);

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  plan: subscriptionPlanEnum("plan").notNull().default("basic"),
  paddleCustomerId: text("paddle_customer_id"),
  paddleSubscriptionId: text("paddle_subscription_id"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  startDate: timestamp("start_date", { withTimezone: true }),
  nextBillingDate: timestamp("next_billing_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
