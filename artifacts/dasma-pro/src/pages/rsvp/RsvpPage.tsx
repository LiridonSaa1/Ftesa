import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useGetRsvp, useSubmitRsvp } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, X, MapPin, CalendarDays, Clock, Loader2, Shirt, Phone, Heart } from "lucide-react";
import { format } from "date-fns";
import { motion, useInView } from "framer-motion";

/* ─── Countdown ─────────────────────────────────────────── */
function useCountdown(dateStr?: string) {
  const [d, setD] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!dateStr) return;
    const target = new Date(dateStr + "T00:00:00");
    const tick = () => {
      const now = new Date();
      if (target <= now) return;
      const s = Math.floor((target.getTime() - now.getTime()) / 1000);
      setD({ days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dateStr]);
  return d;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Loading / Error screens ───────────────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Skeleton className="h-[60vh] w-full rounded-none" />
      <div className="max-w-4xl mx-auto w-full px-6 py-16 space-y-8">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────── */
export function RsvpPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const isDemo = token === "demo";

  const { data: rsvpData, isLoading, isError } = useGetRsvp(isDemo ? "demo" : token, {
    query: { enabled: !isDemo } as any
  });
  const submitRsvp = useSubmitRsvp();
  const [submitted, setSubmitted] = useState(false);
  const [rsvpResponse, setRsvpResponse] = useState<"confirmed" | "declined" | null>(null);

  const queryParams = new URLSearchParams(window.location.search);

  const demoRsvp = {
    guestName: queryParams.get("guestName") || "Mysafir i Nderuar",
    eventName: queryParams.get("coupleName") || "Alban & Zana",
    eventDate: queryParams.get("date") || "2026-08-15",
    eventTime: queryParams.get("time") || "19:00",
    venue: queryParams.get("venue") || "Salla e Dasmave 'Kështjella'",
    address: queryParams.get("address") || "Prishtinë, Kosovë",
    dressCode: queryParams.get("dressCode") || "Black Tie / Elegant",
    phoneContact: queryParams.get("phone") || "+383 49 123 456",
    invitation: {
      coupleName: queryParams.get("coupleName") || "Alban & Zana",
      message: queryParams.get("message") || "Me kënaqësi ju ftojmë të ndani gëzimin e kësaj dite të veçantë bashkë me ne!",
      couplePhoto: queryParams.get("couplePhoto") || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop",
      showCountdown: queryParams.get("showCountdown") !== "false",
      showMap: true,
      template: queryParams.get("template") || "classic",
    }
  };

  const rsvp = isDemo ? demoRsvp : rsvpData;

  const inv        = (rsvp as any)?.invitation;
  const eventDate  = (rsvp as any)?.eventDate;
  const countdown  = useCountdown(eventDate);

  const couplePhoto  = inv?.couplePhoto  || (rsvp as any)?.couplePhoto;
  const coupleName   = inv?.coupleName   || (rsvp as any)?.coupleName   || (rsvp as any)?.eventName  || "";
  const message      = inv?.message      || (rsvp as any)?.message      || "";
  const showCountdown = inv?.showCountdown ?? true;

  const guestName  = (rsvp as any)?.guestName || "";
  const venue      = (rsvp as any)?.venue     || "";
  const address    = (rsvp as any)?.address   || "";
  const time       = (rsvp as any)?.eventTime || "";
  const dressCode  = (rsvp as any)?.dressCode || "";
  const phone      = (rsvp as any)?.phoneContact || "";

  /* Dynamic theme based on template parameter with high-contrast color palettes */
  const templateKey = inv?.template || "classic";
  const THEMES: Record<string, { wine: string; cream: string; white: string; dark: string; font: string; isDarkTheme?: boolean }> = {
    classic: { wine: "#7B1F3A", cream: "#FDF8F3", white: "#FFFFFF", dark: "#1F191A", font: "Georgia, serif" },
    modern:  { wine: "#2563EB", cream: "#F8FAFC", white: "#FFFFFF", dark: "#0F172A", font: "Inter, sans-serif" },
    floral:  { wine: "#9D174D", cream: "#FFF1F2", white: "#FFFFFF", dark: "#4C0519", font: "Georgia, serif" },
    minimal: { wine: "#EAB308", cream: "#121214", white: "#1C1C21", dark: "#F4F4F5", font: "Inter, sans-serif", isDarkTheme: true },
    luxury:  { wine: "#D97706", cream: "#0A1326", white: "#111E38", dark: "#FDE68A", font: "Georgia, serif", isDarkTheme: true }
  };
  const theme = THEMES[templateKey] || THEMES.classic;
  const WINE   = theme.wine;
  const CREAM  = theme.cream;
  const WHITE  = theme.white;
  const DARK   = theme.dark;
  const isDark = !!theme.isDarkTheme;

  const handleRsvp = (attending: boolean) => {
    const resp = attending ? "confirmed" : "declined";
    submitRsvp.mutate(
      { token, data: { attending } },
      { onSuccess: () => { setRsvpResponse(resp); setSubmitted(true); } }
    );
  };

  if (isLoading) return <LoadingScreen />;

  if (isError || !rsvp) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <div className="text-center space-y-4 px-6">
          <div className="text-6xl">💌</div>
          <h2 className="font-serif text-3xl font-bold" style={{ color: DARK }}>Ftesa nuk u gjet</h2>
          <p style={{ color: isDark ? "#A1A1AA" : "#666" }}>Linku mund të jetë i pasaktë ose i skaduar.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: CREAM }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-sm px-6">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.45, delay: 0.1 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto"
            style={{ background: rsvpResponse === "confirmed" ? `${WINE}25` : (isDark ? "#27272A" : "#f3f4f6"), border: `2px solid ${rsvpResponse === "confirmed" ? WINE : "#d1d5db"}` }}
          >
            {rsvpResponse === "confirmed"
              ? <Heart className="h-10 w-10" style={{ color: WINE }} />
              : <X className="h-10 w-10 text-gray-400" />}
          </motion.div>
          <div>
            <h2 className="font-serif text-3xl font-bold" style={{ color: DARK }}>
              {rsvpResponse === "confirmed" ? "Faleminderit!" : "Mirëkuptojmë"}
            </h2>
            <p className="mt-3 leading-relaxed" style={{ color: isDark ? "#D4D4D8" : "#666" }}>
              {rsvpResponse === "confirmed"
                ? "Konfirmimi juaj u regjistrua. Presim me padurim ditën tonë të veçantë bashkë me ju!"
                : "Faleminderit për përgjigjen tuaj. Ju mbajmë gjithmonë në zemër!"}
            </p>
          </div>
          <p className="text-xs" style={{ color: isDark ? "#71717A" : "#aaa" }}>Powered by <strong style={{ color: WINE }}>NoaEvent</strong></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: WHITE, color: DARK }}>

      {/* ═══════════════════════════════════════════════════
          SECTION 1 — Hero (full-width photo + overlay + name)
      ═══════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "70vh" }}>
        {/* Photo or gradient fallback */}
        {couplePhoto ? (
          <img src={couplePhoto} alt="Couple" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${WINE} 0%, #111827 100%)` }} />
        )}

        {/* Semi-transparent overlay with fallback gradient */}
        <div className="absolute inset-0" style={{ background: isDark ? "rgba(10, 15, 30, 0.75)" : `${WINE}C8` }} />

        {/* Top nav bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-white opacity-80" />
          </div>
          <div className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.2em] text-white/80 font-medium">
            <a href="#details" className="hover:text-white transition-colors">Detajet</a>
            <a href="#rsvp" className="hover:text-white transition-colors">RSVP</a>
          </div>
          <div />
        </div>

        {/* Hero text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-start justify-end px-8 md:px-20 pb-16 pt-32"
          style={{ minHeight: "70vh" }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/80 font-bold mb-3">Ftesë Personale</p>
          <h1 className="font-bold text-white leading-tight mb-4 drop-shadow-md" style={{ fontSize: "clamp(2.2rem, 7vw, 5rem)", fontFamily: theme.font }}>
            {coupleName || "EMRI I ÇIFTIT"}
          </h1>

          {eventDate && (
            <p className="text-white/90 text-sm md:text-base tracking-widest mb-8 font-medium">
              {format(new Date(eventDate + "T00:00:00"), "dd · MM · yyyy").toUpperCase()}
            </p>
          )}

          {/* Countdown */}
          {showCountdown && eventDate && (
            <div className="inline-flex items-center gap-6 px-8 py-5 border border-white/40 bg-black/40 backdrop-blur-md rounded-2xl">
              {[
                { v: countdown.days,    l: "DITË"    },
                { v: countdown.hours,   l: "ORË"     },
                { v: countdown.minutes, l: "MIN"     },
                { v: countdown.seconds, l: "SEK"     },
              ].map(({ v, l }, i) => (
                <div key={l} className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white tabular-nums" style={{ fontFamily: theme.font }}>
                      {String(v).padStart(2, "0")}
                    </div>
                    <div className="text-[9px] tracking-[0.2em] text-white/70 font-semibold mt-0.5">{l}</div>
                  </div>
                  {i < 3 && <span className="text-white/40 text-xl font-light">:</span>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 2 — Welcome
      ═══════════════════════════════════════════════════ */}
      <section className="py-20" style={{ background: WHITE }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Photo left */}
            {couplePhoto && (
              <Reveal>
                <div className="relative">
                  <div className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl" style={{ background: `${WINE}25` }} />
                  <img
                    src={couplePhoto}
                    alt="Couple"
                    className="relative w-full object-cover rounded-2xl shadow-lg"
                    style={{ maxHeight: 480, objectPosition: "top" }}
                  />
                </div>
              </Reveal>
            )}

            {/* Text right */}
            <Reveal className={couplePhoto ? "" : "md:col-span-2 text-center max-w-2xl mx-auto"}>
              <p className="text-xs uppercase tracking-[0.25em] mb-4 font-bold" style={{ color: WINE }}>FTESË SPECIALE</p>
              <h2 className="font-bold leading-tight mb-6" style={{ fontFamily: theme.font, fontSize: "clamp(1.8rem, 4vw, 3rem)", color: DARK }}>
                Të nderuar<br />
                <span style={{ color: WINE }}>{guestName || "Mysafir"}</span>
              </h2>
              {message && (
                <>
                  <p className="leading-relaxed mb-4" style={{ color: isDark ? "#D4D4D8" : "#4B5563", fontSize: "1.05rem" }}>
                    {message}
                  </p>
                  <p className="leading-relaxed" style={{ color: isDark ? "#A1A1AA" : "#4B5563", fontSize: "1.05rem" }}>
                    Ju ftojmë të ndani gëzimin e kësaj dite të veçantë bashkë me ne.
                  </p>
                </>
              )}
              {!message && (
                <p className="leading-relaxed" style={{ color: isDark ? "#D4D4D8" : "#4B5563", fontSize: "1.05rem" }}>
                  Me kënaqësi të madhe ju ftojmë të ndani gëzimin e kësaj dite të veçantë bashkë me ne. Prania juaj do ta bëjë këtë moment edhe më të veçantë dhe të paharrueshëm.
                </p>
              )}

              <a
                href="#rsvp"
                className="inline-block mt-8 px-8 py-3.5 font-bold text-sm uppercase tracking-widest text-white rounded-xl shadow-md transition-all hover:opacity-90"
                style={{ background: WINE }}
              >
                Konfirmo Pjesëmarrjen →
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3 — Event Details (dark card LEFT + photo RIGHT)
          like: Gademan "Historie" section with dark card + b&w photo
      ═══════════════════════════════════════════════════ */}
      <section id="details" className="py-20 relative overflow-hidden" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-0 items-stretch">

            {/* Dark card left */}
            <Reveal>
              <div className="h-full p-10 md:p-14 flex flex-col justify-center space-y-8" style={{ background: WINE, color: WHITE, minHeight: 400 }}>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60 mb-3">DETAJET E EVENTIT</p>
                  <h2 className="font-bold text-3xl md:text-4xl text-white" style={{ fontFamily: "Georgia, serif" }}>
                    {coupleName}
                  </h2>
                </div>

                <div className="space-y-5">
                  {eventDate && (
                    <div className="flex items-center gap-4 text-sm">
                      <CalendarDays className="h-5 w-5 text-white/60 shrink-0" />
                      <span className="font-medium">{format(new Date(eventDate + "T00:00:00"), "EEEE, dd MMMM yyyy")}</span>
                    </div>
                  )}
                  {time && (
                    <div className="flex items-center gap-4 text-sm">
                      <Clock className="h-5 w-5 text-white/60 shrink-0" />
                      <span>Ora: <strong>{time}</strong></span>
                    </div>
                  )}
                  {venue && (
                    <div className="flex items-center gap-4 text-sm">
                      <MapPin className="h-5 w-5 text-white/60 shrink-0" />
                      <span>{venue}{address ? `, ${address}` : ""}</span>
                    </div>
                  )}
                  {dressCode && (
                    <div className="flex items-center gap-4 text-sm">
                      <Shirt className="h-5 w-5 text-white/60 shrink-0" />
                      <span>Dress code: <strong>{dressCode}</strong></span>
                    </div>
                  )}
                  {phone && (
                    <div className="flex items-center gap-4 text-sm">
                      <Phone className="h-5 w-5 text-white/60 shrink-0" />
                      <span>{phone}</span>
                    </div>
                  )}
                </div>

                <a
                  href="#rsvp"
                  className="inline-block border border-white/50 px-7 py-3 text-xs uppercase tracking-widest font-bold text-white hover:bg-white hover:text-[#7B1F3A] transition-all self-start"
                >
                  Konfirmo Tani →
                </a>
              </div>
            </Reveal>

            {/* Photo right */}
            {couplePhoto ? (
              <Reveal>
                <img
                  src={couplePhoto}
                  alt="Event"
                  className="w-full h-full object-cover"
                  style={{ minHeight: 400 }}
                />
              </Reveal>
            ) : (
              <Reveal>
                <div
                  className="w-full flex items-center justify-center"
                  style={{ minHeight: 400, background: `${WINE}15` }}
                >
                  <Heart className="h-20 w-20 opacity-20" style={{ color: WINE }} />
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 4 — RSVP (two large cards, like "Smaken" section)
      ═══════════════════════════════════════════════════ */}
      <section id="rsvp" className="py-24" style={{ background: WHITE }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <Reveal className="text-center mb-16 space-y-3">
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: WINE }}>RSVP</p>
            <h2 className="font-bold text-4xl md:text-5xl" style={{ fontFamily: "Georgia, serif", color: DARK }}>
              A do të vini?
            </h2>
            <p style={{ color: "#888" }}>Ju lutem konfirmoni pjesëmarrjen tuaj</p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
            {/* YES card — like Gademan product card with image */}
            <Reveal>
              <button
                onClick={() => handleRsvp(true)}
                disabled={submitRsvp.isPending}
                className="w-full group text-left border-2 transition-all duration-300 overflow-hidden hover:-translate-y-1"
                style={{ borderColor: `${WINE}30` }}
              >
                {/* Card image area */}
                {couplePhoto ? (
                  <div className="relative overflow-hidden" style={{ height: 220 }}>
                    <img src={couplePhoto} alt="Yes" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: `${WINE}50` }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 className="h-14 w-14 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center" style={{ height: 220, background: `${WINE}10` }}>
                    <CheckCircle2 className="h-14 w-14" style={{ color: WINE }} />
                  </div>
                )}
                <div className="p-8 text-center" style={{ background: WHITE }}>
                  <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "Georgia, serif", color: DARK }}>
                    Po, do të vij
                  </h3>
                  <p style={{ color: "#888", fontSize: "0.9rem" }}>Do të jem i/e pranishëm/e</p>
                  <div
                    className="mt-5 w-full py-3 text-xs uppercase tracking-widest font-bold text-white transition-opacity"
                    style={{ background: WINE }}
                  >
                    {submitRsvp.isPending ? "Duke dërguar..." : "Konfirmo →"}
                  </div>
                </div>
              </button>
            </Reveal>

            {/* NO card */}
            <Reveal>
              <button
                onClick={() => handleRsvp(false)}
                disabled={submitRsvp.isPending}
                className="w-full group text-left border-2 transition-all duration-300 overflow-hidden hover:-translate-y-1"
                style={{ borderColor: "#e5e7eb" }}
              >
                <div className="flex items-center justify-center" style={{ height: 220, background: "#f9fafb" }}>
                  <X className="h-14 w-14 text-gray-300" />
                </div>
                <div className="p-8 text-center" style={{ background: WHITE }}>
                  <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "Georgia, serif", color: DARK }}>
                    Jo, nuk vij
                  </h3>
                  <p style={{ color: "#888", fontSize: "0.9rem" }}>Nuk do të jem i/e pranishëm/e</p>
                  <div
                    className="mt-5 w-full py-3 text-xs uppercase tracking-widest font-bold text-gray-600 border transition-colors"
                    style={{ borderColor: "#e5e7eb" }}
                  >
                    Refuzo
                  </div>
                </div>
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER — dark maroon like Gademan footer
      ═══════════════════════════════════════════════════ */}
      <footer style={{ background: CREAM, borderTop: `1px solid ${WINE}20` }}>
        {/* Ice cream row → here: couple photo strip */}
        {couplePhoto && (
          <div className="w-full overflow-hidden" style={{ height: 80 }}>
            <img src={couplePhoto} alt="" className="w-full h-full object-cover object-top opacity-60" />
          </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            <div>
              <h3 className="font-bold text-xl mb-2" style={{ fontFamily: "Georgia, serif", color: DARK }}>{coupleName}</h3>
              {venue && <p className="text-sm" style={{ color: "#666" }}>{venue}{address ? `, ${address}` : ""}</p>}
              {phone && <p className="text-sm mt-1" style={{ color: "#666" }}>Tel: {phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#aaa" }}>Organizuar me</p>
              <p className="font-bold" style={{ color: WINE, fontFamily: "Georgia, serif", fontSize: "1.2rem" }}>NoaEvent</p>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: `${WINE}20`, color: "#aaa" }}>
            <p>© {new Date().getFullYear()} {coupleName}. Të gjitha të drejtat e rezervuara.</p>
            <p>Powered by <strong style={{ color: WINE }}>NoaEvent</strong></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
