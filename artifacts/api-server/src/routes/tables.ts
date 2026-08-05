import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, eventsTable, eventTablesTable, guestsTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

async function checkEventOwnership(eventId: number, userId: string): Promise<boolean> {
  const [event] = await db.select().from(eventsTable)
    .where(and(eq(eventsTable.id, eventId), eq(eventsTable.userId, userId))).limit(1);
  return !!event;
}

router.get("/events/:eventId/tables", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const tables = await db.select().from(eventTablesTable).where(eq(eventTablesTable.eventId, eventId));
  const guests = await db.select().from(guestsTable).where(eq(guestsTable.eventId, eventId));
  res.json(tables.map(t => serializeTable(t, guests)));
});

router.post("/events/:eventId/tables", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { name, shape, capacity, positionX, positionY, rotation, width, height } = req.body;
  const [table] = await db.insert(eventTablesTable).values({
    eventId,
    name,
    shape: shape ?? "round",
    capacity: capacity ?? 8,
    positionX,
    positionY,
    rotation: rotation ?? 0,
    width,
    height,
  }).returning();
  const guests = await db.select().from(guestsTable).where(eq(guestsTable.eventId, eventId));
  res.status(201).json(serializeTable(table, guests));
});

router.patch("/events/:eventId/tables/:tableId", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  const tableId = parseInt(Array.isArray(req.params.tableId) ? req.params.tableId[0] : req.params.tableId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { name, shape, capacity, positionX, positionY, rotation, width, height } = req.body;
  const [table] = await db.update(eventTablesTable)
    .set({ name, shape, capacity, positionX, positionY, rotation, width, height })
    .where(and(eq(eventTablesTable.id, tableId), eq(eventTablesTable.eventId, eventId)))
    .returning();
  if (!table) {
    res.status(404).json({ error: "Table not found" });
    return;
  }
  const guests = await db.select().from(guestsTable).where(eq(guestsTable.eventId, eventId));
  res.json(serializeTable(table, guests));
});

router.delete("/events/:eventId/tables/:tableId", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  const tableId = parseInt(Array.isArray(req.params.tableId) ? req.params.tableId[0] : req.params.tableId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  await db.delete(eventTablesTable).where(and(eq(eventTablesTable.id, tableId), eq(eventTablesTable.eventId, eventId)));
  res.sendStatus(204);
});

function serializeTable(t: typeof eventTablesTable.$inferSelect, allGuests: typeof guestsTable.$inferSelect[]) {
  const seated = allGuests.filter(g => g.tableId === t.id).length;
  const status = seated === 0 ? "empty" : seated >= t.capacity ? "full" : "partial";
  return {
    id: t.id,
    eventId: t.eventId,
    name: t.name,
    shape: t.shape,
    capacity: t.capacity,
    currentCount: seated,
    status,
    positionX: t.positionX,
    positionY: t.positionY,
    rotation: t.rotation,
    width: t.width,
    height: t.height,
  };
}

export default router;
