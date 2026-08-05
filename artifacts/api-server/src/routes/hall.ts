import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, eventsTable, hallLayoutsTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

async function checkEventOwnership(eventId: number, userId: string): Promise<boolean> {
  const [event] = await db.select().from(eventsTable)
    .where(and(eq(eventsTable.id, eventId), eq(eventsTable.userId, userId))).limit(1);
  return !!event;
}

router.get("/events/:eventId/hall", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const [layout] = await db.select().from(hallLayoutsTable).where(eq(hallLayoutsTable.eventId, eventId)).limit(1);
  if (!layout) {
    // Return default empty layout
    res.json({ id: 0, eventId, width: 800, height: 600, elements: [], updatedAt: new Date().toISOString() });
    return;
  }
  res.json({ ...layout, updatedAt: layout.updatedAt.toISOString() });
});

router.put("/events/:eventId/hall", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { width, height, elements } = req.body;
  const existing = await db.select().from(hallLayoutsTable).where(eq(hallLayoutsTable.eventId, eventId)).limit(1);
  let layout;
  if (existing.length === 0) {
    [layout] = await db.insert(hallLayoutsTable).values({
      eventId,
      width: width ?? 800,
      height: height ?? 600,
      elements: elements ?? [],
    }).returning();
  } else {
    [layout] = await db.update(hallLayoutsTable)
      .set({ width, height, elements, updatedAt: new Date() })
      .where(eq(hallLayoutsTable.eventId, eventId))
      .returning();
  }
  res.json({ ...layout, updatedAt: layout.updatedAt.toISOString() });
});

export default router;
