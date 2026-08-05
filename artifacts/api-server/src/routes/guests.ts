import { Router, type IRouter } from "express";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, eventsTable, guestsTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

async function checkEventOwnership(eventId: number, userId: string): Promise<boolean> {
  const [event] = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.id, eventId), eq(eventsTable.userId, userId)))
    .limit(1);
  return !!event;
}

router.get("/events/:eventId/guests", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { status, category, search } = req.query;
  const conditions: any[] = [eq(guestsTable.eventId, eventId)];
  if (status) conditions.push(eq(guestsTable.status, status as any));
  if (category) conditions.push(eq(guestsTable.category, category as any));
  const guests = await db.select().from(guestsTable).where(and(...conditions)).orderBy(guestsTable.lastName);
  const filtered = search
    ? guests.filter(g =>
        `${g.firstName} ${g.lastName}`.toLowerCase().includes((search as string).toLowerCase()))
    : guests;
  res.json(filtered.map(serializeGuest));
});

router.post("/events/:eventId/guests", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { firstName, lastName, phone, email, partySize, category, notes } = req.body;
  if (!firstName || !lastName) {
    res.status(400).json({ error: "firstName and lastName are required" });
    return;
  }
  const [guest] = await db.insert(guestsTable).values({
    eventId,
    firstName,
    lastName,
    phone,
    email,
    partySize: partySize ?? 1,
    category: category ?? "other",
    status: "pending",
    rsvpToken: randomUUID(),
    notes,
  }).returning();
  res.status(201).json(serializeGuest(guest));
});

router.post("/events/:eventId/guests/import", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { guests } = req.body;
  if (!Array.isArray(guests)) {
    res.status(400).json({ error: "guests array required" });
    return;
  }
  let imported = 0;
  const errors: string[] = [];
  for (const g of guests) {
    try {
      if (!g.firstName || !g.lastName) {
        errors.push(`Skipped: missing name for entry`);
        continue;
      }
      await db.insert(guestsTable).values({
        eventId,
        firstName: g.firstName,
        lastName: g.lastName,
        phone: g.phone,
        email: g.email,
        partySize: g.partySize ?? 1,
        category: g.category ?? "other",
        status: "pending",
        rsvpToken: randomUUID(),
        notes: g.notes,
      });
      imported++;
    } catch (err: any) {
      errors.push(`Failed to import ${g.firstName} ${g.lastName}: ${err.message}`);
    }
  }
  res.status(201).json({ imported, failed: errors.length, errors });
});

router.get("/events/:eventId/guests/lookup", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const name = (req.query.name as string) || "";
  const guests = await db.select().from(guestsTable).where(eq(guestsTable.eventId, eventId));
  const matched = guests.filter(g =>
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(name.toLowerCase())
  );
  res.json(matched.map(g => ({
    guestId: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    tableName: null, // would need join
    tableId: g.tableId,
    seatNumber: g.seatNumber,
    status: g.status,
  })));
});

router.get("/events/:eventId/guests/:guestId", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  const guestId = parseInt(Array.isArray(req.params.guestId) ? req.params.guestId[0] : req.params.guestId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const [guest] = await db.select().from(guestsTable)
    .where(and(eq(guestsTable.id, guestId), eq(guestsTable.eventId, eventId))).limit(1);
  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }
  res.json(serializeGuest(guest));
});

router.patch("/events/:eventId/guests/:guestId", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  const guestId = parseInt(Array.isArray(req.params.guestId) ? req.params.guestId[0] : req.params.guestId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { firstName, lastName, phone, email, partySize, category, status, notes } = req.body;
  const [guest] = await db.update(guestsTable)
    .set({ firstName, lastName, phone, email, partySize, category, status, notes })
    .where(and(eq(guestsTable.id, guestId), eq(guestsTable.eventId, eventId)))
    .returning();
  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }
  res.json(serializeGuest(guest));
});

router.delete("/events/:eventId/guests/:guestId", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  const guestId = parseInt(Array.isArray(req.params.guestId) ? req.params.guestId[0] : req.params.guestId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  await db.delete(guestsTable).where(and(eq(guestsTable.id, guestId), eq(guestsTable.eventId, eventId)));
  res.sendStatus(204);
});

function serializeGuest(g: typeof guestsTable.$inferSelect) {
  return {
    id: g.id,
    eventId: g.eventId,
    firstName: g.firstName,
    lastName: g.lastName,
    phone: g.phone,
    email: g.email,
    partySize: g.partySize,
    category: g.category,
    status: g.status,
    tableId: g.tableId,
    seatNumber: g.seatNumber,
    rsvpToken: g.rsvpToken,
    notes: g.notes,
    createdAt: g.createdAt.toISOString(),
  };
}

export default router;
