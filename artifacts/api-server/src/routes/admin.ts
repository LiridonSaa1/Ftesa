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
    return { ...r, date: r.date ?? null, createdAt: r.createdAt?.toISOString() ?? null, guestCount: Number(guestCount) };
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

// ── Admin: In-memory store for Templates, Custom Requests, Categories, Settings, Notifications ──

interface CustomRequest {
  id: string;
  userName: string;
  userEmail: string;
  phone: string;
  eventCount: string;
  guestEstimate: string;
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface TemplateItem {
  id: string;
  name: string;
  code: string;
  description: string;
  enabled: boolean;
  category: string;
}

interface CategoryItem {
  id: string;
  type: "event" | "guest";
  name: string;
  code: string;
}

interface PlatformSettingsData {
  platformName: string;
  logoUrl: string;
  paddleEnvironment: string;
  paddleClientToken: string;
  googleMapsApiKey: string;
  emailSmtpHost: string;
  emailSmtpPort: string;
  emailFrom: string;
  whatsappEnabled: boolean;
  whatsappSenderNumber: string;
}

let mockCustomRequests: CustomRequest[] = [
  {
    id: "cr-1",
    userName: "Agon Krasniqi",
    userEmail: "agon@example.com",
    phone: "+383 49 123 456",
    eventCount: "15-20 / vit",
    guestEstimate: "500+",
    notes: "Kërkojmë White Label dhe mbështetje prioritare për agjencinë tonë të eventeve.",
    status: "pending",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "cr-2",
    userName: "Majlinda Kelmendi",
    userEmail: "majlinda@example.com",
    phone: "+383 44 987 654",
    eventCount: "5 / vit",
    guestEstimate: "300",
    notes: "Nevoitet integrim me WhatsApp API për dërgim të automatizuar.",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

let mockTemplates: TemplateItem[] = [
  { id: "t-1", name: "Klasike Elegant", code: "classic", description: "Dizajn tradicional dhe elegant me tone ari", enabled: true, category: "Dasmë" },
  { id: "t-2", name: "Moderne Minimale", code: "modern", description: "Stil modern me tipografi me vija të pastra", enabled: true, category: "Gjeneral" },
  { id: "t-3", name: "Florale Romantike", code: "floral", description: "Ornamete me lule dhe ngjyra të ngrohta", enabled: true, category: "Dasmë" },
  { id: "t-4", name: "Minimale Dark", code: "minimal", description: "Pamje luksoze me prapavijë të errët", enabled: true, category: "Fejesë" },
  { id: "t-5", name: "Luks Mbretëror", code: "luxury", description: "Elemente luksoze me detaje metalike", enabled: false, category: "VIP" },
];

let mockCategories: CategoryItem[] = [
  { id: "c-1", type: "event", name: "Dasmë", code: "wedding" },
  { id: "c-2", type: "event", name: "Ditëlindje", code: "birthday" },
  { id: "c-3", type: "event", name: "Fejesë", code: "engagement" },
  { id: "c-4", type: "event", name: "Konferencë", code: "conference" },
  { id: "c-5", type: "guest", name: "Familje", code: "family" },
  { id: "c-6", type: "guest", name: "Shoqëri", code: "friends" },
  { id: "c-7", type: "guest", name: "Kolegë", code: "colleagues" },
  { id: "c-8", type: "guest", name: "Tjetër", code: "other" },
];

let mockSettings: PlatformSettingsData = {
  platformName: "NoaEvent",
  logoUrl: "/assets/logo.png",
  paddleEnvironment: "sandbox",
  paddleClientToken: "test_client_token_sample",
  googleMapsApiKey: "AIzaSy_Sample_Google_Maps_Key",
  emailSmtpHost: "smtp.mailtrap.io",
  emailSmtpPort: "587",
  emailFrom: "info@noaevent.com",
  whatsappEnabled: true,
  whatsappSenderNumber: "+38349000111",
};

// ── Custom requests ──
router.get("/admin/custom-requests", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  res.json(mockCustomRequests);
});

router.patch("/admin/custom-requests/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { status } = req.body;
  const item = mockCustomRequests.find(r => r.id === id);
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  item.status = status;
  res.json(item);
});

// ── Templates ──
router.get("/admin/templates", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  res.json(mockTemplates);
});

router.post("/admin/templates", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { name, code, description, category } = req.body;
  const newT: TemplateItem = {
    id: `t-${Date.now()}`,
    name: name || "Template i ri",
    code: code || "custom_template",
    description: description || "",
    enabled: true,
    category: category || "Gjeneral",
  };
  mockTemplates.push(newT);
  res.status(201).json(newT);
});

router.patch("/admin/templates/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const item = mockTemplates.find(t => t.id === id);
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  if (typeof req.body.enabled === "boolean") item.enabled = req.body.enabled;
  if (req.body.name) item.name = req.body.name;
  if (req.body.description) item.description = req.body.description;
  res.json(item);
});

router.delete("/admin/templates/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  mockTemplates = mockTemplates.filter(t => t.id !== id);
  res.json({ success: true });
});

// ── Categories ──
router.get("/admin/categories", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  res.json(mockCategories);
});

router.post("/admin/categories", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { type, name, code } = req.body;
  const newC: CategoryItem = {
    id: `c-${Date.now()}`,
    type: type || "event",
    name: name || "Kategori e re",
    code: code || `code_${Date.now()}`,
  };
  mockCategories.push(newC);
  res.status(201).json(newC);
});

router.delete("/admin/categories/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  mockCategories = mockCategories.filter(c => c.id !== id);
  res.json({ success: true });
});

// ── Notifications ──
router.post("/admin/notifications/send", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { subject, message, targetRole } = req.body;
  res.json({ success: true, sentCount: 15, subject, targetRole });
});

// ── Platform Settings ──
router.get("/admin/settings", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  res.json(mockSettings);
});

router.patch("/admin/settings", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  mockSettings = { ...mockSettings, ...req.body };
  res.json(mockSettings);
});

export default router;


