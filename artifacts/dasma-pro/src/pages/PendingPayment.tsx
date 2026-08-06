import { useState, useEffect } from "react";
import { useUser } from "@clerk/react";
import { usePaddle } from "@/hooks/usePaddle";
import { Check, Sparkles, Crown, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

const WINE = "#7B1F3A";
const WHITE = "#FFFFFF";
const CREAM = "#FAF8F5";
const DARK = "#2d1a1f";
const MUTED = "#6b6b6b";

const PLAN_DATA = {
  basic: {
    key: "basic",
    name: "Basic",
    price: "€10",
    period: "/muaj",
    icon: <Sparkles size={22} color={WINE} />,
    features: [
      "1 organizim (1 event)",
      "Menaxhim mysafirësh",
      "Ftesa digjitale",
      "QR Code check-in",
      "Dashboard statistika",
    ],
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: "€50",
    period: "/muaj",
    icon: <Crown size={22} color={WINE} />,
    features: [
      "Deri në 11 organizime",
      "Të gjitha funksionet",
      "Hall Designer Premium",
      "QR check-in avancuar",
      "Import CSV / Eksport PDF",
      "Seat Planner",
    ],
  },
};

export function PendingPayment() {
  const { user } = useUser();
  const { paddle, config, loading: paddleLoading, error: paddleError } = usePaddle();
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">("basic");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("paddle_selected_plan");
    if (stored === "basic" || stored === "pro") setSelectedPlan(stored);
  }, []);

  const plan = PLAN_DATA[selectedPlan];

  const handlePay = () => {
    if (!paddle || !config) return;
    const priceId = selectedPlan === "pro" ? config.priceIdPro : config.priceIdBasic;
    if (!priceId) {
      alert("Paddle price ID not configured. Please contact support.");
      return;
    }
    setCheckoutLoading(true);
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: user?.primaryEmailAddress?.emailAddress
        ? { email: user.primaryEmailAddress.emailAddress }
        : undefined,
      customData: { userId: user?.id ?? "" },
      settings: {
        successUrl: `${window.location.origin}/checkout/success`,
        displayMode: "overlay",
        theme: "light",
      },
    });
    setCheckoutLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: CREAM,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 40 }}
      >
        <img src="/logo-full.png" alt="NoaEvent" style={{ height: 80, objectFit: "contain" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ width: "100%", maxWidth: 560 }}
      >
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontWeight: 900,
              fontSize: 28,
              color: DARK,
              marginBottom: 8,
              fontFamily: "Georgia, serif",
            }}
          >
            Zgjidhni Paketën Tuaj
          </h1>
          <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7 }}>
            Aktivizoni llogarinë duke zgjedhur paketën dhe duke përfunduar pagesën.
          </p>
        </div>

        {/* Plan switcher */}
        <div
          style={{
            display: "flex",
            background: "#ede8e2",
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
            gap: 4,
          }}
        >
          {(["basic", "pro"] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSelectedPlan(key);
                localStorage.setItem("paddle_selected_plan", key);
              }}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                transition: "all .2s",
                background: selectedPlan === key ? WHITE : "transparent",
                color: selectedPlan === key ? WINE : MUTED,
                boxShadow: selectedPlan === key ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {PLAN_DATA[key].name} — {PLAN_DATA[key].price}
            </button>
          ))}
        </div>

        {/* Plan card */}
        <div
          style={{
            background: WHITE,
            border: `2px solid ${WINE}`,
            borderRadius: 12,
            padding: "32px 36px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {plan.icon}
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, color: DARK, fontFamily: "Georgia, serif" }}>
                {plan.name}
              </div>
              <div style={{ color: MUTED, fontSize: 13 }}>Paketa e zgjedhur</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <span style={{ fontWeight: 900, fontSize: 30, color: DARK, fontFamily: "Georgia, serif" }}>
                {plan.price}
              </span>
              <span style={{ fontSize: 13, color: MUTED }}>{plan.period}</span>
            </div>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {plan.features.map((f) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 0",
                  fontSize: 14,
                  color: DARK,
                }}
              >
                <Check size={14} color={WINE} strokeWidth={2.5} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pay button */}
        {paddleError ? (
          <div
            style={{
              background: "#fff3f3",
              border: "1px solid #f5c6cb",
              borderRadius: 8,
              padding: 16,
              color: "#7b1f1f",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Gabim duke ngarkuar sistemin e pagesës: {paddleError}
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: paddleLoading ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePay}
            disabled={paddleLoading || checkoutLoading || !paddle}
            style={{
              width: "100%",
              padding: "15px",
              background: paddleLoading || !paddle ? "#c4a0a8" : WINE,
              color: WHITE,
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.05em",
              cursor: paddleLoading || !paddle ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "background .2s",
            }}
          >
            {paddleLoading ? (
              <>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid white",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Duke ngarkuar...
              </>
            ) : (
              <>
                Paguaj me Paddle
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        )}

        {/* Security note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
            color: MUTED,
            fontSize: 12,
          }}
        >
          <Shield size={13} />
          Pagesa sigurohet nga Paddle — kartela juaj nuk ruhet tek ne.
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
