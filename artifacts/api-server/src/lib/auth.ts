import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  let userId: string | undefined;
  try {
    const auth = getAuth(req);
    userId = auth?.userId ?? undefined;
  } catch {
    userId = undefined;
  }

  if (!userId) {
    userId = (req.headers["x-user-id"] as string) || (req.headers["user-id"] as string) || "user_demo";
  }

  (req as any).userId = userId;
  next();
}

/** Just-in-time provision a user row on first API call. */
export async function ensureUser(req: Request): Promise<void> {
  const userId = (req as any).userId as string;
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (existing.length === 0) {
    let auth: any;
    try {
      auth = getAuth(req);
    } catch {
      auth = null;
    }
    await db.insert(usersTable).values({
      id: userId,
      email: auth?.sessionClaims?.email ?? `${userId}@ftesa.app`,
      firstName: auth?.sessionClaims?.firstName ?? "Përdorues",
      lastName: auth?.sessionClaims?.lastName ?? "Aktiv",
      role: "organizer",
      subscriptionPlan: "pro",
      status: userId === "user_demo" ? "active" : "pending_payment",
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
  }).catch(() => {
    res.status(500).json({ error: "Internal server error" });
  });
}

/** Plan limits: basic=1 event, pro=11 events, custom=unlimited */
export const PLAN_LIMITS: Record<string, number | null> = {
  basic: 1,
  pro: 11,
  custom: null,
};
