import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, usersTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  let [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (user.status === "pending_payment") {
    const [updated] = await db.update(usersTable).set({ status: "active" }).where(eq(usersTable.id, userId)).returning();
    user = updated || user;
  }
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    subscriptionPlan: user.subscriptionPlan,
    status: "active",
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/activate-demo", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const [user] = await db
    .update(usersTable)
    .set({ status: "active", subscriptionPlan: "pro" })
    .where(eq(usersTable.id, userId))
    .returning();
  res.json({ success: true, status: user.status, subscriptionPlan: user.subscriptionPlan });
});

router.patch("/auth/profile", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const { firstName, lastName } = req.body;
  const [user] = await db
    .update(usersTable)
    .set({ firstName, lastName })
    .where(eq(usersTable.id, userId))
    .returning();
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    subscriptionPlan: user.subscriptionPlan,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const { email, firstName, lastName, plan, userId: customUserId } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const userId = customUserId || `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing) {
      const [updated] = await db
        .update(usersTable)
        .set({
          firstName: firstName || existing.firstName,
          lastName: lastName || existing.lastName,
          subscriptionPlan: plan || existing.subscriptionPlan,
        })
        .where(eq(usersTable.id, existing.id))
        .returning();

      res.json({
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        subscriptionPlan: updated.subscriptionPlan,
        status: updated.status,
      });
      return;
    }

    const [newUser] = await db.insert(usersTable).values({
      id: userId,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      role: "organizer",
      subscriptionPlan: plan || "pro",
      status: "pending_payment",
    }).returning();

    res.json({
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      subscriptionPlan: newUser.subscriptionPlan,
      status: newUser.status,
    });
  } catch (err: any) {
    console.error("[register error]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
