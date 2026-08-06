import { Router, type IRouter } from "express";
import { eq, count, desc, sum, gte, and } from "drizzle-orm";
import { db, usersTable, eventsTable, guestsTable, subscriptionsTable, paymentsTable } from "@workspace/db";
import { requireAuth, ensureUser, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/stats", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const [{ value: totalUsers }] = await db.select({ value: count() }).from(usersTable);
  const [{ value: activeUsers }] = await db.select({ value: count() }).from(usersTable).where(eq(usersTable.status, "active"));
  const [{ value: totalEvents }] = await db.select({ value: count() }).from(eventsTable);
  const [{ value: totalGuests }] = await db.select({ value: count() }).from(guestsTable);
  const [{ value: activeSubscriptions }] = await db.select({ value: count() }).from(subscriptionsTable).where(eq(subscriptionsTable.status, "active"));
  const [{ value: totalRevenue }] = await db.select({ value: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.status, "completed"));

  // Monthly revenue: payments created this calendar month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [{ value: monthlyRevenue }] = await db.select({ value: sum(paymentsTable.amount) }).from(paymentsTable)
    .where(and(eq(paymentsTable.status, "completed"), gte(paymentsTable.createdAt, startOfMonth)));

  const users = await db.select({ plan: usersTable.subscriptionPlan }).from(usersTable);
  const byPlan = { basic: 0, pro: 0, custom: 0 };
  users.forEach(u => { if (u.plan in byPlan) byPlan[u.plan as keyof typeof byPlan]++; });

  // Recent payments (last 5)
  const recentPayments = await db
    .select({ id: paymentsTable.id, amount: paymentsTable.amount, currency: paymentsTable.currency, status: paymentsTable.status, createdAt: paymentsTable.createdAt, userEmail: usersTable.email })
    .from(paymentsTable).leftJoin(usersTable, eq(paymentsTable.userId, usersTable.id))
    .orderBy(desc(paymentsTable.createdAt)).limit(5);

  res.json({
    totalUsers: Number(totalUsers),
    activeUsers: Number(activeUsers),
    totalEvents: Number(totalEvents),
    totalGuests: Number(totalGuests),
    activeSubscriptions: Number(activeSubscriptions),
    totalRevenue: Number(totalRevenue ?? 0),
    monthlyRevenue: Number(monthlyRevenue ?? 0),
    usersByPlan: byPlan,
    revenueEstimate: byPlan.basic * 10 + byPlan.pro * 50,
    recentPayments: recentPayments.map(p => ({ ...p, amountFormatted: `€${(p.amount / 100).toFixed(2)}`, createdAt: p.createdAt.toISOString() })),
  });
});

router.get("/admin/users", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const offset = (page - 1) * limit;
  const [{ value: total }] = await db.select({ value: count() }).from(usersTable);
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);
  const result = await Promise.all(users.map(async u => {
    const [{ value: eventCount }] = await db.select({ value: count() }).from(eventsTable).where(eq(eventsTable.userId, u.id));
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      status: u.status,
      subscriptionPlan: u.subscriptionPlan,
      eventCount: Number(eventCount),
      createdAt: u.createdAt.toISOString(),
    };
  }));
  res.json({ users: result, total: Number(total), page, limit });
});

// Activate / deactivate user
router.patch("/admin/users/:userId/status", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const { status } = req.body;
  if (!["active", "pending_payment"].includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }
  const [user] = await db.update(usersTable).set({ status }).where(eq(usersTable.id, userId)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ id: user.id, status: user.status });
});

// Delete user
router.delete("/admin/users/:userId", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const deleted = await db.delete(usersTable).where(eq(usersTable.id, userId)).returning();
  if (!deleted.length) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ deleted: true });
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

// ── Admin: all events ─────────────────────────────────────────────────────────

router.get("/admin/events", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const page  = parseInt((req.query.page  as string) ?? "1",  10);
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const offset = (page - 1) * limit;
  const [{ value: total }] = await db.select({ value: count() }).from(eventsTable);
  const rows = await db
    .select({
      id: eventsTable.id, name: eventsTable.name, date: eventsTable.date,
      venue: eventsTable.venue, status: eventsTable.status, createdAt: eventsTable.createdAt,
      userId: eventsTable.userId, userEmail: usersTable.email,
      userFirstName: usersTable.firstName, userLastName: usersTable.lastName,
    })
    .from(eventsTable)
    .leftJoin(usersTable, eq(eventsTable.userId, usersTable.id))
    .orderBy(desc(eventsTable.createdAt))
    .limit(limit).offset(offset);
  const withGuests = await Promise.all(rows.map(async r => {
    const [{ value: guestCount }] = await db.select({ value: count() }).from(guestsTable).where(eq(guestsTable.eventId, r.id));
    return { ...r, date: r.date?.toISOString() ?? null, createdAt: r.createdAt?.toISOString() ?? null, guestCount: Number(guestCount) };
  }));
  res.json({ events: withGuests, total: Number(total), page, limit });
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

