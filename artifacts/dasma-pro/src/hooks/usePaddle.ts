import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

interface PaddleConfig {
  clientToken: string;
  priceIdBasic: string;
  priceIdPro: string;
  environment: "sandbox" | "production";
}

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [config, setConfig] = useState<PaddleConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const res = await fetch("/api/paddle/config", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load payment config");
        const cfg: PaddleConfig = await res.json();
        if (cancelled) return;
        setConfig(cfg);

        if (!cfg.clientToken) {
          setError("Paddle client token not configured");
          return;
        }

        const p = await initializePaddle({
          environment: cfg.environment ?? "sandbox",
          token: cfg.clientToken,
        });
        if (!cancelled && p) setPaddle(p);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to initialize payment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  return { paddle, config, loading, error };
}
