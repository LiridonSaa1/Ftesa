import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth, ensureUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  await ensureUser(req);
  const userId = (req as any).userId as string;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
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

export default router;
