import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, usersTable, eventsTable } from "@workspace/db";
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

export default router;
