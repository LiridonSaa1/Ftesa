import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const WINE = "#7B1F3A";
const WHITE = "#FFFFFF";
const CREAM = "#FAF8F5";
const DARK = "#2d1a1f";
const MUTED = "#6b6b6b";

export function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Clear stored plan selection
    localStorage.removeItem("paddle_selected_plan");
    // Invalidate user status cache so SubscriptionGuard re-fetches
    queryClient.invalidateQueries({ queryKey: ["user-status"] });
  }, [queryClient]);

  const goToDashboard = () => setLocation("/dashboard");

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
          eventit tuaj me NoaEvent.
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={goToDashboard}
          style={{
            width: "100%",
            padding: "14px",
            background: WINE,
            color: WHITE,
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "0.05em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          Hyr në Dashboard
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>

      <p style={{ marginTop: 24, color: MUTED, fontSize: 13 }}>
        Konfirmimi dërgohet në emailin tuaj.
      </p>
    </div>
  );
}
