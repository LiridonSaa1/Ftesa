import { Router, type IRouter } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, eventsTable, invitationsTable, guestsTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

async function checkEventOwnership(eventId: number, userId: string): Promise<boolean> {
  const [event] = await db.select().from(eventsTable)
    .where(and(eq(eventsTable.id, eventId), eq(eventsTable.userId, userId))).limit(1);
  return !!event;
}

router.get("/events/:eventId/invitation", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const [inv] = await db.select().from(invitationsTable).where(eq(invitationsTable.eventId, eventId)).limit(1);
  if (!inv) {
    res.status(404).json({ error: "No invitation created yet" });
    return;
  }
  res.json(serializeInvitation(inv));
});

router.put("/events/:eventId/invitation", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { template, couplePhoto, coupleName, message, musicUrl, showCountdown, showMap } = req.body;
  const existing = await db.select().from(invitationsTable).where(eq(invitationsTable.eventId, eventId)).limit(1);
  let inv;
  if (existing.length === 0) {
    [inv] = await db.insert(invitationsTable).values({
      eventId, template: template ?? "classic", couplePhoto, coupleName, message, musicUrl,
      showCountdown: showCountdown ?? true, showMap: showMap ?? true,
    }).returning();
  } else {
    [inv] = await db.update(invitationsTable)
      .set({ template, couplePhoto, coupleName, message, musicUrl, showCountdown, showMap })
      .where(eq(invitationsTable.eventId, eventId))
      .returning();
  }
  res.json(serializeInvitation(inv));
});

router.post("/events/:eventId/invitation/send", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const eventId = parseInt(Array.isArray(req.params.eventId) ? req.params.eventId[0] : req.params.eventId, 10);
  if (!await checkEventOwnership(eventId, userId)) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const { guestIds, channels } = req.body;
  if (!Array.isArray(guestIds) || guestIds.length === 0) {
    res.status(400).json({ error: "guestIds array required" });
    return;
  }
  // Mark guests as invited
  await db.update(guestsTable).set({ status: "invited" })
    .where(and(eq(guestsTable.eventId, eventId), inArray(guestsTable.id, guestIds)));
  const guests = await db.select().from(guestsTable)
    .where(and(eq(guestsTable.eventId, eventId), inArray(guestsTable.id, guestIds)));
  const baseUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost";
  const links = guests.map(g => ({
    guestId: g.id,
    guestName: `${g.firstName} ${g.lastName}`,
    rsvpUrl: `${baseUrl}/rsvp/${g.rsvpToken}`,
    qrToken: g.rsvpToken,
  }));
  res.json({ sent: guests.length, failed: 0, links });
});

// Public RSVP endpoints
router.get("/rsvp/:token", async (req, res): Promise<void> => {
  const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const [guest] = await db.select().from(guestsTable).where(eq(guestsTable.rsvpToken, token)).limit(1);
  if (!guest) {
    res.status(404).json({ error: "Invitation not found" });
    return;
  }
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, guest.eventId)).limit(1);
  const [inv] = await db.select().from(invitationsTable).where(eq(invitationsTable.eventId, guest.eventId)).limit(1);
  if (!event || !inv) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json({
    guestName: `${guest.firstName} ${guest.lastName}`,
    eventName: event.name,
    eventDate: event.date,
    eventTime: event.time,
    venue: event.venue,
    address: event.address,
    dressCode: event.dressCode,
    currentStatus: guest.status,
    invitation: serializeInvitation(inv),
  });
});

router.post("/rsvp/:token", async (req, res): Promise<void> => {
  const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
  const [guest] = await db.select().from(guestsTable).where(eq(guestsTable.rsvpToken, token)).limit(1);
  if (!guest) {
    res.status(404).json({ error: "Invitation not found" });
    return;
  }
  const { attending } = req.body;
  const newStatus = attending ? "confirmed" : "declined";
  await db.update(guestsTable).set({ status: newStatus }).where(eq(guestsTable.id, guest.id));
  res.json({
    status: newStatus,
    message: attending ? "Faleminderit! Ju pritemi me padurim." : "Ju kuptojmë. Faleminderit për përgjigjen tuaj.",
    guestName: `${guest.firstName} ${guest.lastName}`,
    tableInfo: null,
  });
});

function serializeInvitation(inv: typeof invitationsTable.$inferSelect) {
  return {
    id: inv.id,
    eventId: inv.eventId,
    template: inv.template,
    couplePhoto: inv.couplePhoto,
    coupleName: inv.coupleName,
    message: inv.message,
    musicUrl: inv.musicUrl,
    showCountdown: inv.showCountdown,
    showMap: inv.showMap,
    createdAt: inv.createdAt.toISOString(),
  };
}

export default router;
