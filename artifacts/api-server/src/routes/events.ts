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
  try {
    await ensureUser(req);
    const userId = (req as any).userId as string;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const userPlan = user?.subscriptionPlan || "pro";
    const limit = PLAN_LIMITS[userPlan] ?? null;
    if (limit !== null) {
      const [{ value: eventCount }] = await db
        .select({ value: count() })
        .from(eventsTable)
        .where(eq(eventsTable.userId, userId));
      if (Number(eventCount) >= limit) {
        res.status(403).json({ error: `Keni arritur limitin e planit tuaj (${limit} event/e max). Kaloni në një plan më të lartë për të krijuar më shumë evente.` });
        return;
      }
    }
    const { name, date, time, venue, address, description, dressCode, phoneContact } = req.body;
    if (!name || !date) {
      res.status(400).json({ error: "Emri dhe data e eventit janë të detyrueshme." });
      return;
    }
    const [event] = await db.insert(eventsTable).values({
      userId,
      name,
      date,
      time: time || null,
      venue: venue || null,
      address: address || null,
      description: description || null,
      dressCode: dressCode || null,
      phoneContact: phoneContact || null,
      status: "draft",
    }).returning();
    res.status(201).json(serializeEvent(event));
  } catch (err: any) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Ndodhi një gabim gjatë ruajtjes së eventit: " + (err?.message || "Gabim në server") });
  }
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
