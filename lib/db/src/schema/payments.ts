import { pgTable, text, timestamp, pgEnum, uuid, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { subscriptionsTable } from "./subscriptions";

export const paymentStatusEnum = pgEnum("payment_status", [
  "completed",
  "failed",
  "refunded",
]);

export const paymentsTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  subscriptionId: uuid("subscription_id").references(
    () => subscriptionsTable.id,
    { onDelete: "set null" }
  ),
  paddleTransactionId: text("paddle_transaction_id").notNull().unique(),
  amount: integer("amount").notNull(), // in cents (e.g. 1000 = €10.00)
  currency: text("currency").notNull().default("EUR"),
  status: paymentStatusEnum("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Payment = typeof paymentsTable.$inferSelect;
