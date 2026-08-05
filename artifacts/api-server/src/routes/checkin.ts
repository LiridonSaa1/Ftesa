import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, eventsTable, guestsTable, eventTablesTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

router.post("/checkin", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const { qrToken, eventId } = req.body;
  if (!qrToken || !eventId) {
    res.status(400).json({ error: "qrToken and eventId required" });
    return;
  }
  const [guest] = await db.select().from(guestsTable)
    .where(and(eq(guestsTable.rsvpToken, qrToken), eq(guestsTable.eventId, eventId))).limit(1);
  if (!guest) {
    res.status(404).json({ error: "Guest not found" });
    return;
  }
  const alreadyCheckedIn = guest.status === "checked_in";
  if (!alreadyCheckedIn) {
    await db.update(guestsTable).set({ status: "checked_in" }).where(eq(guestsTable.id, guest.id));
  }
  let tableName: string | null = null;
  if (guest.tableId) {
    const [table] = await db.select().from(eventTablesTable).where(eq(eventTablesTable.id, guest.tableId)).limit(1);
    tableName = table?.name ?? null;
  }
  res.json({
    success: true,
    guestName: `${guest.firstName} ${guest.lastName}`,
    tableName,
    seatNumber: guest.seatNumber,
    status: alreadyCheckedIn ? "checked_in" : "checked_in",
    alreadyCheckedIn,
  });
});

export default router;
