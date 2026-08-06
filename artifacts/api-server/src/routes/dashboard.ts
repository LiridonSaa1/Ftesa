import { Router, type IRouter } from "express";
import { eq, and, count, sum, desc, inArray } from "drizzle-orm";
import { db, eventsTable, guestsTable, eventTablesTable, usersTable } from "@workspace/db";
import { requireAuth, ensureUser, PLAN_LIMITS } from "../lib/auth";

const router: IRouter = Router();

/** Per-event stats (for EventWorkspace overview tab) */
router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(req.query.eventId as string, 10);
  if (!eventId) { res.status(400).json({ error: "eventId required" }); return; }

  const [event] = await db.select().from(eventsTable)
    .where(and(eq(eventsTable.id, eventId), eq(eventsTable.userId, userId))).limit(1);
  if (!event) { res.status(404).json({ error: "Event not found" }); return; }

  const guests = await db.select().from(guestsTable).where(eq(guestsTable.eventId, eventId));
  const tables = await db.select().from(eventTablesTable).where(eq(eventTablesTable.eventId, eventId));

  const total      = guests.length;
  const invited    = guests.filter(g => ["invited","confirmed","declined","checked_in"].includes(g.status)).length;
  const confirmed  = guests.filter(g => g.status === "confirmed" || g.status === "checked_in").length;
  const declined   = guests.filter(g => g.status === "declined").length;
  const pending    = guests.filter(g => g.status === "pending").length;
  const checkedIn  = guests.filter(g => g.status === "checked_in").length;
  const seated     = guests.filter(g => g.tableId !== null).length;
  const totalCapacity = tables.reduce((s, t) => s + t.capacity, 0);

  res.json({
    totalGuests: total,
    invitationsSent: invited,
    confirmed,
    declined,
    pending,
    checkedIn,
    totalTables: tables.length,
    totalCapacity,
    seatedGuests: seated,
    unseatedConfirmed: Math.max(0, confirmed - seated),
  });
});

/** Global dashboard overview (across all user events) */
router.get("/dashboard/overview", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;

  // User info for subscription
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  // All events
  const events = await db.select().from(eventsTable)
    .where(eq(eventsTable.userId, userId))
    .orderBy(desc(eventsTable.date));

  const eventIds = events.map(e => e.id);

  // Aggregate guest stats across ALL events
  let totalGuests = 0;
  let totalConfirmed = 0;
  let totalDeclined = 0;
  let totalPending = 0;
  let totalCheckedIn = 0;
  let totalTables = 0;

  if (eventIds.length > 0) {
    const allGuests = await db.select().from(guestsTable)
      .where(inArray(guestsTable.eventId, eventIds));
    totalGuests    = allGuests.length;
    totalConfirmed = allGuests.filter(g => g.status === "confirmed" || g.status === "checked_in").length;
    totalDeclined  = allGuests.filter(g => g.status === "declined").length;
    totalPending   = allGuests.filter(g => g.status === "pending").length;
    totalCheckedIn = allGuests.filter(g => g.status === "checked_in").length;

    const allTables = await db.select().from(eventTablesTable)
      .where(inArray(eventTablesTable.eventId, eventIds));
    totalTables = allTables.length;
  }

  // Upcoming events (future dates)
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.date >= today).slice(0, 5);

  const plan = user?.subscriptionPlan ?? "basic";
  const eventLimit = PLAN_LIMITS[plan];

  res.json({
    totalEvents: events.length,
    totalGuests,
    totalConfirmed,
    totalDeclined,
    totalPending,
    totalCheckedIn,
    totalTables,
    subscription: {
      plan,
      eventLimit,
      currentEventCount: events.length,
    },
    upcomingEvents: upcoming.map(e => ({
      id: e.id,
      userId: e.userId,
      name: e.name,
      date: e.date,
      time: e.time,
      venue: e.venue,
      address: e.address,
      description: e.description,
      dressCode: e.dressCode,
      phoneContact: e.phoneContact,
      status: e.status,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
    recentActivity: [],
  });
});

export default router;
