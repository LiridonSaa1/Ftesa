import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const WINE = "#7B1F3A";
const WHITE = "#FFFFFF";
const CREAM = "#FAF8F5";
const DARK = "#2d1a1f";
const MUTED = "#6b6b6b";

type ActivationStatus = "pending" | "active" | "timeout";

const MAX_POLLS = 20;   // 20 × 3s = 60 seconds max
const POLL_MS   = 3000;

export function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activationStatus, setActivationStatus] = useState<ActivationStatus>("pending");
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    localStorage.removeItem("paddle_selected_plan");

    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json() as { status: string };
          if (data.status === "active") {
            // Invalidate all user/subscription caches
            queryClient.invalidateQueries({ queryKey: ["user-status"] });
            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
            setActivationStatus("active");
            return;
          }
        }
      } catch {
        // Network error — keep polling
      }

      setPollCount((c) => {
        const next = c + 1;
        if (next >= MAX_POLLS) {
          setActivationStatus("timeout");
        } else {
          timeoutId = setTimeout(poll, POLL_MS);
        }
        return next;
      });
    }

    // Start polling after a short delay (give Paddle webhook time to arrive)
    timeoutId = setTimeout(poll, 1500);

    return () => clearTimeout(timeoutId);
  }, [queryClient]);

  const goToDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ["user-status"] });
    setLocation("/dashboard");
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
        style={{ marginBottom: 48 }}
      >
        <img src="/logo-full.png" alt="NoaEvent" style={{ height: 80, objectFit: "contain" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: WHITE,
          border: `2px solid ${WINE}`,
          borderRadius: 16,
          padding: "48px 40px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(123,31,58,0.08)",
            marginBottom: 24,
          }}
        >
          <CheckCircle size={44} color={WINE} strokeWidth={1.5} />
        </motion.div>

        <h1
          style={{
            fontWeight: 900,
            fontSize: 26,
            color: DARK,
            marginBottom: 12,
            fontFamily: "Georgia, serif",
          }}
        >
          Pagesa U Krye Me Sukses!
        </h1>
        <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.8, marginBottom: 32 }}>
          Llogaria juaj është aktivizuar. Tani mund të filloni të organizoni
          eventin tuaj me NoaEvent.
        </p>

        {/* Activation status */}
        {activationStatus === "pending" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "12px 20px",
              background: "rgba(123,31,58,0.05)",
              borderRadius: 8,
              marginBottom: 20,
              color: MUTED,
              fontSize: 14,
            }}
          >
            <Loader2 size={16} color={WINE} style={{ animation: "spin 1s linear infinite" }} />
            Duke aktivizuar llogarinë tuaj...
          </div>
        )}

        {activationStatus === "timeout" && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 16px",
              background: "#fff8f0",
              border: "1px solid #f5d0a9",
              borderRadius: 8,
              marginBottom: 20,
              color: "#92400e",
              fontSize: 13,
              textAlign: "left",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Aktivizimi po merr kohë. Kliko butonin poshtë — nëse abonimi u aktivizua,
              do të hyni direkt. Kontaktoni support@noa-event.com nëse problemi vazhdon.
            </span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goToDashboard}
          disabled={activationStatus === "pending"}
          style={{
            width: "100%",
            padding: "14px",
            background: activationStatus === "pending" ? "#c4a0a8" : WINE,
            color: WHITE,
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "0.05em",
            cursor: activationStatus === "pending" ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "background 0.2s",
          }}
        >
          {activationStatus === "active" ? "Hyr në Dashboard" : activationStatus === "timeout" ? "Provo Hyrjen" : "Duke pritur aktivizimin..."}
          {activationStatus !== "pending" && <ArrowRight size={16} />}
        </motion.button>
      </motion.div>

      <p style={{ marginTop: 24, color: MUTED, fontSize: 13 }}>
        Konfirmimi dërgohet në emailin tuaj.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
