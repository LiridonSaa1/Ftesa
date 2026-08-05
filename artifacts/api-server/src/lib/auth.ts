import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).userId = userId;
  next();
}

/** Just-in-time provision a user row on first API call */
export async function ensureUser(req: Request): Promise<void> {
  const userId = (req as any).userId as string;
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (existing.length === 0) {
    const auth = getAuth(req);
    await db.insert(usersTable).values({
      id: userId,
      email: (auth as any)?.sessionClaims?.email ?? `${userId}@unknown.com`,
      firstName: (auth as any)?.sessionClaims?.firstName ?? null,
      lastName: (auth as any)?.sessionClaims?.lastName ?? null,
      role: "organizer",
      subscriptionPlan: "basic",
    }).onConflictDoNothing();
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const userId = (req as any).userId as string;
  db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1).then(([user]) => {
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  }).catch((err: any) => {
    res.status(500).json({ error: "Internal server error" });
  });
}

/** Plan limits: basic=1 event, pro=11 events, custom=unlimited */
export const PLAN_LIMITS: Record<string, number | null> = {
  basic: 1,
  pro: 11,
  custom: null,
};
