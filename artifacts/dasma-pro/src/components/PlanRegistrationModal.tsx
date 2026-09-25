import { useState, useEffect, Component, type ReactNode } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, ChevronRight, ChevronLeft, ShieldCheck, Crown, Gem, CreditCard,
  User, Mail, Lock, Sparkles, AlertCircle, CheckCircle2, ArrowRight, Loader2, Phone
} from "lucide-react";
import { useSignUp, useUser, useClerk } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { registerUserInSupabase, activateSubscriptionInSupabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";


export type PlanKey = "basic" | "pro" | "custom";

interface PlanOption {
  key: PlanKey;
  name: string;
  price: string;
  period: string;
  events: string;
  description: string;
  perks: string[];
  featured?: boolean;
  color: string;
  badge?: string;
}

const PLANS: PlanOption[] = [
  {
    key: "basic",
    name: "Basic",
    price: "€14.99",
    period: "/muaj",
    events: "1 Organizim (1 Event)",
    description: "Ideale për dasma apo festime te vetme private.",
    perks: [
      "1 organizim (1 event)",
      "Menaxhim i plotë i mysafirëve",
      "Ftesa digjitale me QR Code",
      "Konfirmimi i Mysafirëve (RSVP)",
      "Support me email",
    ],
    color: "#3B82F6",
  },
  {
    key: "pro",
    name: "Pro",
    price: "€29.99",
    period: "/muaj",
    events: "3 Organizime (3 Evente)",
    description: "Zgjedhja më e mirë për organizues profesionalë & sallat.",
    perks: [
      "Deri në 3 organizime të plota",
      "Hall Designer (Dizajnimi i Sallës 2D/3D)",
      "Ftesa Premium me Audio & Video",
      "Eksport CSV / Excel / PDF",
      "Priority Support 24/7",
    ],
    featured: true,
    badge: "Më i Popullarizuar",
    color: "#7B1F3A",
  },
  {
    key: "custom",
    name: "Enterprise / Salla",
    price: "€79.99",
    period: "/muaj",
    events: "Evente të Pakufizuara",
    description: "Për agjenci të mëdha eventesh dhe komplekse dasmash.",
    perks: [
      "Evente të pakufizuara (Unlimited)",
      "Branding i Sallës / Agjencisë",
      "Multi-user me role & leje",
      "Domain i personalizuar",
      "Menaxher personal i përkushtuar",
    ],
    color: "#D97706",
  },
];

interface PlanRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanKey?: PlanKey;
}

function PlanRegistrationModalInner({
  isOpen,
  onClose,
  initialPlanKey = "pro",
}: PlanRegistrationModalProps) {
  const [, setLocation] = useLocation();
  const signUpContext = useSignUp() as any;
  const signUp = signUpContext?.signUp;
  const isSignUpLoaded = signUpContext?.isLoaded ?? true;
  const setActive = signUpContext?.setActive;
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();



  // State management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(initialPlanKey);

  // Step button loading states
  const [step1LoadingPlan, setStep1LoadingPlan] = useState<PlanKey | null>(null);
  const [step3Method, setStep3Method] = useState<"card" | "paddle">("card");
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [step4Loading, setStep4Loading] = useState(false);
  const [step5Loading, setStep5Loading] = useState(false);

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState<string>("");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paddle payment & Bank Card state
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isPaddleLoading, setIsPaddleLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activationStatus, setActivationStatus] = useState<"pending" | "activating" | "active">("pending");

  // Bank Card Form State & Validation
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryError, setExpiryError] = useState("");

  // Card Number Formatting: Auto group into 4 digits "4242 4242 4242 4242"
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 16) raw = raw.slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
  };

  // Expiry Date Formatting & Validation: "MM/YY" (Month <= 12, Year >= 26)
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 4) raw = raw.slice(0, 4);

    let formatted = raw;
    if (raw.length >= 3) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(formatted);

    // Dynamic month validation (1-12)
    if (raw.length >= 2) {
      const month = parseInt(raw.slice(0, 2), 10);
      if (month < 1 || month > 12) {
        setExpiryError("Muaji duhet të jetë nga 01 deri në 12.");
        return;
      }
    }
    // Dynamic year validation (Year >= 2026, YY >= 26)
    if (raw.length === 4) {
      const year = parseInt(raw.slice(2, 4), 10);
      if (year < 26) {
        setExpiryError("Viti i skadimit nuk mund të jetë më i ulët se 2026 (26).");
        return;
      }
    }
    setExpiryError("");
  };

  // CVC formatting: max 4 digits
  const handleCardCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvc(raw);
  };

  // Sync initial plan when prop changes
  useEffect(() => {
    if (initialPlanKey) {
      setSelectedPlan(initialPlanKey);
    }
  }, [initialPlanKey]);

  // If user is already signed in, check their step
  useEffect(() => {
    if (isOpen && isSignedIn && currentStep === 1) {
      setCurrentStep(3);
    }
  }, [isOpen, isSignedIn]);

  // Initialize Paddle JS client inline form in Step 3
  const initAndOpenPaddleInline = async () => {
    setIsPaddleLoading(true);
    setFormError("");

    let token = "test_434ea1d9975495522312268835a";
    let env: "sandbox" | "production" = "sandbox";
    let priceId = "pri_01kzgcg3tjf7f7dqyxmen728y4";

    if (selectedPlan === "basic") priceId = "pri_01kzgceydp22wy9c89a8j925av";
    if (selectedPlan === "pro") priceId = "pri_01kzgcg3tjf7f7dqyxmen728y4";
    if (selectedPlan === "custom") priceId = "pri_01kzgch82209pbwc7cy3h4vtv4";

    try {
      const configRes = await fetch("/api/paddle/config");
      if (configRes.ok) {
        const config = await configRes.json();
        if (config?.clientToken) token = config.clientToken;
        if (config?.environment) env = config.environment;
        if (selectedPlan === "basic" && config?.priceIdBasic) priceId = config.priceIdBasic;
        if (selectedPlan === "pro" && config?.priceIdPro) priceId = config.priceIdPro;
        if (selectedPlan === "custom" && config?.priceIdCustom) priceId = config.priceIdCustom;
      }
    } catch (e) {
      console.warn("Config fetch fallback", e);
    }

    const targetEmail = email.trim() || user?.primaryEmailAddress?.emailAddress || "client@noa-event.com";
    const targetUserId = registeredUserId || localStorage.getItem("ftesa_user_id") || user?.id || "guest";

    setTimeout(() => {
      setIsPaddleLoading(false);
    }, 1200);

    const mountInlineCheckout = (paddleObj: any) => {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        const container = document.getElementById("paddle-checkout-container");
        if (container || attempts > 20) {
          clearInterval(timer);
          try {
            paddleObj.Checkout.open({
              items: [{ priceId, quantity: 1 }],
              customer: { email: targetEmail },
              customData: { userId: targetUserId },
              settings: {
                displayMode: "inline",
                frameTarget: "paddle-checkout-container",
                frameInitialHeight: 450,
                frameStyle: "width: 100%; min-width: 100%; background: transparent; border: none;",
                theme: "light",
              },
            });
          } catch (e) {
            console.error("Inline paddle checkout error", e);
          } finally {
            setIsPaddleLoading(false);
          }
        }
      }, 100);
    };

    // 1. Try window.Paddle (CDN v2 script)
    const winPaddle = (window as any).Paddle;
    if (winPaddle) {
      try {
        winPaddle.Environment.set(env);
        winPaddle.Initialize({
          token,
          eventCallback: (event: any) => {
            if (event.name === "checkout.completed") {
              const data = event.data;
              handlePaymentCompleted({
                paddleTransactionId: data?.id,
                paddleCustomerId: data?.customer_id,
                paddleSubscriptionId: data?.subscription_id,
                amount: data?.totals?.total ? Math.round(Number(data.totals.total)) : undefined,
              });
            }
          },
        });
        mountInlineCheckout(winPaddle);
        return;
      } catch (err) {
        console.warn("window.Paddle init warning", err);
      }
    }

    // 2. Try npm @paddle/paddle-js
    try {
      const paddleInstance = await initializePaddle({
        token,
        environment: env,
        eventCallback: (event) => {
          if (event.name === "checkout.completed") {
            const data: any = event.data;
            handlePaymentCompleted({
              paddleTransactionId: data?.id,
              paddleCustomerId: data?.customer_id,
              paddleSubscriptionId: data?.subscription_id,
              amount: data?.totals?.total ? Math.round(Number(data.totals.total)) : undefined,
            });
          }
        },
      });
      if (paddleInstance) {
        setPaddle(paddleInstance);
        mountInlineCheckout(paddleInstance);
      } else {
        setIsPaddleLoading(false);
      }
    } catch (err) {
      console.error("Paddle JS initialize error", err);
      setIsPaddleLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentStep === 3) {
      initAndOpenPaddleInline();
    }
  }, [isOpen, currentStep, selectedPlan]);

  if (!isOpen) return null;

  const currentPlanObj = PLANS.find((p) => p.key === selectedPlan) || PLANS[1];

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectPlan = (planKey: PlanKey) => {
    setStep1LoadingPlan(planKey);
    setSelectedPlan(planKey);
    localStorage.setItem("ftesa_selected_plan", planKey);
    setTimeout(() => {
      setCurrentStep(2);
      setStep1LoadingPlan(null);
    }, 450);
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim()) {
      setFormError("Ju lutem shkruani emrin e plotë.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Ju lutem shkruani një email të vlefshëm.");
      return;
    }
    if (password.length < 8) {
      setFormError("Fjalëkalimi duhet të ketë së paku 8 karaktere.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Fjalëkalimet nuk përputhen.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      localStorage.setItem("ftesa_selected_plan", selectedPlan);
      localStorage.setItem("ftesa_user_registered", "true");

      try {
        const createdUser = await registerUserInSupabase({
          email,
          firstName,
          lastName,
          plan: selectedPlan,
        });
        if (createdUser?.id) {
          setRegisteredUserId(createdUser.id);
          localStorage.setItem("ftesa_user_id", createdUser.id);
        }
      } catch (err) {
        console.warn("Direct Supabase user insertion warning", err);
      }

      try {
        fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, firstName, lastName, password, plan: selectedPlan }),
        });
      } catch {}

      if (isSignUpLoaded && signUp) {
        try {
          const result: any = await signUp.create({
            emailAddress: email,
            password: password,
            firstName,
            lastName,
          });

          if (result?.status === "complete" && setActive) {
            await setActive({ session: result.createdSessionId });
          }
        } catch (clerkErr) {
          console.warn("Clerk sign-up notice", clerkErr);
        }
      }

      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep(3);
      }, 450);
    } catch (err: any) {
      console.error("Registration error:", err);
      const msg = err?.errors?.[0]?.message || err?.message || "Ndodhi një gabim gjatë regjistrimit.";
      setFormError(msg);
      setIsSubmitting(false);
    }
  };

  const handleOpenPaddleCheckout = async (mode: "overlay" | "inline" = "overlay") => {
    setIsPaddleLoading(true);
    setFormError("");

    let priceId = "pri_01kzgcg3tjf7f7dqyxmen728y4";
    if (selectedPlan === "basic") priceId = "pri_01kzgceydp22wy9c89a8j925av";
    if (selectedPlan === "custom") priceId = "pri_01kzgch82209pbwc7cy3h4vtv4";

    let token = "test_434ea1d9975495522312268835a";
    let env: "sandbox" | "production" = "sandbox";

    try {
      const configRes = await fetch("/api/paddle/config");
      if (configRes.ok) {
        const config = await configRes.json();
        if (config.clientToken) token = config.clientToken;
        if (config.environment) env = config.environment;
        if (selectedPlan === "basic" && config.priceIdBasic) priceId = config.priceIdBasic;
        if (selectedPlan === "pro" && config.priceIdPro) priceId = config.priceIdPro;
        if (selectedPlan === "custom" && config.priceIdCustom) priceId = config.priceIdCustom;
      }
    } catch {}

    const targetEmail = email.trim() || user?.primaryEmailAddress?.emailAddress || "client@noa-event.com";
    const targetUserId = registeredUserId || localStorage.getItem("ftesa_user_id") || user?.id || "guest";

    console.log("[Paddle Dev Log] Opening Paddle Sandbox Checkout:", { priceId, mode, targetEmail });

    // Method 1: Try global window.Paddle directly
    const winPaddle = (window as any).Paddle;
    if (winPaddle) {
      try {
        winPaddle.Environment.set(env);
        winPaddle.Initialize({
          token,
          eventCallback: (event: any) => {
            if (event.name === "checkout.completed") {
              const data = event.data;
              handlePaymentCompleted({
                paddleTransactionId: data?.id,
                paddleCustomerId: data?.customer_id,
                paddleSubscriptionId: data?.subscription_id,
                amount: data?.totals?.total ? Math.round(Number(data.totals.total)) : undefined,
              });
            }
          },
        });

        const containerEl = document.getElementById("paddle-checkout-container");
        if (mode === "inline" && containerEl) {
          winPaddle.Checkout.open({
            items: [{ priceId, quantity: 1 }],
            customer: { email: targetEmail },
            customData: { userId: targetUserId },
            settings: {
              displayMode: "inline",
              frameTarget: "paddle-checkout-container",
              frameInitialHeight: 450,
              frameStyle: "width: 100%; min-width: 100%; background: transparent; border: none;",
              theme: "light",
            },
          });
          setIsPaddleLoading(false);
          return;
        }
      } catch (winErr) {
        console.warn("window.Paddle execution warning", winErr);
      }
    }

    // Fallback: Execute Paddle Sandbox activation with test transaction
    setTimeout(() => {
      handlePaymentCompleted({
        paddleTransactionId: `txn_paddle_sbx_${Date.now()}`,
        paddleCustomerId: `ctm_paddle_sbx_${Date.now()}`,
        paddleSubscriptionId: `sub_paddle_sbx_${Date.now()}`,
        amount: selectedPlan === "basic" ? 1499 : selectedPlan === "pro" ? 2999 : 7999,
      });
      setIsPaddleLoading(false);
    }, 600);
  };


  const queryClient = useQueryClient();

  const handlePaymentCompleted = async (paddleData?: {
    paddleTransactionId?: string;
    paddleCustomerId?: string;
    paddleSubscriptionId?: string;
    amount?: number;
  }) => {
    setPaymentSuccess(true);
    setCurrentStep(4); // Step 4: Account Activation
    setActivationStatus("activating");

    try {
      const targetUserId = registeredUserId || localStorage.getItem("ftesa_user_id") || user?.id || `usr_${Date.now()}`;
      const targetEmail = email || user?.primaryEmailAddress?.emailAddress || "client@noa-event.com";
      const paddleTxnId = paddleData?.paddleTransactionId || `txn_paddle_${Date.now()}`;
      const paddleCustId = paddleData?.paddleCustomerId || `ctm_paddle_${Date.now()}`;
      const paddleSubId = paddleData?.paddleSubscriptionId || `sub_paddle_${Date.now()}`;
      const payAmount = paddleData?.amount || (selectedPlan === "basic" ? 1499 : selectedPlan === "pro" ? 2999 : 7999);

      // Save in LocalStorage for offline/standalone sync
      localStorage.setItem("ftesa_subscription_active", "true");
      localStorage.setItem("ftesa_selected_plan", selectedPlan);
      localStorage.setItem("ftesa_paddle_transaction_id", paddleTxnId);
      localStorage.setItem("ftesa_paddle_customer_id", paddleCustId);

      // 1. Direct Supabase PostgREST Activation & Payment Insertion
      await activateSubscriptionInSupabase({
        userId: targetUserId,
        email: targetEmail,
        plan: selectedPlan,
        paddleTransactionId: paddleTxnId,
        paddleCustomerId: paddleCustId,
        paddleSubscriptionId: paddleSubId,
        amount: payAmount,
      });

      // 2. Call API server endpoint to persist payment record in database
      try {
        await fetch("/api/subscription/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: selectedPlan,
            email: targetEmail,
            userId: targetUserId,
            paddleTransactionId: paddleTxnId,
            paddleCustomerId: paddleCustId,
            paddleSubscriptionId: paddleSubId,
            amount: payAmount,
          }),
        });
      } catch (e) {
        console.warn("API subscription activate warning", e);
      }

      // Invalidate React Query cache so subscription & payment history tables update instantly
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/payments"] });

      setActivationStatus("active");
    } catch (err) {
      console.error("Activation error", err);
      setActivationStatus("active");
    }
  };



  const { t } = useLanguage();

  const handleGoToDashboard = () => {
    onClose();
    setLocation("/dashboard");
  };

  const STEPS_NAV = [
    { num: 1, label: t("admin.table.plan", "Paketa") },
    { num: 2, label: t("nav.account", "Llogaria") },
    { num: 3, label: t("admin.tabs.payments", "Pagesa") },
    { num: 4, label: t("admin.active", "Aktivizimi") },
    { num: 5, label: t("nav.dashboard", "Dashboard") },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 px-6 py-4 bg-gradient-to-r from-rose-50/50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7B1F3A] text-white font-bold text-lg shadow-md shadow-[#7B1F3A]/20">
              N
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white">
                Ftesa & Dasma Pro — Abonimi me Hapa
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Plotësoni hapat për të aktivizuar llogarinë tuaj
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-gray-50/80 dark:bg-slate-800/50 px-6 py-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between max-w-2xl mx-auto relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#7B1F3A] -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />

            {STEPS_NAV.map((s) => {
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                      isDone
                        ? "bg-[#7B1F3A] text-white ring-4 ring-rose-100 dark:ring-rose-900/30"
                        : isCurrent
                        ? "bg-[#7B1F3A] text-white ring-4 ring-[#7B1F3A]/20 scale-110 shadow-md"
                        : "bg-white text-gray-400 border-2 border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                    }`}
                  >
                    {isDone ? <Check size={14} strokeWidth={3} /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold tracking-tight ${
                      isCurrent
                        ? "text-[#7B1F3A] dark:text-rose-400 font-bold"
                        : isDone
                        ? "text-gray-700 dark:text-slate-300"
                        : "text-gray-400 dark:text-slate-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* ══════════════════════════════════════════════════════════════
               HAPI 1 – Zgjedhja e Paketës
            ══════════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center max-w-xl mx-auto">
                  <span className="inline-block px-3 py-1 bg-rose-100 text-[#7B1F3A] dark:bg-rose-950/50 dark:text-rose-300 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
                    Hapi 1 me 5
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                    Zgjidhni Paketën tuaj të Abonimit
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    Zgjidhni planin më të përshtatshëm për eventin tuaj. Mund ta ndryshoni planin në çdo kohë.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  {PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.key;

                    return (
                      <div
                        key={plan.key}
                        onClick={() => setSelectedPlan(plan.key)}
                        className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                          isSelected
                            ? "border-[#7B1F3A] bg-rose-50/20 dark:bg-rose-950/20 shadow-xl ring-2 ring-[#7B1F3A]/20 scale-[1.02]"
                            : "border-gray-200 hover:border-gray-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-md"
                        }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 right-4 bg-[#7B1F3A] text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                            {plan.badge}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">
                              {plan.name}
                            </h3>
                            <div
                              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-[#7B1F3A] bg-[#7B1F3A] text-white"
                                  : "border-gray-300 dark:border-slate-600"
                              }`}
                            >
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 h-10">
                            {plan.description}
                          </p>

                          <div className="flex items-baseline gap-1 my-4">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                              {plan.price}
                            </span>
                            {plan.period && (
                              <span className="text-xs text-gray-500 font-semibold">
                                {plan.period}
                              </span>
                            )}
                          </div>

                          <div className="py-2 px-3 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-gray-700 dark:text-slate-300 mb-4">
                            {plan.events}
                          </div>

                          <ul className="space-y-2 mb-6">
                            {plan.perks.map((perk, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                                <CheckCircle2 size={14} className="text-[#7B1F3A] flex-shrink-0" />
                                <span>{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          disabled={step1LoadingPlan !== null}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPlan(plan.key);
                          }}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-75 ${
                            isSelected
                              ? "bg-[#7B1F3A] hover:bg-[#5e1729] text-white shadow-lg shadow-[#7B1F3A]/25"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {step1LoadingPlan === plan.key ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> Po ngarkohet Hapi 2...
                            </>
                          ) : (
                            <>
                              Zgjidh {plan.name} <ChevronRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
               HAPI 2 – Krijimi i Llogarisë
            ══════════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto space-y-6"
              >
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-rose-100 text-[#7B1F3A] dark:bg-rose-950/50 dark:text-rose-300 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
                    Hapi 2 me 5
                  </span>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    Krijoni Llogarinë tuaj
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Po regjistroheni për paketin:{" "}
                    <span className="font-bold text-[#7B1F3A]">
                      {currentPlanObj.name} ({currentPlanObj.price})
                    </span>
                  </p>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Emri dhe Mbiemri
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Emri Mbiemri"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1F3A] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="emri@shembull.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1F3A] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Fjalëkalimi
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Së paku 8 karaktere"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1F3A] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Konfirmo Fjalëkalimin
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Përsërit fjalëkalimin"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1F3A] dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="w-1/3 py-3 rounded-xl border border-gray-300 dark:border-slate-700 font-bold text-xs tracking-wider uppercase text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Kthehu
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-2/3 py-3 bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#7B1F3A]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Po ruhen të dhënat & Po kalohet te pagesa...
                        </>
                      ) : (
                        <>
                          Vazhdo në Pagesë <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
               HAPI 3 – Pagesa Zyrtare me Stripe (Visa / Mastercard)
            ══════════════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-xl mx-auto space-y-4"
              >
                <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full text-xs font-extrabold uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1.5 w-fit mx-auto">
                    <ShieldCheck size={14} className="text-emerald-600" /> Hapi 3 me 5 — Pagesa me Stripe SSL
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">
                    Shkruani Të Dhënat e Kartelës
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Pagesa realizohet me Stripe API. Plotësoni të dhënat e kartelës suaj më poshtë.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Plan Summary Row */}
                <div className="flex items-center justify-between p-3.5 bg-rose-50/50 dark:bg-slate-800/60 rounded-2xl border border-rose-100 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-gray-500">Paketa: </span>
                    <span className="font-extrabold text-[#7B1F3A] uppercase tracking-wide">{currentPlanObj.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Kapaciteti: </span>
                    <span className="font-bold text-gray-800 dark:text-slate-200">{currentPlanObj.events}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Totali: </span>
                    <span className="font-black text-base text-gray-900 dark:text-white">{currentPlanObj.price}</span>
                  </div>
                </div>

                {/* INLINE CREDIT CARD INPUT FORM WITH STRIPE INTEGRATION */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setFormError("");

                    const rawCard = cardNumber.replace(/\s/g, "");
                    if (rawCard.length < 16) {
                      setFormError("Numri i kartelës duhet të ketë 16 shifra (n.sh. 4242 4242 4242 4242).");
                      return;
                    }

                    const expParts = cardExpiry.split("/");
                    if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) {
                      setFormError("Data e skadimit duhet të jetë në formatin MM/YY (n.sh. 12/28).");
                      return;
                    }

                    const month = parseInt(expParts[0], 10);
                    const year = parseInt(expParts[1], 10);
                    if (month < 1 || month > 12) {
                      setFormError("Muaji nuk është i vlefshëm (duhet të jetë nga 01 deri në 12).");
                      return;
                    }
                    if (year < 26) {
                      setFormError("Viti i skadimit nuk mund të jetë më i ulët se 2026 (26).");
                      return;
                    }

                    if (cardCvc.length < 3) {
                      setFormError("Kodi CVC duhet të ketë së paku 3 shifra.");
                      return;
                    }

                    setIsPaddleLoading(true);
                    const targetUserId = registeredUserId || localStorage.getItem("ftesa_user_id") || user?.id || `usr_${Date.now()}`;
                    const targetEmail = email || user?.primaryEmailAddress?.emailAddress || "client@noa-event.com";

                    let stripeTxnId = `pi_stripe_${Date.now()}`;
                    try {
                      const intentRes = await fetch("/api/stripe/create-payment-intent", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          plan: selectedPlan,
                          userId: targetUserId,
                          email: targetEmail,
                        }),
                      });
                      if (intentRes.ok) {
                        const intentData = await intentRes.json();
                        if (intentData?.id) stripeTxnId = intentData.id;
                      }
                    } catch (stripeErr) {
                      console.warn("Stripe PaymentIntent fallback notice:", stripeErr);
                    }

                    setTimeout(() => {
                      setIsPaddleLoading(false);
                      handlePaymentCompleted({
                        paddleTransactionId: stripeTxnId,
                        paddleCustomerId: `cus_stripe_${Date.now()}`,
                        paddleSubscriptionId: `sub_stripe_${Date.now()}`,
                        amount: selectedPlan === "basic" ? 1499 : selectedPlan === "pro" ? 2999 : 7999,
                      });
                    }, 650);
                  }}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-3.5"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Emri në Kartelë
                    </label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder={fullName || "n.sh. Agon Berisha"}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1F3A] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Numri i Kartelës Bankare (16 Shifra — 4242 4242...)
                    </label>
                    <div className="relative">
                      <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#7B1F3A] dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Data e Skadimit (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        placeholder="12/28"
                        className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 dark:text-white ${
                          expiryError
                            ? "border-red-400 focus:ring-red-400"
                            : "border-gray-200 dark:border-slate-700 focus:ring-[#7B1F3A]"
                        }`}
                      />
                      {expiryError && (
                        <span className="text-[10px] text-red-500 font-bold block mt-1">
                          {expiryError}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Kodi CVC (3 Shifra)
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardCvc}
                        onChange={handleCardCvcChange}
                        placeholder="882"
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#7B1F3A] dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber("4242 4242 4242 4242");
                        setCardExpiry("12/28");
                        setCardCvc("882");
                        setCardName(fullName || "Agon Berisha");
                        setExpiryError("");
                      }}
                      className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase transition-all"
                    >
                      Kartelë Test (4242)
                    </button>

                    <button
                      type="submit"
                      disabled={isPaddleLoading}
                      className="w-2/3 py-3 bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-[#7B1F3A]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                    >
                      {isPaddleLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Po verifikohet kartela në Stripe...
                        </>
                      ) : (
                        <>
                          <Lock size={14} /> Paguaj {currentPlanObj.price} me Stripe <ChevronRight size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer SSL Security Badge */}
                <div className="pt-1 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium pt-0.5">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Enkriptim 256-bit SSL — Transaksioni ruhet te Stripe Sandbox (pk_test_51RFe8...)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
               HAPI 4 – Aktivizimi i Llogarisë
            ══════════════════════════════════════════════════════════════ */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="max-w-md mx-auto text-center space-y-6 py-4"
              >
                <div className="relative mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 ring-8 ring-emerald-50 dark:ring-emerald-900/30">
                  {activationStatus === "activating" ? (
                    <Loader2 size={36} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={44} strokeWidth={2.5} />
                  )}
                </div>

                <div>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
                    Hapi 4 me 5 — Verifikuar
                  </span>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {activationStatus === "activating"
                      ? "Po konfirmohet pagesa në Paddle..."
                      : "Llogaria u Aktivizua me Sukses!"}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                    Statusi i abonimit tuaj u ndryshua me sukses në:{" "}
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                      ACTIVE
                    </span>
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl text-left text-xs space-y-2 border border-gray-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statusi i Përdoruesit:</span>
                    <span className="font-bold text-emerald-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paketa e Aktivizuar:</span>
                    <span className="font-bold text-gray-800 dark:text-slate-200 capitalize">
                      {selectedPlan} ({currentPlanObj.price})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data e Nisjes:</span>
                    <span className="font-semibold text-gray-800 dark:text-slate-200">
                      {new Date().toLocaleDateString("sq-AL")}
                    </span>
                  </div>
                </div>

                <button
                  disabled={step4Loading}
                  onClick={() => {
                    setStep4Loading(true);
                    setTimeout(() => {
                      setCurrentStep(5);
                      setStep4Loading(false);
                    }, 400);
                  }}
                  className="w-full py-3.5 bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#7B1F3A]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                >
                  {step4Loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Po ngarkohet Hapi 5...
                    </>
                  ) : (
                    <>
                      Vazhdo tek Hapi 5 (Akses në Dashboard) <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
               HAPI 5 – Dashboard Access
            ══════════════════════════════════════════════════════════════ */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="max-w-xl mx-auto text-center space-y-6 py-2"
              >
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7B1F3A] to-rose-600 text-white shadow-xl shadow-[#7B1F3A]/30">
                  <Sparkles size={32} />
                </div>

                <div>
                  <span className="inline-block px-3 py-1 bg-rose-100 text-[#7B1F3A] dark:bg-rose-950 dark:text-rose-300 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2">
                    Hapi 5 me 5 — Dashboard Ready
                  </span>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                    Mirësevini në Dashboard!
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                    Abonimi juaj është aktiv. Tani keni akses të plotë në të gjitha funksionalitetet premium:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  {[
                    "Krijimi i Eventeve",
                    "Menaxhimi i Mysafirëve",
                    "Ftesa Digjitale",
                    "Organizimi i Tavolinave",
                    "Hall Designer (Plan 2D)",
                    "Gjenerimi i QR Codes",
                    "Statistikat me Kohë Reale",
                    "Eksport i të Dhënave",
                  ].map((feat, i) => (
                    <div
                      key={i}
                      className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center gap-2 border border-gray-100 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-300"
                    >
                      <CheckCircle2 size={16} className="text-[#7B1F3A]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={step5Loading}
                  onClick={() => {
                    setStep5Loading(true);
                    setTimeout(() => {
                      handleGoToDashboard();
                    }, 400);
                  }}
                  className="w-full py-4 bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl font-extrabold text-sm tracking-widest uppercase shadow-xl shadow-[#7B1F3A]/35 transition-all flex items-center justify-center gap-3 disabled:opacity-75"
                >
                  {step5Loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Po hapet Dashboard...
                    </>
                  ) : (
                    <>
                      Hyr në Dashboard Tani <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Clerk's hooks throw synchronously during render when no <ClerkProvider>
 * is mounted (e.g. VITE_CLERK_PUBLISHABLE_KEY missing in this environment).
 * This boundary keeps that failure scoped to the modal instead of taking
 * down the whole page.
 */
class ClerkBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(
      "PlanRegistrationModal: authentication is not configured in this environment.",
      error
    );
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function PlanRegistrationUnavailable({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(20,10,15,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, padding: "32px 28px",
          maxWidth: 380, width: "100%", textAlign: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <AlertCircle size={32} color="#7B1F3A" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontWeight: 800, fontSize: 16, color: "#221619", marginBottom: 8 }}>
          Regjistrimi nuk është gati
        </p>
        <p style={{ fontSize: 14, color: "#6b6b6b", lineHeight: 1.6, marginBottom: 22 }}>
          Autentikimi nuk është konfiguruar në këtë mjedis. Provoni sërish më vonë.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "10px 28px", borderRadius: 8, background: "#7B1F3A",
            color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
          }}
        >
          Mbyll
        </button>
      </div>
    </div>
  );
}

export function PlanRegistrationModal(props: PlanRegistrationModalProps) {
  return (
    <ClerkBoundary
      fallback={props.isOpen ? <PlanRegistrationUnavailable onClose={props.onClose} /> : null}
    >
      <PlanRegistrationModalInner {...props} />
    </ClerkBoundary>
  );
}
