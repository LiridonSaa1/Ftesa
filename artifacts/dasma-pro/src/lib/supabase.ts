const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qoenktbnwuuwlnfagcmf.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZW5rdGJud3V1d2xuZmFnY21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjgwMzgsImV4cCI6MjEwMTUwNDAzOH0.Ihy4kAmhaUZPaU_cMH_9nmw2I4Vmr3oN8sfMn0TMlvo";

function getHeaders() {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
}

export interface RegisterUserParams {
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  userId?: string;
}

export async function registerUserInSupabase(params: RegisterUserParams) {
  const userId = params.userId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        id: userId,
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        role: "organizer",
        subscription_plan: params.plan || "pro",
        status: "pending_payment",
      }),
    });
    const data = await res.json();
    return data?.[0] || { id: userId };
  } catch (err) {
    console.error("Supabase direct user insert error:", err);
    return { id: userId };
  }
}

export interface ActivateSubParams {
  userId: string;
  email: string;
  plan: string;
  paddleCustomerId?: string;
  paddleSubscriptionId?: string;
  paddleTransactionId?: string;
  amount?: number;
}

export async function activateSubscriptionInSupabase(params: ActivateSubParams) {
  const plan = params.plan || "pro";
  const amount = params.amount || (plan === "basic" ? 1000 : 5000);
  const custId = params.paddleCustomerId || `cus_test_${Date.now()}`;
  const subId = params.paddleSubscriptionId || `sub_test_${Date.now()}`;
  const txnId = params.paddleTransactionId || `txn_test_${Date.now()}`;

  try {
    // 1. Update user status in Supabase -> status = 'active'
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(params.userId)}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        status: "active",
        subscription_plan: plan,
        updated_at: new Date().toISOString(),
      }),
    });

    // 2. Insert subscription record in Supabase
    const subRes = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        user_id: params.userId,
        plan: plan,
        paddle_customer_id: custId,
        paddle_subscription_id: subId,
        status: "active",
        start_date: new Date().toISOString(),
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    const subData = await subRes.json();
    const subscriptionId = Array.isArray(subData) && subData[0] ? subData[0].id : null;

    // 3. Insert payment record in Supabase
    const payRes = await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        user_id: params.userId,
        subscription_id: subscriptionId,
        paddle_transaction_id: txnId,
        amount: amount,
        currency: "EUR",
        status: "completed",
      }),
    });
    const payData = await payRes.json();

    return {
      success: true,
      subscription: Array.isArray(subData) ? subData[0] : subData,
      payment: Array.isArray(payData) ? payData[0] : payData,
    };
  } catch (err) {
    console.error("Supabase direct activation error:", err);
    return { success: false };
  }
}

export async function fetchPlansFromSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/plans?select=*`, {
      headers: getHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch plans from Supabase:", err);
  }
  return [];
}

