import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, eventsTable, guestsTable, eventTablesTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

async function checkEventOwnership(eventId: number, userId: string): Promise<boolean> {
  const [event] = await db.select().from(eventsTable)
    .where(and(eq(eventsTable.id, eventId), eq(eventsTable.userId, userId))).limit(1);
  return !!event;
}

router.get("/events/:eventId/seats", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const guests = await db.select().from(guestsTable)
    .where(and(eq(guestsTable.eventId, eventId)));
  const seated = guests.filter(g => g.tableId !== null);
  const tables = await db.select().from(eventTablesTable).where(eq(eventTablesTable.eventId, eventId));
  const tableMap = new Map(tables.map(t => [t.id, t.name]));
  res.json(seated.map((g, i) => ({
    id: g.id,
    eventId,
    guestId: g.id,
    tableId: g.tableId,
    seatNumber: g.seatNumber,
    guestName: `${g.firstName} ${g.lastName}`,
    tableName: g.tableId ? (tableMap.get(g.tableId) ?? "Unknown") : null,
    guestStatus: g.status,
  })));
});

router.post("/events/:eventId/seats", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { guestId, tableId, seatNumber } = req.body;
  // Check capacity
  const [table] = await db.select().from(eventTablesTable)
    .where(and(eq(eventTablesTable.id, tableId), eq(eventTablesTable.eventId, eventId))).limit(1);
  if (!table) {
    res.status(404).json({ error: "Table not found" });
    return;
  }
  const seatedCount = await db.select({ value: count() }).from(guestsTable)
    .where(and(eq(guestsTable.tableId, tableId), eq(guestsTable.eventId, eventId)));
  if (Number(seatedCount[0].value) >= table.capacity) {
    res.status(409).json({ error: "Table is at full capacity" });
    return;
  }
  const [guest] = await db.update(guestsTable)
    .set({ tableId, seatNumber: seatNumber ?? null })
    .where(and(eq(guestsTable.id, guestId), eq(guestsTable.eventId, eventId)))
    .returning();
  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }
  res.status(201).json({
    id: guest.id,
    eventId,
    guestId: guest.id,
    tableId: guest.tableId,
    seatNumber: guest.seatNumber,
    guestName: `${guest.firstName} ${guest.lastName}`,
    tableName: table.name,
    guestStatus: guest.status,
  });
});

router.delete("/events/:eventId/seats/:seatId", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  const seatId = parseInt(Array.isArray(req.params.seatId) ? req.params.seatId[0] : req.params.seatId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  await db.update(guestsTable)
    .set({ tableId: null, seatNumber: null })
    .where(and(eq(guestsTable.id, seatId), eq(guestsTable.eventId, eventId)));
  res.sendStatus(204);
});

export default router;
