import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useGetRsvp, useSubmitRsvp } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, X, MapPin, CalendarDays, Clock,
  Loader2, Heart, Shirt, Phone,
} from "lucide-react";
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Countdown ─────────────────────────────────────────── */
function useCountdown(dateStr?: string) {
  const [diff, setDiff] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!dateStr) return;
    const target = new Date(dateStr + "T00:00:00");
    const tick = () => {
      const now = new Date();
      if (target <= now) { setDiff({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      const totalSec = Math.floor((target.getTime() - now.getTime()) / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      setDiff({ days, hours, minutes, seconds });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dateStr]);
  return diff;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl md:text-4xl font-serif font-bold text-white leading-none tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-1">{label}</span>
    </div>
  );
}

/* ─── Templates ─────────────────────────────────────────── */
const TEMPLATE_STYLES: Record<string, { accent: string; bg: string; overlay: string }> = {
  classic:    { accent: "#C9A96E", bg: "#FEFAF5", overlay: "rgba(20,10,5,0.55)"  },
  modern:     { accent: "#C94B6E", bg: "#171215", overlay: "rgba(23,18,21,0.60)" },
  floral:     { accent: "#A855B5", bg: "#FDF4FF", overlay: "rgba(40,15,50,0.55)" },
  minimalist: { accent: "#64748b", bg: "#f8fafc", overlay: "rgba(15,20,30,0.55)" },
  luxury:     { accent: "#D4AF37", bg: "#0a0a0a", overlay: "rgba(10,8,0,0.60)"   },
};

/* ─── Main page ─────────────────────────────────────────── */
export function RsvpPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const { data: rsvp, isLoading, isError } = useGetRsvp(token);
  const submitRsvp = useSubmitRsvp();
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState<"confirmed" | "declined" | null>(null);

  const inv = (rsvp as any)?.invitation;
  const event = (rsvp as any)?.event ?? rsvp;
  const guest = (rsvp as any)?.guest;

  const template = inv?.template ?? "classic";
  const style = TEMPLATE_STYLES[template] ?? TEMPLATE_STYLES.classic;

  const eventDate: string | undefined =
    (rsvp as any)?.eventDate ?? event?.date;

  const countdown = useCountdown(eventDate);

  const handleRsvp = (attending: boolean) => {
    const resp = attending ? "confirmed" : "declined";
    submitRsvp.mutate(
      { token, data: { attending } },
      {
        onSuccess: () => {
          setResponse(resp);
          setSubmitted(true);
        },
      }
    );
  };

  /* Loading */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FEFAF5]">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-80 w-full rounded-none" />
          <Skeleton className="h-48 w-full rounded-none" />
        </div>
      </div>
    );
  }

  /* Error */
  if (isError || !rsvp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: style.bg }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-xs"
        >
          <div className="text-5xl">💌</div>
          <h2 className="font-serif text-2xl font-bold">Ftesa nuk u gjet</h2>
          <p className="text-muted-foreground text-sm">Linku mund të jetë i pasaktë ose i skaduar.</p>
        </motion.div>
      </div>
    );
  }

  /* Thank-you screen */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: style.bg }}>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-sm px-4"
          >
            {response === "confirmed" ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto"
                  style={{ background: `${style.accent}20`, border: `2px solid ${style.accent}40` }}
                >
                  <Heart className="h-10 w-10" style={{ color: style.accent }} />
                </motion.div>
                <div>
                  <h2 className="font-serif text-3xl font-bold">Faleminderit!</h2>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    Konfirmimi juaj u regjistrua. Presim me padurim t'ju shohim në ditën tonë të veçantë!
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mx-auto bg-gray-100">
                  <X className="h-10 w-10 text-gray-400" />
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-bold">Mirëkuptojmë</h2>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    Faleminderit për përgjigjen tuaj. Ju mbajmë në zemër!
                  </p>
                </div>
              </>
            )}
            <p className="text-xs text-muted-foreground pt-4">
              Powered by <span className="font-semibold" style={{ color: style.accent }}>NoaEvent</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  const coupleName   = (rsvp as any).coupleName   ?? inv?.coupleName   ?? (rsvp as any).eventName;
  const message      = (rsvp as any).message       ?? inv?.message;
  const couplePhoto  = (rsvp as any).couplePhoto   ?? inv?.couplePhoto;
  const showCountdown = inv?.showCountdown ?? true;

  const guestFirstName = (rsvp as any).guestName ?? `${guest?.firstName ?? ""} ${guest?.lastName ?? ""}`.trim();

  const venue    = (rsvp as any).venue    ?? event?.venue;
  const address  = (rsvp as any).address  ?? event?.address;
  const time     = (rsvp as any).eventTime ?? event?.time;
  const dressCode = (rsvp as any).dressCode ?? event?.dressCode;
  const phone    = (rsvp as any).phoneContact ?? event?.phoneContact;

  return (
    <div className="min-h-screen" style={{ background: style.bg, color: "#1a1a1a" }}>

      {/* ── Hero photo ───────────────────────────────────── */}
      <div className="relative w-full" style={{ minHeight: "55vh" }}>
        {couplePhoto ? (
          <img
            src={couplePhoto}
            alt="Couple"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Fallback gradient background when no photo */
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${style.accent}60 0%, ${style.accent}20 50%, #1a0a10 100%)`,
            }}
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: style.overlay }} />

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20"
          style={{ minHeight: "55vh" }}
        >
          {/* Decorative line */}
          <div className="w-12 h-[1px] mb-6" style={{ background: style.accent }} />

          <p className="text-[11px] uppercase tracking-[0.25em] text-white/60 mb-3">Ftesë e Personalizuar</p>

          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
            {coupleName}
          </h1>

          {eventDate && (
            <p className="text-white/70 text-sm tracking-wide">
              {format(new Date(eventDate + "T00:00:00"), "dd · MM · yyyy")}
            </p>
          )}

          {/* Countdown */}
          {showCountdown && eventDate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex items-center gap-8"
            >
              <CountdownUnit value={countdown.days}    label="Ditë"    />
              <span className="text-white/30 text-2xl font-light pb-4">:</span>
              <CountdownUnit value={countdown.hours}   label="Orë"     />
              <span className="text-white/30 text-2xl font-light pb-4">:</span>
              <CountdownUnit value={countdown.minutes} label="Min"     />
              <span className="text-white/30 text-2xl font-light pb-4">:</span>
              <CountdownUnit value={countdown.seconds} label="Sek"     />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Invitation card ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-lg mx-auto px-4 -mt-6 pb-16 relative z-20"
      >
        <div
          className="rounded-none shadow-2xl overflow-hidden border"
          style={{ background: "white", borderColor: `${style.accent}30` }}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${style.accent}, transparent)` }} />

          <div className="p-8 md:p-10 space-y-8">

            {/* Greeting */}
            <div className="text-center space-y-1 pb-6 border-b" style={{ borderColor: `${style.accent}20` }}>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Të nderuar</p>
              <p className="font-serif text-2xl font-semibold text-gray-900">{guestFirstName}</p>
            </div>

            {/* Personal message */}
            {message && (
              <div className="text-center py-2">
                <p
                  className="font-serif text-base leading-relaxed italic text-gray-600"
                  style={{ borderLeft: `3px solid ${style.accent}`, paddingLeft: "1rem", textAlign: "left" }}
                >
                  "{message}"
                </p>
              </div>
            )}

            {/* Event details */}
            <div
              className="space-y-4 rounded-none p-5"
              style={{ background: `${style.accent}08`, border: `1px solid ${style.accent}20` }}
            >
              {eventDate && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <CalendarDays className="h-4 w-4 shrink-0" style={{ color: style.accent }} />
                  <span className="font-medium">
                    {format(new Date(eventDate + "T00:00:00"), "EEEE, dd MMMM yyyy")}
                  </span>
                </div>
              )}
              {time && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock className="h-4 w-4 shrink-0" style={{ color: style.accent }} />
                  <span>{time}</span>
                </div>
              )}
              {venue && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: style.accent }} />
                  <span>{venue}{address ? `, ${address}` : ""}</span>
                </div>
              )}
              {dressCode && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Shirt className="h-4 w-4 shrink-0" style={{ color: style.accent }} />
                  <span>Dress code: <span className="font-medium">{dressCode}</span></span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Phone className="h-4 w-4 shrink-0" style={{ color: style.accent }} />
                  <span>{phone}</span>
                </div>
              )}
            </div>

            {/* RSVP section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px]" style={{ background: `${style.accent}30` }} />
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">A do të vini?</p>
                <div className="flex-1 h-[1px]" style={{ background: `${style.accent}30` }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleRsvp(true)}
                  disabled={submitRsvp.isPending}
                  className="h-14 text-sm font-semibold tracking-wide rounded-none"
                  style={{ background: style.accent, color: "white" }}
                >
                  {submitRsvp.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><CheckCircle2 className="h-4 w-4 mr-2" /> Po, do të vij</>
                  }
                </Button>
                <Button
                  onClick={() => handleRsvp(false)}
                  disabled={submitRsvp.isPending}
                  variant="outline"
                  className="h-14 text-sm rounded-none border-2"
                  style={{ borderColor: `${style.accent}40`, color: "#555" }}
                >
                  <X className="h-4 w-4 mr-2" /> Nuk vij
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom accent bar */}
          <div className="h-[1px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${style.accent}, transparent)` }} />
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-6 tracking-wide">
          Powered by <span className="font-semibold" style={{ color: style.accent }}>NoaEvent</span>
        </p>
      </motion.div>
    </div>
  );
}
