import { Router, type IRouter } from "express";
import { eq, and, ilike, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, eventsTable, guestsTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

const enumMapping: Record<string, "family" | "friends" | "colleagues" | "other"> = {
  "family": "family", "familje": "family", "familja": "family", "familjarë": "family", "familjare": "family", "afërm": "family", "aferm": "family", "fis": "family", "fisi": "family",
  "friends": "friends", "shoqëri": "friends", "shoqeri": "friends", "shoqëria": "friends", "shoqeria": "friends", "shokë": "friends", "shoke": "friends", "miq": "friends", "miqtë": "friends", "miqte": "friends",
  "colleagues": "colleagues", "kolegë": "colleagues", "kolege": "colleagues", "kolegët": "colleagues", "koleget": "colleagues", "puna": "colleagues", "punë": "colleagues",
  "other": "other", "tjetër": "other", "tjeter": "other", "të tjera": "other", "te tjera": "other", "tjerë": "other", "tjere": "other"
};

const VALID_CATEGORIES = new Set(["family", "friends", "colleagues", "other"]);

function normalizeCategory(raw: any): "family" | "friends" | "colleagues" | "other" {
  const str = String(raw || "").trim().toLowerCase();
  let mapped = enumMapping[str];
  if (mapped && VALID_CATEGORIES.has(mapped)) {
    return mapped;
  }
  if (VALID_CATEGORIES.has(str as any)) {
    return str as any;
  }
  if (str.includes("fam") || str.includes("fis") || str.includes("afërm") || str.includes("aferm")) {
    return "family";
  }
  if (str.includes("shoq") || str.includes("shok") || str.includes("mik") || str.includes("miq")) {
    return "friends";
  }
  if (str.includes("kol") || str.includes("pun") || str.includes("work")) {
    return "colleagues";
  }
  return "other";
}

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
  const mappedCategory = normalizeCategory(category);

  let guest: any;
  try {
    [guest] = await db.insert(guestsTable).values({
      eventId,
      firstName,
      lastName,
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
      partySize: Number(partySize) || 1,
      category: mappedCategory,
      status: "pending",
      rsvpToken: randomUUID(),
      notes: notes ? String(notes).trim() : null,
    }).returning();
  } catch (err: any) {
    console.error("Single guest insert error:", err);
    [guest] = await db.insert(guestsTable).values({
      eventId,
      firstName,
      lastName,
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
      partySize: Number(partySize) || 1,
      category: "other",
      status: "pending",
      rsvpToken: randomUUID(),
      notes: notes ? String(notes).trim() : null,
    }).returning();
  }
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

  let rawGuests = req.body;
  if (rawGuests && !Array.isArray(rawGuests)) {
    rawGuests = rawGuests.guests || rawGuests.data?.guests || rawGuests.data || [];
  }
  if (!Array.isArray(rawGuests)) {
    res.status(400).json({ error: "guests array required" });
    return;
  }
  const guests = rawGuests;

  let imported = 0;
  const errors: string[] = [];
  for (const g of guests) {
    try {
      let firstName = String(g.firstName || g.first_name || g.Emri || g.Name || "").trim();
      let lastName = String(g.lastName || g.last_name || g.Mbiemri || g.LastName || "").trim();

      if (!firstName && !lastName) {
        errors.push(`Skipped: missing name for entry`);
        continue;
      }

      if (firstName && !lastName && firstName.includes(" ")) {
        const parts = firstName.split(/\s+/);
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      } else if (!firstName && lastName) {
        firstName = lastName;
        lastName = "";
      }

      const rawCat = String(g.category || g.Category || "").trim();
      const catMapped = normalizeCategory(rawCat);

      try {
        await db.insert(guestsTable).values({
          eventId,
          firstName: firstName || "Mysafir",
          lastName: lastName || "",
          phone: g.phone ? String(g.phone).trim() : null,
          email: g.email ? String(g.email).trim() : null,
          partySize: Number(g.partySize) || 1,
          category: catMapped,
          status: "pending",
          rsvpToken: randomUUID(),
          notes: g.notes ? String(g.notes).trim() : null,
        });
        imported++;
      } catch (err1: any) {
        console.error("DB Insert attempt 1 failed:", err1?.message || err1);
        try {
          await db.insert(guestsTable).values({
            eventId,
            firstName: firstName || "Mysafir",
            lastName: lastName || "",
            phone: g.phone ? String(g.phone).trim() : null,
            email: g.email ? String(g.email).trim() : null,
            partySize: Number(g.partySize) || 1,
            category: "other",
            status: "pending",
            rsvpToken: randomUUID(),
            notes: g.notes ? String(g.notes).trim() : null,
          });
          imported++;
        } catch (err2: any) {
          console.error("DB Insert attempt 2 failed:", err2?.message || err2);
          errors.push(`Failed to import ${firstName} ${lastName}: ${err2.message}`);
        }
      }
    } catch (err: any) {
      console.error("Row import error:", err);
      errors.push(`Failed to import row: ${err.message}`);
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
  const mappedCategory = category ? (enumMapping[String(category).toLowerCase()] || category) : undefined;

  let guest: any;
  try {
    [guest] = await db.update(guestsTable)
      .set({ firstName, lastName, phone, email, partySize, category: mappedCategory as any, status, notes })
      .where(and(eq(guestsTable.id, guestId), eq(guestsTable.eventId, eventId)))
      .returning();
  } catch (err) {
    [guest] = await db.update(guestsTable)
      .set({ firstName, lastName, phone, email, partySize, category: "other" as any, status, notes })
      .where(and(eq(guestsTable.id, guestId), eq(guestsTable.eventId, eventId)))
      .returning();
  }
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
