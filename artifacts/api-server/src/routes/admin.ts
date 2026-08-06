import { Router, type IRouter } from "express";
import { eq, count, desc, sum } from "drizzle-orm";
import { db, usersTable, eventsTable, guestsTable, subscriptionsTable, paymentsTable } from "@workspace/db";
import { requireAuth, ensureUser, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/stats", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const [{ value: totalUsers }] = await db.select({ value: count() }).from(usersTable);
  const [{ value: totalEvents }] = await db.select({ value: count() }).from(eventsTable);
  const [{ value: totalGuests }] = await db.select({ value: count() }).from(guestsTable);
  const users = await db.select().from(usersTable);
  const byPlan = { basic: 0, pro: 0, custom: 0 };
  users.forEach(u => {
    if (u.subscriptionPlan in byPlan) byPlan[u.subscriptionPlan as keyof typeof byPlan]++;
  });
  const revenue = byPlan.basic * 10 + byPlan.pro * 50;
  res.json({
    totalUsers: Number(totalUsers),
    totalEvents: Number(totalEvents),
    totalGuests: Number(totalGuests),
    usersByPlan: byPlan,
    revenueEstimate: revenue,
  });
});

router.get("/admin/users", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const offset = (page - 1) * limit;
  const [{ value: total }] = await db.select({ value: count() }).from(usersTable);
  const users = await db.select().from(usersTable).limit(limit).offset(offset);
  const result = await Promise.all(users.map(async u => {
    const [{ value: eventCount }] = await db.select({ value: count() }).from(eventsTable).where(eq(eventsTable.userId, u.id));
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      subscriptionPlan: u.subscriptionPlan,
      eventCount: Number(eventCount),
      createdAt: u.createdAt.toISOString(),
    };
  }));
  res.json({ users: result, total: Number(total), page, limit });
});

router.patch("/admin/users/:userId/subscription", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const { plan } = req.body;
  if (!["basic", "pro", "custom"].includes(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }
  const [user] = await db.update(usersTable).set({ subscriptionPlan: plan })
    .where(eq(usersTable.id, userId)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const [{ value: eventCount }] = await db.select({ value: count() }).from(eventsTable).where(eq(eventsTable.userId, userId));
  res.json({
    plan: user.subscriptionPlan,
    eventLimit: plan === "basic" ? 1 : plan === "pro" ? 11 : null,
    currentEventCount: Number(eventCount),
    price: plan === "basic" ? 10 : plan === "pro" ? 50 : null,
    features: [],
  });
});

// ── Admin: subscriptions ──────────────────────────────────────────────────────

router.get("/admin/subscriptions", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const page  = parseInt((req.query.page  as string) ?? "1",  10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const offset = (page - 1) * limit;

  const [{ value: total }] = await db.select({ value: count() }).from(subscriptionsTable);

  const rows = await db
    .select({
      id:                   subscriptionsTable.id,
      userId:               subscriptionsTable.userId,
      plan:                 subscriptionsTable.plan,
      status:               subscriptionsTable.status,
      paddleCustomerId:     subscriptionsTable.paddleCustomerId,
      paddleSubscriptionId: subscriptionsTable.paddleSubscriptionId,
      startDate:            subscriptionsTable.startDate,
      nextBillingDate:      subscriptionsTable.nextBillingDate,
      createdAt:            subscriptionsTable.createdAt,
      userEmail:            usersTable.email,
      userFirstName:        usersTable.firstName,
      userLastName:         usersTable.lastName,
    })
    .from(subscriptionsTable)
    .leftJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
    .orderBy(desc(subscriptionsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    subscriptions: rows.map(r => ({
      ...r,
      startDate:      r.startDate?.toISOString()      ?? null,
      nextBillingDate: r.nextBillingDate?.toISOString() ?? null,
      createdAt:      r.createdAt.toISOString(),
    })),
    total: Number(total),
    page,
    limit,
  });
});

// ── Admin: payments ───────────────────────────────────────────────────────────

router.get("/admin/payments", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const page   = parseInt((req.query.page   as string) ?? "1",  10);
  const limit  = parseInt((req.query.limit  as string) ?? "20", 10);
  const offset = (page - 1) * limit;

  const [{ value: total }] = await db.select({ value: count() }).from(paymentsTable);
  const [{ value: totalRevenue }] = await db
    .select({ value: sum(paymentsTable.amount) })
    .from(paymentsTable)
    .where(eq(paymentsTable.status, "completed"));

  const rows = await db
    .select({
      id:                   paymentsTable.id,
      userId:               paymentsTable.userId,
      subscriptionId:       paymentsTable.subscriptionId,
      paddleTransactionId:  paymentsTable.paddleTransactionId,
      amount:               paymentsTable.amount,
      currency:             paymentsTable.currency,
      status:               paymentsTable.status,
      createdAt:            paymentsTable.createdAt,
      userEmail:            usersTable.email,
      userFirstName:        usersTable.firstName,
      userLastName:         usersTable.lastName,
    })
    .from(paymentsTable)
    .leftJoin(usersTable, eq(paymentsTable.userId, usersTable.id))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    payments: rows.map(r => ({
      ...r,
      amountFormatted: `€${(r.amount / 100).toFixed(2)}`,
      createdAt: r.createdAt.toISOString(),
    })),
    total: Number(total),
    totalRevenue: Number(totalRevenue ?? 0), // in cents
    page,
    limit,
  });
});

export default router;

