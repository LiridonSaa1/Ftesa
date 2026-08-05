import { Router, type IRouter } from "express";
import { eq, and, count, desc } from "drizzle-orm";
import { db, eventsTable, guestsTable, eventTablesTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(req.query.eventId as string, 10);
  if (!eventId) {
    res.status(400).json({ error: "eventId required" });
    return;
  }
  // Verify ownership
  const [event] = await db.select().from(eventsTable)
    .where(and(eq(eventsTable.id, eventId), eq(eventsTable.userId, userId))).limit(1);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const guests = await db.select().from(guestsTable).where(eq(guestsTable.eventId, eventId));
  const tables = await db.select().from(eventTablesTable).where(eq(eventTablesTable.eventId, eventId));
  const total = guests.length;
  const invited = guests.filter(g => ["invited", "confirmed", "declined", "checked_in"].includes(g.status)).length;
  const confirmed = guests.filter(g => g.status === "confirmed" || g.status === "checked_in").length;
  const declined = guests.filter(g => g.status === "declined").length;
  const pending = guests.filter(g => g.status === "pending").length;
  const checkedIn = guests.filter(g => g.status === "checked_in").length;
  const seated = guests.filter(g => g.tableId !== null).length;
  const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const unseated = confirmed - seated > 0 ? confirmed - seated : 0;
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
    unseatedConfirmed: unseated,
  });
});

router.get("/dashboard/overview", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const events = await db.select().from(eventsTable)
    .where(eq(eventsTable.userId, userId))
    .orderBy(eventsTable.date)
    .limit(5);
  const allGuests = await db.select().from(guestsTable)
    .where(eq(guestsTable.eventId, events[0]?.id ?? 0));
  const [{ value: totalGuests }] = await db.select({ value: count() }).from(guestsTable)
    .where(eq(guestsTable.eventId, events[0]?.id ?? 0));

  res.json({
    totalEvents: events.length,
    totalGuests: Number(totalGuests),
    upcomingEvents: events.map(e => ({
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
