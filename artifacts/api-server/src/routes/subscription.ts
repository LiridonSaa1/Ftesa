import { Router, type IRouter } from "express";
import { eq, count, desc } from "drizzle-orm";
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
  res.json({ canceled: true });
});

export default router;

