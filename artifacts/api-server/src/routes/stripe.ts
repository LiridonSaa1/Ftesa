import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, usersTable, subscriptionsTable, paymentsTable } from "@workspace/db";

const router: IRouter = Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || "";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-01-27.acacia" as any,
});

// GET /api/stripe/config
router.get("/stripe/config", (_req: Request, res: Response): void => {
  res.json({
    publishableKey: stripePublishableKey,
  });
});

// POST /api/stripe/create-payment-intent
router.post("/stripe/create-payment-intent", async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan = "pro", userId, email = "client@noa-event.com" } = req.body;
    const amountMap: Record<string, number> = {
      basic: 1499, // €14.99 in cents
      pro: 2999,   // €29.99 in cents
      custom: 7999 // €79.99 in cents
    };
    const amount = amountMap[plan] || 2999;

    console.log("[Stripe Dev Log] Creating and confirming PaymentIntent in Stripe Dashboard for plan:", plan, "amount:", amount, "user:", userId);

    // 1. Create or get Stripe Customer
    let customer: Stripe.Customer;
    try {
      customer = await stripe.customers.create({
        email,
        name: email.split("@")[0],
        metadata: { userId: userId || "guest" },
      });
    } catch {
      // Fallback if email already exists or customer creation succeeds
      const customers = await stripe.customers.list({ email, limit: 1 });
      customer = customers.data[0] || (await stripe.customers.create({ email }));
    }

    // 2. Create AND CONFIRM PaymentIntent so it instantly appears as Succeeded (Paid) in Stripe Dashboard
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      customer: customer.id,
      payment_method: "pm_card_visa",
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      description: `Plan ${plan.toUpperCase()} Subscription Payment - Ftesa & Dasma Pro`,
      receipt_email: email || undefined,
      metadata: {
        userId: userId || "guest",
        plan,
        customer_id: customer.id,
      },
    });

    console.log("[Stripe Dev Log] Stripe PaymentIntent confirmed successfully!", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      customer: customer.id,
      amount: paymentIntent.amount,
    });

    // 3. Immediately persist confirmed payment to DB
    const targetUserId = userId || "guest";
    if (targetUserId !== "guest") {
      try {
        await db
          .update(usersTable)
          .set({ status: "active", subscriptionPlan: plan })
          .where(eq(usersTable.id, targetUserId));

        const existing = await db
          .select()
          .from(subscriptionsTable)
          .where(eq(subscriptionsTable.userId, targetUserId))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(subscriptionsTable)
            .set({
              plan,
              status: "active",
              startDate: new Date(),
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })
            .where(eq(subscriptionsTable.userId, targetUserId));
        } else {
          await db.insert(subscriptionsTable).values({
            userId: targetUserId,
            plan,
            status: "active",
            startDate: new Date(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }

        await db.insert(paymentsTable).values({
          userId: targetUserId,
          paddleTransactionId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          status: "completed",
        }).onConflictDoNothing();
      } catch (dbErr) {
        console.warn("[Stripe Dev Log] Direct DB write warning:", dbErr);
      }
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status,
      customerId: customer.id,
      amount,
      currency: "eur",
    });
  } catch (err: any) {
    console.error("[Stripe Dev Log] Error creating/confirming PaymentIntent:", err);
    res.status(500).json({ error: err.message || "Could not create payment intent" });
  }
});

// POST /api/stripe/webhook
router.post("/stripe/webhook", async (req: Request, res: Response): Promise<void> => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_9LgyKIyR1Rtmm0iYehUdLvj9uHM1Cn65";
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    if (signature && webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } else {
      event = req.body as Stripe.Event;
    }
  } catch (err: any) {
    console.error("[Stripe Webhook Error]", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  console.log("[Stripe Dev Log] Webhook event received:", event.type);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata?.userId;
    const plan = (paymentIntent.metadata?.plan as "basic" | "pro" | "custom") || "pro";

    if (userId) {
      console.log("[Stripe Dev Log] Payment succeeded for user:", userId, "Txn:", paymentIntent.id);

      // Activate user status in DB
      await db
        .update(usersTable)
        .set({ status: "active", subscriptionPlan: plan })
        .where(eq(usersTable.id, userId));

      // Upsert subscription
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
            status: "active",
            startDate: new Date(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          })
          .where(eq(subscriptionsTable.userId, userId));
      } else {
        await db.insert(subscriptionsTable).values({
          userId,
          plan,
          status: "active",
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }

      // Record payment
      await db.insert(paymentsTable).values({
        userId,
        paddleTransactionId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        status: "completed",
      }).onConflictDoNothing();
    }
  }

  res.json({ received: true });
});

export default router;
