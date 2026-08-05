import { Router, type IRouter } from "express";
import { eq, count, and } from "drizzle-orm";
import { db, usersTable, eventsTable, guestsTable, eventTablesTable } from "@workspace/db";
import { requireAuth, ensureUser, PLAN_LIMITS } from "../lib/auth";

const router: IRouter = Router();

router.get("/events", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const events = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.userId, userId))
    .orderBy(eventsTable.date);
  res.json(events.map(serializeEvent));
});

router.post("/events", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const limit = PLAN_LIMITS[user.subscriptionPlan];
  if (limit !== null) {
    const [{ value: eventCount }] = await db
      .select({ value: count() })
      .from(eventsTable)
      .where(eq(eventsTable.userId, userId));
    if (Number(eventCount) >= limit) {
      res.status(403).json({ error: `Plan limit reached. Upgrade to create more events.` });
      return;
    }
  }
  const { name, date, time, venue, address, description, dressCode, phoneContact } = req.body;
  if (!name || !date) {
    res.status(400).json({ error: "name and date are required" });
    return;
  }
  const [event] = await db.insert(eventsTable).values({
    userId,
    name,
    date,
    time,
    venue,
    address,
    description,
    dressCode,
    phoneContact,
    status: "draft",
  }).returning();
  res.status(201).json(serializeEvent(event));
});

router.get("/events/:id", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [event] = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.id, id), eq(eventsTable.userId, userId)))
    .limit(1);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(serializeEvent(event));
});

router.patch("/events/:id", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const { name, date, time, venue, address, description, dressCode, phoneContact, status } = req.body;
  const [event] = await db
    .update(eventsTable)
    .set({ name, date, time, venue, address, description, dressCode, phoneContact, status, updatedAt: new Date() })
    .where(and(eq(eventsTable.id, id), eq(eventsTable.userId, userId)))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(serializeEvent(event));
});

router.delete("/events/:id", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [event] = await db
    .delete(eventsTable)
    .where(and(eq(eventsTable.id, id), eq(eventsTable.userId, userId)))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.sendStatus(204);
});

function serializeEvent(e: typeof eventsTable.$inferSelect) {
  return {
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
  };
}

export default router;
