/**
 * NoaEvent Landing Page
 * Design: pixel-perfect port of gademangelato.nl layout
 * All sections, animations, and color palette match the reference exactly.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  MapPin, Mail, Heart, Facebook, Instagram, Check,
  ChevronLeft, ChevronRight, Star,
} from "lucide-react";

/* ─── Palette (exact Gademan) ──────────────────────────── */
const WINE      = "#7B1F3A";
const WINE_DARK = "#5e1729";
const WHITE     = "#FFFFFF";
const CREAM     = "#FAF8F5";
const DARK      = "#2d1a1f";
const MUTED     = "#6b6b6b";
const TOPBG     = "#1a0a10";

/* ─── Fade-up reveal on scroll ─────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOP BAR — exact Gademan dark info bar
═══════════════════════════════════════════════════════════ */
function TopBar() {
  return (
    <div
      style={{
        background: TOPBG,
        color: "rgba(255,255,255,0.72)",
        fontSize: 12.5,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "8px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <MapPin size={12} strokeWidth={1.8} />
          Prishtinë 10000, Kosovë
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Mail size={12} strokeWidth={1.8} />
          info@noa-event.com
        </span>
      </div>
      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link href="/sign-up">
          <span style={{ cursor: "pointer", transition: "color .15s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = WHITE)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)")}>
            Bëhu Klient?
          </span>
        </Link>
        <Link href="/sign-in">
          <span style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "color .15s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = WHITE)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)")}>
            <Heart size={12} strokeWidth={1.8} /> Llogaria
          </span>
        </Link>
        <Facebook size={12} strokeWidth={1.8} style={{ cursor: "pointer", opacity: 0.72 }} />
      </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR — pixel-perfect Gademan header
   • WHITE bg, 100px tall
   • Large stamp logo LEFT — 136px circle, protrudes 18px each side
   • Nav links centered — dark, medium weight, spaced
   • "Bëhu Klient?" pill button RIGHT — wine bg, white text
═══════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { href: "#home",     label: "HOME"      },
  { href: "#services", label: "SHËRBIMET" },
  { href: "#hall",     label: "SALLA"     },
  { href: "#contact",  label: "KONTAKT"   },
  { href: "#order",    label: "ÇMIMET"    },
];

/* Logo */
function StampLogo() {
  return (
    <img
      src="/logo-full.png"
      alt="NoaEvent"
      style={{ height: 80, width: "auto", flexShrink: 0, objectFit: "contain" }}
    />
  );
}

function Navbar() {
  const [active, setActive] = useState("#home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: WHITE,
        borderBottom: "1px solid #ede7e0",
        boxShadow: scrolled ? "0 2px 18px rgba(0,0,0,0.07)" : "none",
        transition: "box-shadow .3s",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 48px",
          /* Nav height = 100px; logo = 136px → protrudes 18px top + 18px bottom */
          height: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* ── Logo ── */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <StampLogo />
        </div>

        {/* ── Nav links — centered ── */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = active === href;
            return (
              <a
                key={href}
                href={href}
                onClick={() => setActive(href)}
                style={{
                  fontSize: 13.5, fontWeight: 600, letterSpacing: "0.07em",
                  color: "#3a2020",
                  textDecoration: isActive ? "underline" : "none",
                  textUnderlineOffset: 6, textDecorationThickness: "2px",
                  textDecorationColor: "#3a2020",
                  cursor: "pointer", whiteSpace: "nowrap", transition: "color .15s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = WINE)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "#3a2020")}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* ── "Bëhu Klient?" — pill button, wine bg, white text ── */}
        <Link href="/sign-up">
          <motion.span
            whileHover={{ backgroundColor: WINE_DARK }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-block",
              background: WINE,
              color: WHITE,
              padding: "12px 28px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background .18s",
            }}
          >
            Bëhu Klient?
          </motion.span>
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO CAROUSEL — wine bg, text LEFT, image RIGHT
   Auto-advances every 5s, smooth slide + fade animation,
   prev/next arrows, dot indicators
═══════════════════════════════════════════════════════════ */
const HERO_SLIDES = [
  {
    title: "MIRË ERDHËT NË\nNOAEVENT",
    sub: "Platforma Premium e Dasmave & Eventeve në Kosovë",
    img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1800&q=90",
    cta: "Bëhu Klient?",
  },
  {
    title: "FTESA\nDIGJITALE",
    sub: "Krijoni ftesa elegante me foto çifti, countdown dhe RSVP automatik",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1800&q=90",
    cta: "Shiko Shërbimin",
  },
  {
    title: "HALL\nDESIGNER",
    sub: "Planifikoni sallën tuaj vizualisht — drag & drop, tavolina, VIP zona",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1800&q=90",
    cta: "Krijo Planin",
  },
  {
    title: "QR CHECK-IN\nAUTOMATIK",
    sub: "Mysafirët skanojnë dhe hyjnë pa pritje — modern, i shpejtë, elegant",
    img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1800&q=90",
    cta: "Mëso Më Shumë",
  },
];

function Hero() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = HERO_SLIDES.length;

  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setCurrent(c => (c + 1) % total);
    }, 6000);
    return () => clearInterval(t);
  }, [total]);

  const go = (next: number) => {
    setDirection(next > current ? 1 : -1);
    setCurrent((next + total) % total);
  };

  return (
    <section
      id="home"
      style={{ position: "relative", width: "100%", overflow: "hidden", height: "calc(100vh - 130px)", display: "flex", flexDirection: "column" }}
    >
      {/* ── Full-screen background images (Ken Burns zoom) ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        >
          <img
            src={HERO_SLIDES[current].img}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Dark gradient overlay — bottom-heavy for text readability ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "linear-gradient(to right, rgba(20,5,10,0.78) 0%, rgba(20,5,10,0.45) 60%, rgba(20,5,10,0.10) 100%)",
        }}
      />
      {/* Extra bottom gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: "linear-gradient(to top, rgba(10,2,5,0.55) 0%, transparent 50%)",
        }}
      />

      {/* ── Slide text — left-aligned, vertically centered ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "0 0 60px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`text-${current}`}
            custom={direction}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 640 }}
          >
            {/* Slide number indicator */}
            <p style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}>
              0{current + 1} — 0{total}
            </p>

            <h1
              style={{
                color: WHITE,
                fontWeight: 900,
                fontSize: "clamp(2.6rem, 5vw, 4.4rem)",
                letterSpacing: "0.03em",
                lineHeight: 1.12,
                textTransform: "uppercase",
                marginBottom: 20,
                whiteSpace: "pre-line",
                textShadow: "0 2px 24px rgba(0,0,0,0.4)",
              }}
            >
              {HERO_SLIDES[current].title}
            </h1>

            <p style={{
              color: "rgba(255,255,255,0.80)",
              fontSize: 17,
              lineHeight: 1.65,
              marginBottom: 40,
              maxWidth: 480,
              fontWeight: 400,
            }}>
              {HERO_SLIDES[current].sub}
            </p>

            <Link href="/sign-up">
              <motion.span
                whileHover={{ backgroundColor: WHITE, color: WINE }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-block",
                  background: "transparent",
                  color: WHITE,
                  padding: "14px 36px",
                  borderRadius: 6,
                  border: `2px solid ${WHITE}`,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "background .22s, color .22s",
                  textTransform: "uppercase",
                }}
              >
                {HERO_SLIDES[current].cta}
              </motion.span>
            </Link>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {/* ── Prev arrow ── */}
      <button
        onClick={() => go(current - 1)}
        style={{
          position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.30)",
          borderRadius: "50%", width: 48, height: 48,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: WHITE, zIndex: 10, transition: "background .2s",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.24)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)")}
      >
        <ChevronLeft size={22} />
      </button>

      {/* ── Next arrow ── */}
      <button
        onClick={() => go(current + 1)}
        style={{
          position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.30)",
          borderRadius: "50%", width: 48, height: 48,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: WHITE, zIndex: 10, transition: "background .2s",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.24)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)")}
      >
        <ChevronRight size={22} />
      </button>

      {/* ── Dot indicators — bottom center ── */}
      <div style={{
        position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 10, zIndex: 10,
      }}>
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            style={{
              width: i === current ? 32 : 10,
              height: 10,
              borderRadius: 5,
              background: i === current ? WHITE : "rgba(255,255,255,0.35)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all .4s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        ))}
      </div>

      {/* ── Thin progress bar ── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.15)", zIndex: 10 }}>
        <motion.div
          key={`prog-${current}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, ease: "linear" }}
          style={{ height: "100%", background: WINE }}
        />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHILOSOPHY — super-designed split section with animations
═══════════════════════════════════════════════════════════ */
const PILLARS = [
  {
    num: "01",
    title: "Cilësi e Lartë & Shije Konstante",
    body: "Çdo detaj planifikohet me kujdes ekstrem — nga ftesat deri tek vendosja e mysafirëve.",
  },
  {
    num: "02",
    title: "Higjenë dhe Profesionalizëm",
    body: "Punojmë me standarde strikte dhe teknologji moderne për një event pa asnjë problem.",
  },
  {
    num: "03",
    title: "Personalizim & Orientim kah Klienti",
    body: "Besojmë në transparencë dhe bashkëpunim — çdo organizator mund të mbështetet tek ne.",
  },
  {
    num: "04",
    title: "Pasion për Artin e Eventit",
    body: "Dashuria jonë për evente të veçanta pasqyrohet në çdo produkt — i sinqertë, artizanal dhe me histori.",
  },
];

function WelcomeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: false, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      style={{ background: CREAM, padding: "0", overflow: "hidden", position: "relative" }}
    >
      {/* Subtle dot-grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(circle, rgba(123,31,58,0.07) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 1280, margin: "0 auto",
        padding: "0 0 0 0",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: 720,
      }}>

        {/* ── LEFT: Layered image composition ── */}
        <div style={{ position: "relative", overflow: "hidden", minHeight: 720 }}>
          {/* Main full-bleed image */}
          <motion.div
            initial={{ scale: 1.08 }}
            animate={inView ? { scale: 1 } : { scale: 1.08 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            <img
              src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=90"
              alt="Dasma me dashuri"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Gradient overlay right side for blending */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, transparent 55%, rgba(250,248,245,0.95) 100%)",
            }} />
          </motion.div>

          {/* Floating stats badge — bottom left */}
          <motion.div
            initial={{ opacity: 0, y: 32, x: -20 }}
            animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", bottom: 48, left: 40,
              background: WHITE,
              borderRadius: 16,
              padding: "20px 28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
              border: `1px solid rgba(123,31,58,0.12)`,
              backdropFilter: "blur(8px)",
              display: "flex", gap: 32,
            }}
          >
            {[
              { val: "200+", label: "Dasma" },
              { val: "99%", label: "Kënaqësi" },
              { val: "5★", label: "Vlerësim" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.65 + i * 0.1, duration: 0.5 }}
                style={{ textAlign: "center" }}
              >
                <p style={{ fontSize: 22, fontWeight: 900, color: WINE, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{s.val}</p>
                <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 3 }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Decorative wine ring — top right of image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
            animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.3, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", top: 36, right: 28,
              width: 100, height: 100,
              borderRadius: "50%",
              border: `2.5px solid ${WINE}`,
              opacity: 0.25,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: 30 }}
            animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.4, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", top: 56, right: 48,
              width: 60, height: 60,
              borderRadius: "50%",
              border: `1.5px solid ${WINE}`,
              opacity: 0.18,
            }}
          />
        </div>

        {/* ── RIGHT: Text content ── */}
        <div style={{
          padding: "96px 72px 96px 64px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          background: CREAM,
        }}>

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: 11, fontWeight: 800, letterSpacing: "0.22em",
              color: WINE, textTransform: "uppercase", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <span style={{ display: "inline-block", width: 32, height: 1.5, background: WINE }} />
            FILOZOFIA JONË
          </motion.p>

          {/* Heading — word-by-word reveal */}
          <div style={{ marginBottom: 28, overflow: "hidden" }}>
            {["Dasma me dashuri,", "profesionalizëm", "dhe ingredientë të pastër."].map((line, li) => (
              <div key={li} style={{ overflow: "hidden" }}>
                <motion.p
                  initial={{ y: "110%", opacity: 0 }}
                  animate={inView ? { y: "0%", opacity: 1 } : {}}
                  transition={{ delay: 0.1 + li * 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontSize: li === 0 ? "clamp(1.7rem, 2.6vw, 2.45rem)" : "clamp(1.7rem, 2.6vw, 2.45rem)",
                    fontWeight: 900, color: DARK, lineHeight: 1.18,
                    fontStyle: li === 2 ? "italic" : "normal",
                  }}
                >
                  {line}
                </motion.p>
              </div>
            ))}
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.45, duration: 0.8 }}
            style={{ color: MUTED, lineHeight: 1.85, fontSize: 15, marginBottom: 40 }}
          >
            Ne ofrojmë shërbime dasme dhe eventech premium. Gjithmonë me materiale dhe procese
            autentike, pa shtesa të panevojshme — kështu mbetet shija e pastër, e plotë dhe reale.
          </motion.p>

          {/* Numbered pillars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 44 }}>
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, x: 28 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", gap: 20, paddingBottom: 24, position: "relative" }}
              >
                {/* Number + vertical line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: `1.5px solid ${WINE}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: WINE,
                    letterSpacing: "0.05em", flexShrink: 0,
                    background: "rgba(123,31,58,0.05)",
                  }}>
                    {p.num}
                  </div>
                  {/* connector line */}
                  {i < PILLARS.length - 1 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={inView ? { scaleY: 1 } : {}}
                      transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                      style={{
                        width: 1, flex: 1, minHeight: 20,
                        background: `linear-gradient(to bottom, ${WINE}40, transparent)`,
                        transformOrigin: "top",
                        marginTop: 4,
                      }}
                    />
                  )}
                </div>

                {/* Text */}
                <div style={{ paddingTop: 8 }}>
                  <p style={{ fontWeight: 800, fontSize: 13.5, color: DARK, marginBottom: 4, letterSpacing: "0.01em" }}>
                    {p.title}
                  </p>
                  <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.72 }}>{p.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.0, duration: 0.6 }}
            style={{ display: "flex", gap: 16, alignItems: "center" }}
          >
            <Link href="/sign-up">
              <motion.span
                whileHover={{ scale: 1.04, backgroundColor: WINE_DARK }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-block",
                  background: WINE,
                  color: WHITE,
                  padding: "15px 38px",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  transition: "background .2s",
                  boxShadow: `0 8px 24px rgba(123,31,58,0.28)`,
                }}
              >
                Bëhu Klient?
              </motion.span>
            </Link>
            <Link href="/sign-in">
              <motion.span
                whileHover={{ color: WINE }}
                style={{
                  fontSize: 13, fontWeight: 700, color: MUTED,
                  cursor: "pointer", letterSpacing: "0.04em",
                  textDecoration: "underline", textUnderlineOffset: 4,
                  transition: "color .2s",
                }}
              >
                Hyr në llogari →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HISTORY — dark wine card LEFT + b&w photo RIGHT
   (Gademan "HISTORIE" section — exact layout)
═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   SERVICES / SMAKEN — centered title + desc + 2 large cards
   (Gademan "Smaken" section: Sorbetijs + Melkijs layout)
═══════════════════════════════════════════════════════════ */
/* ─── Services slider data ─────────────────────────────── */
const SERVICE_SLIDES = [
  {
    label: "Ftesa Digjitale",
    desc: "Krijoni ftesa elegante me foto çifti, countdown dhe RSVP automatik.",
    img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=85",
    tag: "Popullar",
  },
  {
    label: "Hall Designer",
    desc: "Planifikoni sallën tuaj vizualisht — drag & drop, tavolina, VIP zona.",
    img: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=900&q=85",
    tag: "Premium",
  },
  {
    label: "QR Check-in",
    desc: "Mysafirët skanojnë kodin QR dhe hyjnë në event pa asnjë pritje.",
    img: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=85",
    tag: null,
  },
  {
    label: "RSVP Automatik",
    desc: "Çdo mysafir merr link unik — përgjigjet me një klik, ju shihni live.",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900&q=85",
    tag: null,
  },
  {
    label: "Menaxhimi i Mysafirëve",
    desc: "Lista e plotë, statuset, kategorizimi dhe filtrat — gjithçka në një vend.",
    img: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=900&q=85",
    tag: null,
  },
  {
    label: "Seat Planner",
    desc: "Cakto çdo mysafir tek tavolina dhe vendi i tij me drag & drop.",
    img: "https://images.unsplash.com/photo-1429514513361-8a632ff5e384?w=900&q=85",
    tag: "I ri",
  },
];

/* ─── Slider card ─────────────────────────────────────── */
function ServiceCard({ slide, isActive }: { slide: typeof SERVICE_SLIDES[0]; isActive: boolean }) {
  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0.55, scale: isActive ? 1 : 0.96 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: 420,
        flexShrink: 0,
        borderRadius: 16,
        overflow: "hidden",
        background: WHITE,
        boxShadow: isActive
          ? "0 24px 64px rgba(0,0,0,0.16), 0 4px 16px rgba(123,31,58,0.08)"
          : "0 4px 16px rgba(0,0,0,0.06)",
        border: `1px solid ${isActive ? "rgba(123,31,58,0.18)" : "#ede8e2"}`,
        userSelect: "none",
        cursor: "grab",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 280, overflow: "hidden" }}>
        <motion.img
          src={slide.img}
          alt={slide.label}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.6 }}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          draggable={false}
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(20,5,10,0.55) 0%, transparent 55%)",
        }} />
        {/* Tag */}
        {slide.tag && (
          <div style={{
            position: "absolute", top: 16, left: 16,
            background: WINE, color: WHITE,
            fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
            padding: "4px 12px", borderRadius: 20, textTransform: "uppercase",
          }}>
            {slide.tag}
          </div>
        )}
        {/* Label over image bottom */}
        <h3 style={{
          position: "absolute", bottom: 20, left: 24,
          color: WHITE, fontWeight: 900,
          fontSize: 22, letterSpacing: "0.02em",
          textShadow: "0 2px 12px rgba(0,0,0,0.4)",
          margin: 0,
        }}>
          {slide.label}
        </h3>
      </div>

      {/* Footer */}
      <div style={{ padding: "24px 28px 28px" }}>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.72, marginBottom: 20 }}>
          {slide.desc}
        </p>
        <Link href="/sign-up">
          <motion.span
            whileHover={{ backgroundColor: WINE, color: WHITE }}
            style={{
              display: "inline-block",
              border: `1.5px solid ${WINE}`,
              color: WINE,
              padding: "9px 24px",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.1em",
              cursor: "pointer",
              borderRadius: 6,
              textTransform: "uppercase",
              transition: "all .18s",
            }}
          >
            Shiko Shërbimin →
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Services Section with full-width drag slider ─────── */
function ServicesSection() {
  const total = SERVICE_SLIDES.length;
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const CARD_W = 420;
  const GAP = 28;
  const STEP = CARD_W + GAP;

  /* auto-advance */
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % total), 4500);
    return () => clearInterval(t);
  }, [total]);

  const go = useCallback((next: number) => {
    setActive(((next % total) + total) % total);
  }, [total]);

  /* translate so active card is left-aligned inside the container */
  const offset = -active * STEP;

  /* drag support */
  const dragStart = useRef(0);
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    dragStart.current = "touches" in e ? e.touches[0].clientX : e.clientX;
  };
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const end = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStart.current - end;
    if (Math.abs(diff) > 48) go(active + (diff > 0 ? 1 : -1));
  };

  return (
    <section id="services" style={{ background: WHITE, padding: "96px 0", overflow: "hidden" }}>

      {/* Header */}
      <FadeUp>
        <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 680, margin: "0 auto 56px", padding: "0 32px" }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", color: WINE, textTransform: "uppercase", marginBottom: 14 }}>
            SHËRBIMET TONA
          </p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(2rem, 3.5vw, 2.9rem)", color: DARK, marginBottom: 18 }}>
            Shërbimet
          </h2>
          <p style={{ color: MUTED, lineHeight: 1.85, fontSize: 15 }}>
            Lërini zemrën tuaj të flasë dhe ne do të kujdesemi për çdo detaj të ditës suaj të veçantë.
            Punojmë ekskluzivisht me teknologji moderne, pa kompromise të cilësisë.
          </p>
        </div>
      </FadeUp>

      {/* Slider track — clipped to content width */}
      <div style={{ maxWidth: 1280, margin: "0 auto", overflow: "hidden", padding: "0 48px" }}>
        <div
          ref={trackRef}
          style={{ cursor: "grab", paddingBottom: 8, userSelect: "none" }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd as any}
          onTouchStart={handleDragStart as any}
          onTouchEnd={handleDragEnd as any}
        >
          <motion.div
            animate={{ x: offset }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            style={{ display: "flex", gap: GAP }}
          >
            {SERVICE_SLIDES.map((slide, i) => (
              <div key={slide.label} onClick={() => go(i)}>
                <ServiceCard slide={slide} isActive={i === active} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 20, marginTop: 44,
      }}>
        {/* Prev */}
        <motion.button
          whileHover={{ scale: 1.08, borderColor: WINE }}
          whileTap={{ scale: 0.94 }}
          onClick={() => go(active - 1)}
          style={{
            background: "none", border: `1.5px solid #ccc`, borderRadius: "50%",
            width: 44, height: 44, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color .2s",
          }}
        >
          <ChevronLeft size={18} color={DARK} />
        </motion.button>

        {/* Dots */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {SERVICE_SLIDES.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              animate={{ width: i === active ? 28 : 8, background: i === active ? WINE : "#ddd" }}
              transition={{ duration: 0.3 }}
              style={{
                height: 8, borderRadius: 4,
                border: "none", cursor: "pointer", padding: 0,
              }}
            />
          ))}
        </div>

        {/* Next */}
        <motion.button
          whileHover={{ scale: 1.08, borderColor: WINE }}
          whileTap={{ scale: 0.94 }}
          onClick={() => go(active + 1)}
          style={{
            background: "none", border: `1.5px solid #ccc`, borderRadius: "50%",
            width: 44, height: 44, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "border-color .2s",
          }}
        >
          <ChevronRight size={18} color={DARK} />
        </motion.button>
      </div>

      {/* Active counter */}
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: MUTED, letterSpacing: "0.12em" }}>
        0{active + 1} / 0{total}
      </p>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════
   HALL / PREPARATION — text LEFT + image RIGHT (Gademan "Bereiding")
═══════════════════════════════════════════════════════════ */
function HallSection() {
  const features = [
    "Vizualizim 2D i sallës në kohë reale",
    "Menaxhim i kapacitetit dhe vendosjeve",
    "Kategorizim VIP, Familje & Shoqëri",
    "Eksport automatik i planit",
  ];
  return (
    <section id="hall" style={{ background: CREAM, padding: "96px 0" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 80px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        {/* Left: text */}
        <FadeUp>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: WINE, textTransform: "uppercase", marginBottom: 12 }}>
            HALL DESIGNER
          </p>
          <h2
            style={{
              fontWeight: 900,
              fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
              color: DARK,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              lineHeight: 1.25,
              marginBottom: 24,
            }}
          >
            KRIJONI PLANIN<br />E SALLËS
          </h2>
          <p style={{ color: MUTED, lineHeight: 1.85, marginBottom: 28, fontSize: 15 }}>
            Salla e dasmës suaj është kanavaca jonë. Ndërtoni planimetrinë vizuale, vendosni tavolinat me drag & drop dhe ulni çdo mysafir me saktësi dhe elegancë.
          </p>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 36 }}>
            {features.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09, duration: 0.5 }}
                style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, fontSize: 14, color: DARK }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `1.5px solid ${WINE}`,
                    flexShrink: 0,
                  }}
                >
                  <Check size={12} color={WINE} />
                </span>
                {item}
              </motion.li>
            ))}
          </ul>
          <Link href="/sign-up">
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-block",
                background: WINE,
                color: WHITE,
                padding: "13px 32px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              Zbuloni Mundësitë
            </motion.span>
          </Link>
        </FadeUp>

        {/* Right: image with wine accent shadow */}
        <FadeUp delay={0.12}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                bottom: -10,
                right: -10,
                width: "100%",
                height: "100%",
                background: `${WINE}20`,
                borderRadius: 2,
              }}
            />
            <img
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&q=85"
              alt="Hall planner"
              style={{ width: "100%", maxHeight: 500, objectFit: "cover", position: "relative", display: "block" }}
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS — auto-scrolling quote slider (Gademan "Ervaringen")
═══════════════════════════════════════════════════════════ */
const REVIEWS = [
  { name: "Arta & Besniku",   role: "Prishtinë, 2024",   img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=120&q=80", q: "NoaEvent e bëri organizimin e dasmës tonë gjë të kënaqshme. QR check-in funksionoi pa asnjë problem dhe mysafirët ishin të mahnitur me ftesën digjitale!" },
  { name: "Blerim Osmani",    role: "Wedding Planner",    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=120&q=80", q: "Kam organizuar mbi 40 dasma dhe NoaEvent është mjeti më i mirë që kam përdorur. Hall designer-i kursen orë pune dhe ndihmon të gjithë ekipin." },
  { name: "Drita Hoxha",      role: "Menaxhere Sale",     img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=120&q=80", q: "Klientët tanë janë jashtëzakonisht të kënaqur me ftesat digjitale. Platforma është intuitive dhe mbështetja teknike është fantastike." },
  { name: "Arben Gashi",      role: "Tiranë, 2025",       img: "https://images.unsplash.com/photo-1429514513361-8a632ff5e384?w=120&q=80", q: "Nuk kam pasur kurrë ndonjë problem — çdo detaj ishte perfekt dhe profesionalizmi i skuadrës ishte i jashtëzakonshëm!" },
  { name: "René & Mira",      role: "Dasma, 2025",        img: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=120&q=80", q: "Çdo shërbim i dorëzuar me kohë dhe profesionalizëm të lartë. Shërbimi me email ishte super i shpejtë dhe gjithmonë të gatshëm." },
];

function Testimonials() {
  const [idx, setIdx] = useState(0);
  const total = REVIEWS.length;

  // Auto-advance every 4.5 s
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % total), 4500);
    return () => clearInterval(t);
  }, [total]);

  return (
    <section style={{ position: "relative", padding: "96px 0", overflow: "hidden" }}>
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=80"
        alt=""
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 40%",
        }}
      />
      {/* Dark overlay for readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(20,5,10,0.82) 0%, rgba(20,5,10,0.70) 100%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
        <FadeUp>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(255,200,180,0.85)", textTransform: "uppercase", marginBottom: 14 }}>
            ERVARINGEN
          </p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: WHITE, marginBottom: 10 }}>
            Ij që tregon histori. Klientët tanë e ndajnë me kënaqësi.
          </h2>
          {/* Stars row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 40 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={WINE} color={WINE} />)}
          </div>
        </FadeUp>

        {/* Sliding quote */}
        <div style={{ position: "relative", minHeight: 160 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
            >
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.82)", lineHeight: 1.9, marginBottom: 32, fontStyle: "italic" }}>
                "{REVIEWS[idx].q}"
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                <img
                  src={REVIEWS[idx].img}
                  alt={REVIEWS[idx].name}
                  style={{
                    width: 52, height: 52, borderRadius: "50%",
                    objectFit: "cover",
                    border: `2px solid ${WINE}`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontWeight: 800, fontSize: 13, color: WHITE, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
                    {REVIEWS[idx].name}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{REVIEWS[idx].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prev / Next + Dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 36 }}>
          <button onClick={() => setIdx((idx - 1 + total) % total)}
            style={{ background: "rgba(255,255,255,0.12)", border: `1px solid rgba(255,255,255,0.30)`, borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={16} color={WHITE} />
          </button>
          {REVIEWS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 4, background: i === idx ? WINE : "rgba(255,255,255,0.30)", border: "none", cursor: "pointer", padding: 0, transition: "all .25s" }} />
          ))}
          <button onClick={() => setIdx((idx + 1) % total)}
            style={{ background: "rgba(255,255,255,0.12)", border: `1px solid rgba(255,255,255,0.30)`, borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight size={16} color={WHITE} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING — 2 photo-topped cards (Gademan order/bestellen)
═══════════════════════════════════════════════════════════ */
const PLANS = [
  {
    name: "Starter",
    price: "€19",
    period: "/muaj",
    tag: null,
    events: "1 event aktiv",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=70",
    perks: ["Deri 150 mysafirë", "Ftesa digjitale", "QR Check-in bazik", "Support me email"],
    featured: false,
  },
  {
    name: "Pro",
    price: "€49",
    period: "/muaj",
    tag: "Më i Popullarizuar",
    events: "Evente të pakufizuara",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=70",
    perks: ["Mysafirë të pakufizuar", "Hall Designer Premium", "RSVP automatik", "Priority support 24/7", "Eksport CSV/Excel"],
    featured: true,
  },
];

function PricingSection() {
  return (
    <section id="order" style={{ background: CREAM, padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(2rem, 3.5vw, 2.9rem)", color: DARK, marginBottom: 14 }}>Çmimet</h2>
            <p style={{ color: MUTED, maxWidth: 520, margin: "0 auto", lineHeight: 1.8 }}>
              Një investim i vogël për qetësi mendore në ditën tuaj më të madhe.
            </p>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, maxWidth: 920, margin: "0 auto" }}>
          {PLANS.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.12}>
              <div
                style={{
                  position: "relative",
                  background: WHITE,
                  border: `2px solid ${p.featured ? WINE : "#e5e0d8"}`,
                  overflow: "hidden",
                  transition: "transform .25s, box-shadow .25s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-6px)"; el.style.boxShadow = "0 14px 36px rgba(0,0,0,0.09)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
              >
                {p.tag && (
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    background: WINE, color: WHITE, fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.1em", padding: "4px 12px", textTransform: "uppercase", borderRadius: 2,
                  }}>
                    {p.tag}
                  </div>
                )}
                <div style={{ height: 150, overflow: "hidden" }}>
                  <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: 36 }}>
                  <h3 style={{ fontWeight: 900, fontSize: 22, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{p.name}</h3>
                  <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>{p.events}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                    <span style={{ fontSize: 42, fontWeight: 900, color: DARK, letterSpacing: "-0.02em" }}>{p.price}</span>
                    <span style={{ fontSize: 14, color: MUTED }}>{p.period}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                    {p.perks.map(perk => (
                      <li key={perk} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 14, color: DARK }}>
                        <Check size={14} color={WINE} strokeWidth={2.5} /> {perk}
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up">
                    <motion.span
                      whileHover={{ scale: 1.03 }}
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "13px",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: "0.07em",
                        cursor: "pointer",
                        borderRadius: 4,
                        background: p.featured ? WINE : "transparent",
                        color: p.featured ? WHITE : WINE,
                        border: `2px solid ${WINE}`,
                        transition: "all .18s",
                      }}
                    >
                      {p.featured ? "Fillo Me Pro" : "Zgjidh Starter"}
                    </motion.span>
                  </Link>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER — photo strip + wine subscribe box + white info grid
   (exact Gademan footer: 3-layer footer)
═══════════════════════════════════════════════════════════ */
function Footer() {
  const [email, setEmail] = useState("");
  return (
    <footer id="contact">
      {/* Layer 1: photo strip — like Gademan ice cream row */}
      <div style={{ height: 110, overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1800&q=60"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
      </div>

      {/* Layer 2: wine subscribe box — exact Gademan layout */}
      <div style={{ background: WINE, padding: "56px 0" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 80px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "center",
          }}
        >
          {/* Left: floating image + big italic text */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ flexShrink: 0 }}>
              <img
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200&q=60"
                alt=""
                style={{
                  width: 110,
                  height: 110,
                  objectFit: "cover",
                  borderRadius: "50%",
                  opacity: 0.75,
                  border: "3px solid rgba(255,255,255,0.25)",
                }}
              />
            </div>
            <h3
              style={{
                color: WHITE,
                fontWeight: 900,
                fontSize: "clamp(1.1rem, 1.8vw, 1.55rem)",
                lineHeight: 1.4,
                fontStyle: "italic",
              }}
            >
              Regjistrohu Sot<br />
              dhe Kurseni 20%<br />
              Në Planin e Parë
            </h3>
          </div>
          {/* Right: input + button */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Shkruani Adresën Email"
              style={{
                width: "100%",
                padding: "14px 18px",
                fontSize: 14,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.32)",
                color: WHITE,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              style={{
                width: "100%",
                padding: "14px 0",
                background: WHITE,
                color: WINE,
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "opacity .15s",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              Regjistrohu Tani
            </button>
          </div>
        </div>
      </div>

      {/* Layer 3: white info grid — exact Gademan 4-col footer */}
      <div style={{ background: WHITE, padding: "56px 0 28px" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 80px",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
          }}
        >
          {/* Col 1: company */}
          <div>
            <img
              src="/logo.png"
              alt="NoaEvent"
              style={{ height: 140, width: "auto", marginBottom: 20, objectFit: "contain" }}
            />
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>Adresa: Prishtinë 10000, Kosovë</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>Tel: +383 44 000 000</p>
            <p style={{ fontSize: 13, color: MUTED }}>Email: info@noa-event.com</p>
          </div>
          {/* Col 2: Nav menu */}
          <div>
            <p style={{ fontWeight: 800, fontSize: 12, color: DARK, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Menu</p>
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: MUTED, marginBottom: 10, textDecoration: "none", transition: "color .15s", cursor: "pointer" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = WINE)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = MUTED)}
              >
                {label}
              </a>
            ))}
          </div>
          {/* Col 3: empty spacer */}
          <div />
          {/* Col 4: Legal */}
          <div>
            <p style={{ fontWeight: 800, fontSize: 12, color: DARK, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Informacione</p>
            {["Dokumentet", "Politika Cookie", "Privatësia", "Disclaimer"].map(l => (
              <p key={l} style={{ fontWeight: 600, fontSize: 13.5, color: MUTED, marginBottom: 10, cursor: "pointer", transition: "color .15s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = WINE)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = MUTED)}>
                {l}
              </p>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          style={{
            maxWidth: 1280,
            margin: "28px auto 0",
            padding: "16px 80px 0",
            borderTop: "1px solid #ede8e2",
            fontSize: 12,
            color: MUTED,
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} NoaEvent. Të gjitha të drejtat e rezervuara.
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════ */
export function Landing() {
  return (
    <div style={{ background: WHITE, color: DARK, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <TopBar />
      <Navbar />
      <Hero />
      <WelcomeSection />
      <ServicesSection />
      <HallSection />
      <Testimonials />
      <PricingSection />
      <Footer />
    </div>
  );
}
