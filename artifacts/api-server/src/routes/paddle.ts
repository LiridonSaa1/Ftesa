import { Router, type IRouter, type Request, type Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db, usersTable, subscriptionsTable, paymentsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

// ── helpers ──────────────────────────────────────────────────────────────────

function paddleBaseUrl(): string {
  const env = process.env.PADDLE_ENVIRONMENT ?? "sandbox";
  return env === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

function verifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const tsPart = signature.split(";").find((p) => p.startsWith("ts="));
  const h1Part = signature.split(";").find((p) => p.startsWith("h1="));
  if (!tsPart || !h1Part) return false;
  const ts = tsPart.slice(3);
  const h1 = h1Part.slice(3);
  const payload = `${ts}:${rawBody.toString("utf8")}`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(h1, "hex"));
  } catch {
    return false;
  }
}

function planFromPriceId(priceId: string): "basic" | "pro" | "custom" {
  if (priceId === process.env.PADDLE_PRICE_ID_PRO) return "pro";
  if (priceId === process.env.PADDLE_PRICE_ID_BASIC) return "basic";
  return "custom";
}

// ── GET /paddle/config — public config for the frontend ──────────────────────

router.get("/paddle/config", (_req: Request, res: Response): void => {
  res.json({
    clientToken: process.env.PADDLE_CLIENT_TOKEN ?? "test_434ea1d9975495522312268835a",
    priceIdBasic: process.env.PADDLE_PRICE_ID_BASIC ?? "pri_01kzgceydp22wy9c89a8j925av",
    priceIdPro: process.env.PADDLE_PRICE_ID_PRO ?? "pri_01kzgcg3tjf7f7dqyxmen728y4",
    priceIdCustom: process.env.PADDLE_PRICE_ID_CUSTOM ?? "pri_01kzgch82209pbwc7cy3h4vtv4",
    environment: process.env.PADDLE_ENVIRONMENT ?? "sandbox",
  });
});






// ── POST /paddle/webhook — Paddle sends events here ──────────────────────────
// express.raw() must be applied before express.json() for this path (see app.ts)

router.post("/paddle/webhook", async (req: Request, res: Response): Promise<void> => {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  const signature = req.headers["paddle-signature"] as string | undefined;
  if (!signature) {
    res.status(400).json({ error: "Missing Paddle-Signature header" });
    return;
  }

  const rawBody: Buffer = req.body;
  if (!verifySignature(rawBody, signature, secret)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  let event: any;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  const { event_type, data } = event;

  try {
    if (event_type === "subscription.activated" || event_type === "subscription.created") {
      await handleSubscriptionActivated(data);
    } else if (event_type === "subscription.canceled") {
      await handleSubscriptionCanceled(data);
    } else if (event_type === "transaction.completed") {
      await handleTransactionCompleted(data);
    }
    // All other events are acknowledged but not acted upon
  } catch (err) {
    console.error("[paddle webhook] error handling event", event_type, err);
    res.status(500).json({ error: "Internal error" });
    return;
  }

  res.json({ received: true });
});

// ── Event handlers ────────────────────────────────────────────────────────────

async function handleSubscriptionActivated(data: any): Promise<void> {
  const userId: string | undefined = data?.custom_data?.userId;
  if (!userId) return;

  const priceId: string = data?.items?.[0]?.price?.id ?? "";
  const plan = planFromPriceId(priceId);
  const paddleCustomerId: string = data?.customer_id ?? "";
  const paddleSubscriptionId: string = data?.id ?? "";
  const nextBilledAt: string | null = data?.next_billed_at ?? null;

  // Activate user
  await db
    .update(usersTable)
    .set({ status: "active", subscriptionPlan: plan })
    .where(eq(usersTable.id, userId));

  // Upsert subscription record
  const existing = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(subscriptionsTable)
      .set({
        plan,
        paddleCustomerId,
        paddleSubscriptionId,
        status: "active",
        startDate: new Date(),
        nextBillingDate: nextBilledAt ? new Date(nextBilledAt) : null,
      })
      .where(eq(subscriptionsTable.userId, userId));
  } else {
    await db.insert(subscriptionsTable).values({
      userId,
      plan,
      paddleCustomerId,
      paddleSubscriptionId,
      status: "active",
      startDate: new Date(),
      nextBillingDate: nextBilledAt ? new Date(nextBilledAt) : null,
    });
  }
}

async function handleSubscriptionCanceled(data: any): Promise<void> {
  const paddleSubscriptionId: string = data?.id ?? "";
  if (!paddleSubscriptionId) return;

  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.paddleSubscriptionId, paddleSubscriptionId))
    .limit(1);

  if (!sub) return;

  await db
    .update(subscriptionsTable)
    .set({ status: "canceled" })
    .where(eq(subscriptionsTable.id, sub.id));

  // Downgrade user to basic (they can still access data, but limited)
  await db
    .update(usersTable)
    .set({ subscriptionPlan: "basic" })
    .where(eq(usersTable.id, sub.userId));
}

async function handleTransactionCompleted(data: any): Promise<void> {
  const userId: string | undefined = data?.custom_data?.userId;
  const paddleTransactionId: string = data?.id ?? "";
  if (!userId || !paddleTransactionId) return;

  // Find subscription for this user
  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .limit(1);

  const amountCents = Math.round(
    parseFloat(data?.details?.totals?.total ?? "0") * 100
  );
  const currency = data?.currency_code ?? "EUR";

  // Avoid duplicate transaction records
  const existing = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.paddleTransactionId, paddleTransactionId))
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(paymentsTable).values({
    userId,
    subscriptionId: sub?.id ?? null,
    paddleTransactionId,
    amount: amountCents,
    currency,
    status: "completed",
  });
}

export default router;
