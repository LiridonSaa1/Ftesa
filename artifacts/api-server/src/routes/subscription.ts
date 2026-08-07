import { Router, type IRouter } from "express";
import { eq, count, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, usersTable, eventsTable, paymentsTable, subscriptionsTable } from "@workspace/db";
import { requireAuth, ensureUser, PLAN_LIMITS } from "../lib/auth";

const router: IRouter = Router();

const PLAN_FEATURES: Record<string, string[]> = {
  basic: ["1 event", "All basic features", "Guest management", "Digital invitations"],
  pro: ["Up to 11 events", "All platform features", "Hall designer", "QR check-in", "CSV import", "PDF export"],
  custom: ["Unlimited events", "Multi-user", "White label (optional)", "Priority support", "Custom price"],
};
const PLAN_PRICES: Record<string, number | null> = { basic: 10, pro: 50, custom: null };

router.get("/subscription", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const [{ value: eventCount }] = await db
    .select({ value: count() })
    .from(eventsTable)
    .where(eq(eventsTable.userId, userId));

  res.json({
    plan: user.subscriptionPlan,
    eventLimit: PLAN_LIMITS[user.subscriptionPlan],
    currentEventCount: Number(eventCount),
    price: PLAN_PRICES[user.subscriptionPlan],
    features: PLAN_FEATURES[user.subscriptionPlan],
  });
});

router.patch("/subscription", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const { plan } = req.body;
  if (!["basic", "pro", "custom"].includes(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }
  await db.update(usersTable).set({ subscriptionPlan: plan }).where(eq(usersTable.id, userId));
  const [{ value: eventCount }] = await db
    .select({ value: count() })
    .from(eventsTable)
    .where(eq(eventsTable.userId, userId));
  res.json({
    plan,
    eventLimit: PLAN_LIMITS[plan],
    currentEventCount: Number(eventCount),
    price: PLAN_PRICES[plan],
    features: PLAN_FEATURES[plan],
  });
});

// Payment history for current user
router.get("/subscription/payments", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const rows = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, userId))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(20);
  res.json(rows.map(p => ({
    id: p.id,
    amount: p.amount,
    amountFormatted: `€${(p.amount / 100).toFixed(2)}`,
    currency: p.currency,
    status: p.status,
    paddleTransactionId: p.paddleTransactionId,
    createdAt: p.createdAt.toISOString(),
  })));
});

// Cancel subscription (marks subscription canceled + user back to basic)
router.post("/subscription/cancel", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  await db.update(subscriptionsTable)
    .set({ status: "canceled" })
    .where(eq(subscriptionsTable.userId, userId));
  await db.update(usersTable)
    .set({ subscriptionPlan: "basic" })
    .where(eq(usersTable.id, userId));
  res.json({ canceled: true, plan: "basic" });
});

// Activate subscription + create records in users, subscriptions, payments tables
router.post("/subscription/activate", async (req, res): Promise<void> => {
  try {
    const { plan = "pro", userId: bodyUserId, email, paddleCustomerId, paddleSubscriptionId, paddleTransactionId, amount } = req.body;
    
    // Resolve user ID
    let targetUserId = bodyUserId || (req as any).userId;
    if (!targetUserId && email) {
      const [u] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (u) targetUserId = u.id;
    }
    
    if (!targetUserId) {
      res.status(400).json({ error: "User ID or Email required for activation" });
      return;
    }

    const validPlan = ["basic", "pro", "custom"].includes(plan) ? plan : "pro";
    const planAmount = amount || (validPlan === "basic" ? 1000 : validPlan === "pro" ? 5000 : 0);

    // 1. Update `users` table -> status = 'active'
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        status: "active",
        subscriptionPlan: validPlan,
      })
      .where(eq(usersTable.id, targetUserId))
      .returning();

    // 2. Insert/Update `subscriptions` table
    const custId = paddleCustomerId || `cus_test_${randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const subId = paddleSubscriptionId || `sub_test_${randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const existingSubs = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, targetUserId)).limit(1);
    let subscriptionRecord;

    if (existingSubs.length > 0) {
      const [sub] = await db
        .update(subscriptionsTable)
        .set({
          plan: validPlan,
          paddleCustomerId: custId,
          paddleSubscriptionId: subId,
          status: "active",
          startDate: new Date(),
          nextBillingDate: nextBilling,
        })
        .where(eq(subscriptionsTable.userId, targetUserId))
        .returning();
      subscriptionRecord = sub;
    } else {
      const [sub] = await db
        .insert(subscriptionsTable)
        .values({
          userId: targetUserId,
          plan: validPlan,
          paddleCustomerId: custId,
          paddleSubscriptionId: subId,
          status: "active",
          startDate: new Date(),
          nextBillingDate: nextBilling,
        })
        .returning();
      subscriptionRecord = sub;
    }

    // 3. Insert `payments` table
    const txnId = paddleTransactionId || `txn_test_${randomUUID().replace(/-/g, "").slice(0, 10)}`;
    const [paymentRecord] = await db
      .insert(paymentsTable)
      .values({
        userId: targetUserId,
        subscriptionId: subscriptionRecord?.id || null,
        paddleTransactionId: txnId,
        amount: planAmount,
        currency: "EUR",
        status: "completed",
      })
      .onConflictDoNothing()
      .returning();

    res.json({
      activated: true,
      user: updatedUser,
      subscription: subscriptionRecord,
      payment: paymentRecord,
    });
  } catch (err: any) {
    console.error("[activate error]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
