/**
 * NoaEvent Landing Page
 * Design: pixel-perfect port of gademangelato.nl layout
 * All sections, animations, and color palette match the reference exactly.
 */

import { useState, useRef, useEffect } from "react";
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
  { href: "#history",  label: "HISTORIA"  },
  { href: "#hall",     label: "SALLA"     },
  { href: "#contact",  label: "KONTAKT"   },
  { href: "#order",    label: "ÇMIMET"    },
];

/* Real logo image */
function StampLogo() {
  return (
    <img
      src="/logo.png"
      alt="NoaEvent"
      style={{
        height: 96,
        width: "auto",
        objectFit: "contain",
        flexShrink: 0,
        /* black bg → transparent on white nav */
        mixBlendMode: "multiply",
      }}
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
                onClick={e => { setActive(href); }}
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  color: "#3a2020",
                  textDecoration: isActive ? "underline" : "none",
                  textUnderlineOffset: 6,
                  textDecorationThickness: "2px",
                  textDecorationColor: "#3a2020",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color .15s",
                  opacity: isActive ? 1 : 1,
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
    img: "https://images.unsplash.com/photo-1429514513361-8a632ff5e384?w=1800&q=90",
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
      style={{ position: "relative", width: "100%", height: "88vh", overflow: "hidden" }}
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
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          padding: "0 48px",
        }}
      >
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
   WELCOME — large circular image LEFT, text + bullets RIGHT
   (Gademan "Ambachtelijk ijs met liefde…" section)
═══════════════════════════════════════════════════════════ */
const WELCOME_BULLETS = [
  { title: "Cilësi e Lartë & Shije Konstante", body: "Çdo detaj planifikohet me kujdes ekstrem — nga ftesat deri tek vendosja e mysafirëve." },
  { title: "Higjenë dhe Profesionalizëm", body: "Punojmë me standarde strikte dhe teknologji moderne për një event pa asnjë problem." },
  { title: "Personalizim & Orientim kah Klienti (B2B)", body: "Besojmë në transparencë dhe bashkëpunim — çdo organizator mund të mbështetet tek ne." },
  { title: "Pasion për Artin e Eventit", body: "Dashuria jonë për evente të veçanta pasqyrohet në çdo produkt — i sinqertë, artizanal dhe me histori." },
];

function WelcomeSection() {
  return (
    <section style={{ background: WHITE, padding: "96px 0" }}>
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
        {/* LEFT: large circle image — like Gademan's person circle */}
        <FadeUp>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "min(420px, 100%)",
                height: "min(420px, 100%)",
                borderRadius: "50%",
                overflow: "hidden",
                border: `6px solid ${CREAM}`,
                boxShadow: `0 8px 40px rgba(123,31,58,0.18)`,
                aspectRatio: "1",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=85"
                alt="Wedding planning"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </FadeUp>

        {/* RIGHT: heading + 4 bold bullets + CTA */}
        <FadeUp delay={0.12}>
          <h2
            style={{
              fontWeight: 900,
              fontSize: "clamp(1.5rem, 2.5vw, 2.1rem)",
              color: DARK,
              lineHeight: 1.3,
              marginBottom: 28,
            }}
          >
            Dasma me dashuri, profesionalizëm dhe ingredientë të pastër.
          </h2>
          <p style={{ color: MUTED, lineHeight: 1.85, marginBottom: 28, fontSize: 15 }}>
            Ne ofrojmë shërbime dasme dhe eventech premium. Gjithmonë me materiale dhe procese autentike, pa shtesa të panevojshme — kështu mbetet shija e pastër, e plotë dhe reale.
          </p>
          {WELCOME_BULLETS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              style={{ marginBottom: 18 }}
            >
              <p style={{ fontWeight: 800, fontSize: 14, color: DARK, marginBottom: 3 }}>{b.title}</p>
              <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.7 }}>{b.body}</p>
            </motion.div>
          ))}
          <div style={{ marginTop: 32 }}>
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
                Bëhu Klient?
              </motion.span>
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HISTORY — dark wine card LEFT + b&w photo RIGHT
   (Gademan "HISTORIE" section — exact layout)
═══════════════════════════════════════════════════════════ */
function HistorySection() {
  return (
    <section id="history" style={{ background: CREAM }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: 480,
        }}
      >
        {/* Wine card */}
        <FadeUp style={{ display: "flex" }}>
          <div
            style={{
              background: WINE,
              padding: "72px 64px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{
                color: WHITE,
                fontWeight: 900,
                fontSize: "clamp(1.6rem, 2.5vw, 2.3rem)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 28,
              }}
            >
              HISTORIA
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.7 }}
              style={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.85, marginBottom: 16, fontSize: 15 }}
            >
              "Pasioni im është krijimi i produkteve të ndershme, pa ngjyra dhe shije artificiale, ku shija gjithmonë luan rolin kryesor." Nga kjo bindje, NoaEvent ka prodhuar mbi 200 dasma premium.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.7 }}
              style={{ color: "rgba(255,255,255,0.80)", lineHeight: 1.85, marginBottom: 40, fontSize: 15 }}
            >
              Çdo plan eventech zhvillohet me syrin e cilësisë, konsistencës dhe përjetimit — saktësisht ajo çka klientëla premium kërkon.
            </motion.p>
            <Link href="/sign-up">
              <motion.span
                whileHover={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                style={{
                  display: "inline-block",
                  border: "1.5px solid rgba(255,255,255,0.55)",
                  color: WHITE,
                  padding: "10px 26px",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  borderRadius: 4,
                  textTransform: "uppercase",
                  transition: "background .2s",
                }}
              >
                Lexo Më Shumë...
              </motion.span>
            </Link>
          </div>
        </FadeUp>

        {/* B&W photo */}
        <FadeUp delay={0.1} style={{ display: "flex" }}>
          <img
            src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&q=85"
            alt="Historia"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              minHeight: 440,
              filter: "grayscale(35%) contrast(1.08)",
            }}
          />
        </FadeUp>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SERVICES / SMAKEN — centered title + desc + 2 large cards
   (Gademan "Smaken" section: Sorbetijs + Melkijs layout)
═══════════════════════════════════════════════════════════ */
const BIG_CARDS = [
  {
    label: "Ftesa Digjitale",
    sub: "Shiko Shërbimin",
    img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    href: "/sign-up",
  },
  {
    label: "Hall Designer",
    sub: "Shiko Shërbimin",
    img: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80",
    href: "/sign-up",
  },
];

const SMALL_CARDS = [
  { label: "QR Check-in",    img: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500&q=70" },
  { label: "RSVP Automatik", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=70" },
  { label: "Mysafirët",       img: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=500&q=70" },
  { label: "Seat Planner",   img: "https://images.unsplash.com/photo-1429514513361-8a632ff5e384?w=500&q=70" },
];

function ServicesSection() {
  return (
    <section id="services" style={{ background: WHITE, padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>

        {/* Centered intro — like Gademan's "Smaken" text block */}
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 700, margin: "0 auto 56px" }}>
            <h2
              style={{
                fontWeight: 900,
                fontSize: "clamp(2rem, 3.5vw, 2.9rem)",
                color: DARK,
                marginBottom: 20,
              }}
            >
              Shërbimet
            </h2>
            <p style={{ color: MUTED, lineHeight: 1.85, fontSize: 15 }}>
              Lërini zemrën tuaj të flasë dhe ne do të kujdesemi për çdo detaj të ditës suaj të veçantë.
              Nuk e gjeni atë që kërkoni? Zhvillojmë me kënaqësi zgjidhje unike sipas kërkesës suaj —
              si ftesa me AR, plane sallash me AI ose menaxhim VIP. Punojmë ekskluzivisht me teknologji
              moderne, pa kompromise të cilësisë.
            </p>
          </div>
        </FadeUp>

        {/* 2 large cards — exact Gademan Sorbetijs/Melkijs layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {BIG_CARDS.map((card, i) => (
            <FadeUp key={card.label} delay={i * 0.1}>
              <div
                style={{
                  border: "1px solid #ede8e2",
                  overflow: "hidden",
                  background: WHITE,
                  transition: "transform .25s, box-shadow .25s",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-5px)"; el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
              >
                {/* Photo */}
                <div style={{ height: 300, overflow: "hidden" }}>
                  <img
                    src={card.img}
                    alt={card.label}
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      transition: "transform .5s ease",
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
                  />
                </div>
                {/* Card footer */}
                <div style={{ textAlign: "center", padding: "32px 24px" }}>
                  <h3 style={{ fontWeight: 900, fontSize: 22, color: DARK, marginBottom: 20, letterSpacing: "0.02em" }}>
                    {card.label}
                  </h3>
                  <Link href={card.href}>
                    <motion.span
                      whileHover={{ background: WINE, color: WHITE }}
                      style={{
                        display: "inline-block",
                        border: `2px solid ${WINE}`,
                        color: WINE,
                        padding: "10px 30px",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: "0.08em",
                        cursor: "pointer",
                        borderRadius: 4,
                        transition: "all .18s",
                      }}
                    >
                      {card.sub}
                    </motion.span>
                  </Link>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* 4 smaller cards below — like Gademan's extra flavour cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {SMALL_CARDS.map((card, i) => (
            <FadeUp key={card.label} delay={i * 0.07}>
              <div
                style={{ border: "1px solid #ede8e2", overflow: "hidden", background: WHITE }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
              >
                <div style={{ height: 160, overflow: "hidden" }}>
                  <img
                    src={card.img}
                    alt={card.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
                  />
                </div>
                <div style={{ textAlign: "center", padding: "20px 12px" }}>
                  <h3 style={{ fontWeight: 800, fontSize: 14, color: DARK, marginBottom: 12, letterSpacing: "0.02em" }}>
                    {card.label}
                  </h3>
                  <Link href="/sign-up">
                    <span
                      style={{
                        display: "inline-block",
                        border: `1.5px solid ${WINE}`,
                        color: WINE,
                        padding: "6px 16px",
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        cursor: "pointer",
                        borderRadius: 4,
                      }}
                    >
                      Shiko →
                    </span>
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
              src="https://images.unsplash.com/photo-1429514513361-8a632ff5e384?w=900&q=85"
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
  { name: "Arta & Besniku",   role: "Prishtinë, 2024",   q: "NoaEvent e bëri organizimin e dasmës tonë gjë të kënaqshme. QR check-in funksionoi pa asnjë problem dhe mysafirët ishin të mahnitur me ftesën digjitale!" },
  { name: "Blerim Osmani",    role: "Wedding Planner",    q: "Kam organizuar mbi 40 dasma dhe NoaEvent është mjeti më i mirë që kam përdorur. Hall designer-i kursen orë pune dhe ndihmon të gjithë ekipin." },
  { name: "Drita Hoxha",      role: "Menaxhere Sale",    q: "Klientët tanë janë jashtëzakonisht të kënaqur me ftesat digjitale. Platforma është intuitive dhe mbështetja teknike është fantastike." },
  { name: "Arben Gashi",      role: "Tiranë, 2025",      q: "Heerlijk vers product, vriendelijke bediening. Nuk kam pasur kurrë ndonjë problem — çdo detaj ishte perfekt!" },
  { name: "René & Mira",      role: "Dasma, 2025",       q: "Echt verrukkelijk — çdo shërbim i dorëzuar me kohë dhe profesionalizëm të lartë. Shërbimi me email ishte super i shpejtë." },
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
    <section style={{ background: WHITE, padding: "96px 0" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
        <FadeUp>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: WINE, textTransform: "uppercase", marginBottom: 14 }}>
            ERVARINGEN
          </p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: DARK, marginBottom: 10 }}>
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
              <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.9, marginBottom: 24, fontStyle: "italic" }}>
                "{REVIEWS[idx].q}"
              </p>
              <p style={{ fontWeight: 800, fontSize: 13, color: DARK, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {REVIEWS[idx].name}
              </p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{REVIEWS[idx].role}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prev / Next + Dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 36 }}>
          <button onClick={() => setIdx((idx - 1 + total) % total)}
            style={{ background: "none", border: `1px solid #ddd`, borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={16} color={DARK} />
          </button>
          {REVIEWS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 4, background: i === idx ? WINE : "#ddd", border: "none", cursor: "pointer", padding: 0, transition: "all .25s" }} />
          ))}
          <button onClick={() => setIdx((idx + 1) % total)}
            style={{ background: "none", border: `1px solid #ddd`, borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight size={16} color={DARK} />
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
            {/* Stamp logo in footer */}
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                border: "1.5px solid #c4b49a",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                background: CREAM,
              }}
            >
              <Heart size={14} color={WINE} />
              <span style={{ fontSize: 7, fontWeight: 900, color: WINE, textTransform: "uppercase", letterSpacing: "0.1em" }}>NoaEvent</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: DARK, marginBottom: 8 }}>NoaEvent</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>Adresa: Prishtinë 10000, Kosovë</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>Tel: +383 44 000 000</p>
            <p style={{ fontSize: 13, color: MUTED }}>Email: info@noa-event.com</p>
          </div>
          {/* Col 2: Bank */}
          <div>
            <p style={{ fontWeight: 800, fontSize: 12, color: DARK, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em" }}>Banka</p>
            {[
              ["Bank", "Raiffeisen"],
              ["IBAN", "XK05 1234 0000 0000"],
              ["NUI", "811234567"],
              ["TVSH", "123456789"],
            ].map(([k, v]) => (
              <p key={k} style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>
                <strong style={{ color: DARK }}>{k}:</strong> {v}
              </p>
            ))}
          </div>
          {/* Col 3: empty spacer */}
          <div />
          {/* Col 4: Legal — bold like Gademan */}
          <div>
            {["Dokumentet", "Politika Cookie", "Privatësia", "Disclaimer"].map(l => (
              <p key={l} style={{ fontWeight: 700, fontSize: 13.5, color: DARK, marginBottom: 10, cursor: "pointer" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = WINE)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = DARK)}>
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
      <HistorySection />
      <ServicesSection />
      <HallSection />
      <Testimonials />
      <PricingSection />
      <Footer />
    </div>
  );
}
