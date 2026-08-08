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
  ChevronLeft, ChevronRight, Star, Play, Pause, Volume2, VolumeX, Film, Sparkles, Globe,
  Phone, Clock, Send, MessageSquare,
} from "lucide-react";
import { PlanRegistrationModal, PlanKey } from "../components/PlanRegistrationModal";
import { useLanguage, LanguageSelector } from "@/lib/i18n";


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
function TopBar({ onOpenModal }: { onOpenModal?: (plan?: PlanKey) => void }) {
  const { t } = useLanguage();
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
        <span
          onClick={() => onOpenModal?.("pro")}
          style={{ cursor: "pointer", transition: "color .15s" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = WHITE)}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)")}
        >
          {t("nav.be_client", "Bëhu Klient?")}
        </span>
        <Link href="/sign-in">
          <span style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "color .15s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = WHITE)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.72)")}>
            <Heart size={12} strokeWidth={1.8} /> {t("nav.account", "Llogaria")}
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
  { href: "#order",    label: "ÇMIMET"    },
  { href: "#contact",  label: "KONTAKT"   },
];

/* Logo */
function StampLogo() {
  return (
    <img
      src="/logo-full.png"
      alt="NoaEvent"
      style={{ height: 140, width: "auto", flexShrink: 0, objectFit: "contain", display: "block" }}
    />
  );
}

function Navbar({ onOpenModal }: { onOpenModal?: (plan?: PlanKey) => void }) {
  const [active, setActive] = useState("#home");
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { href: "#home",     label: t("nav.home", "HOME").toUpperCase()      },
    { href: "#services", label: t("nav.services", "SHËRBIMET").toUpperCase() },
    { href: "#hall",     label: t("nav.events", "SALLA").toUpperCase()     },
    { href: "#order",    label: t("nav.pricing", "ÇMIMET").toUpperCase()    },
    { href: "#contact",  label: t("nav.contact", "KONTAKT").toUpperCase()   },
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 2);

      const sections = navLinks.map(link => link.href.replace("#", ""));
      const scrollPos = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActive(`#${sections[i]}`);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navLinks]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setActive(href);
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 85;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

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
          height: 90,
          overflow: "visible",
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
          {navLinks.map(({ href, label }) => {
            const isActive = active === href;
            return (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                style={{
                  fontSize: 13.5, fontWeight: 600, letterSpacing: "0.07em",
                  color: isActive ? WINE : "#3a2020",
                  textDecoration: isActive ? "underline" : "none",
                  textUnderlineOffset: 6, textDecorationThickness: "2px",
                  textDecorationColor: WINE,
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s ease",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = WINE)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = isActive ? WINE : "#3a2020")}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* ── "Bëhu Klient?" — pill button ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LanguageSelector />
          <motion.button
            onClick={() => onOpenModal?.("pro")}
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
              border: "none",
              transition: "background .18s",
            }}
          >
            {t("nav.be_client", "Bëhu Klient?")}
          </motion.button>
        </div>
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

            <Link href="/sign-in">
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
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-wedding-table-setup-with-flowers-and-candles-42291-large.mp4",
    poster: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=90",
  },
  {
    num: "02",
    title: "Higjenë dhe Profesionalizëm",
    body: "Punojmë me standarde strikte dhe teknologji moderne për një event pa asnjë problem.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-decor-designer-arranging-wedding-flowers-42292-large.mp4",
    poster: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=90",
  },
  {
    num: "03",
    title: "Personalizim & Orientim kah Klienti",
    body: "Besojmë në transparencë dhe bashkëpunim — çdo organizator mund të mbështetet tek ne.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-newlyweds-slow-dancing-at-their-wedding-reception-42289-large.mp4",
    poster: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=900&q=90",
  },
  {
    num: "04",
    title: "Pasion për Artin e Eventit",
    body: "Dashuria jonë për evente të veçanta pasqyrohet në çdo produkt — i sinqertë, artizanal dhe me histori.",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-out-of-the-church-41584-large.mp4",
    poster: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=90",
  },
];

function WelcomeSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: false, margin: "-100px" });
  const [activePillarIndex, setActivePillarIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activePillar = PILLARS[activePillarIndex];

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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

        {/* ── LEFT: Interactive Video Player composition ── */}
        <div style={{ position: "relative", overflow: "hidden", minHeight: 720, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Main video element with background container */}
          <motion.div
            initial={{ scale: 1.05 }}
            animate={inView ? { scale: 1 } : { scale: 1.05 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, background: "#110509" }}
          >
            <AnimatePresence mode="wait">
              <motion.video
                key={activePillar.videoUrl}
                ref={videoRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                src={activePillar.videoUrl}
                poster={activePillar.poster}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </AnimatePresence>

            {/* Gradient overlays for aesthetic depth and contrast */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(26,10,16,0.4) 0%, transparent 35%, transparent 65%, rgba(26,10,16,0.6) 100%)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, transparent 55%, rgba(250,248,245,0.95) 100%)",
            }} />
          </motion.div>

          {/* Top Video Indicator Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              position: "absolute", top: 32, left: 32, zIndex: 10,
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(26, 10, 16, 0.65)",
              backdropFilter: "blur(12px)",
              padding: "10px 18px", borderRadius: 30,
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
          >
            <span style={{
              display: "inline-flex", width: 10, height: 10, borderRadius: "50%",
              background: WINE, position: "relative",
            }}>
              <span style={{
                position: "absolute", inset: -3, borderRadius: "50%",
                background: WINE, opacity: 0.6, animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"
              }} />
            </span>
            <Film size={14} color="#EAA88F" />
            <span style={{ fontSize: 12, fontWeight: 700, color: WHITE, letterSpacing: "0.04em" }}>
              {activePillar.num}. {activePillar.title}
            </span>
          </motion.div>

          {/* Video Control Buttons Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              position: "absolute", top: 32, right: 32, zIndex: 10,
              display: "flex", gap: 10,
            }}
          >
            <button
              onClick={togglePlay}
              title={isPlaying ? "Pauzo videon" : "Luaj videon"}
              style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
            </button>
            <button
              onClick={toggleMute}
              title={isMuted ? "Aktivizo zërin" : "Çaktivizo zërin"}
              style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </motion.div>

          {/* Video Switcher Tabs at Bottom of Video */}
          <div style={{
            position: "absolute", bottom: 130, left: 40, zIndex: 10,
            display: "flex", gap: 8,
          }}>
            {PILLARS.map((p, i) => (
              <button
                key={p.num}
                onClick={() => setActivePillarIndex(i)}
                style={{
                  padding: "6px 12px", borderRadius: 20,
                  fontSize: 11, fontWeight: 700,
                  background: activePillarIndex === i ? WINE : "rgba(255,255,255,0.25)",
                  color: WHITE, border: "none", cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.3s ease",
                }}
              >
                Pika {p.num}
              </button>
            ))}
          </div>

          {/* Floating stats badge — bottom left */}
          <motion.div
            initial={{ opacity: 0, y: 32, x: -20 }}
            animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", bottom: 44, left: 40, zIndex: 10,
              background: WHITE,
              borderRadius: 16,
              padding: "16px 24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              border: `1px solid rgba(123,31,58,0.12)`,
              backdropFilter: "blur(8px)",
              display: "flex", gap: 28,
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
                <p style={{ fontSize: 20, fontWeight: 900, color: WINE, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{s.val}</p>
                <p style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── RIGHT: Text content & Interactive Pillars ── */}
        <div style={{
          padding: "96px 72px 96px 64px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          background: CREAM,
        }}>

          {/* Badge */}
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              fontSize: 11, fontWeight: 800, letterSpacing: "0.22em",
              color: WINE, textTransform: "uppercase", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <span style={{ display: "inline-block", width: 32, height: 1.5, background: WINE }} />
            {t("welcome.badge", "MIRË SE VENI NË NOAEVENT")}
          </motion.p>

          {/* Heading */}
          <div style={{ marginBottom: 28, overflow: "hidden" }}>
            <motion.h2
              initial={{ y: "110%", opacity: 0 }}
              animate={inView ? { y: "0%", opacity: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: "clamp(1.7rem, 2.6vw, 2.45rem)",
                fontWeight: 900, color: DARK, lineHeight: 1.18,
              }}
            >
              {t("welcome.title", "Salla & Ftesa Digjitale me Elegancë dhe Precizion")}
            </motion.h2>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.45, duration: 0.8 }}
            style={{ color: MUTED, lineHeight: 1.85, fontSize: 15, marginBottom: 40 }}
          >
            {t("welcome.desc", "Platforma më me përvojë në Kosovë dhe rajon për organizimin e dasmave dhe ngjarjeve festive. Kurseni orë pune dhe organizoni sallën tuaj pa asnjë gabim.")}
          </motion.p>

          {/* Numbered pillars (Clickable & interactive with video) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 44 }}>
            {PILLARS.map((p, i) => {
              const isActive = activePillarIndex === i;
              const pillarTitleKey = i === 0 ? "welcome.f1_title" : i === 1 ? "welcome.f2_title" : i === 2 ? "welcome.f3_title" : "services.s1_title";
              const pillarDescKey = i === 0 ? "welcome.f1_desc" : i === 1 ? "welcome.f2_desc" : i === 2 ? "welcome.f3_desc" : "services.s1_desc";
              return (
                <motion.div
                  key={p.num}
                  onClick={() => setActivePillarIndex(i)}
                  initial={{ opacity: 0, x: 28 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: "flex", gap: 20, padding: "14px 18px", borderRadius: 12,
                    position: "relative", cursor: "pointer",
                    background: isActive ? "rgba(123,31,58,0.06)" : "transparent",
                    border: `1px solid ${isActive ? "rgba(123,31,58,0.25)" : "transparent"}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Number + vertical line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      border: `1.5px solid ${WINE}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800,
                      color: isActive ? WHITE : WINE,
                      letterSpacing: "0.05em", flexShrink: 0,
                      background: isActive ? WINE : "rgba(123,31,58,0.05)",
                      boxShadow: isActive ? `0 4px 14px ${WINE}40` : "none",
                      transition: "all 0.3s ease",
                    }}>
                      {p.num}
                    </div>
                  </div>

                  {/* Text */}
                  <div style={{ paddingTop: 4, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{
                        fontWeight: 800, fontSize: 14,
                        color: isActive ? WINE : DARK,
                        marginBottom: 4, letterSpacing: "0.01em",
                        transition: "color 0.3s ease",
                      }}>
                        {t(pillarTitleKey, p.title)}
                      </p>
                      {isActive && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 10, fontWeight: 700, color: WINE,
                          background: "rgba(123,31,58,0.1)", padding: "2px 8px", borderRadius: 10,
                        }}>
                          <Play size={10} fill={WINE} /> Video
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.72 }}>{t(pillarDescKey, p.body)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.0, duration: 0.6 }}
            style={{ display: "flex", gap: 16, alignItems: "center" }}
          >
            <Link href="/sign-in">
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
                {t("nav.be_client", "Bëhu Klient?")}
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
                {t("nav.account", "Llogaria")} →
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
        <Link href="/sign-in">
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
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const total = SERVICE_SLIDES.length;
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
            {t("services.badge", "SHËRBIMET TONA")}
          </p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(2rem, 3.5vw, 2.9rem)", color: DARK, marginBottom: 18 }}>
            {t("services.title", "Gjithçka që ju nevojitet për një event të përsosur")}
          </h2>
          <p style={{ color: MUTED, lineHeight: 1.85, fontSize: 15 }}>
            {t("services.s1_desc", "Dizajnoni sallën tuaj vizuale me tavolina rrethore, katrore, pista vallëzimi, skenën dhe caktimin e mysafirëve.")}
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
  const { t } = useLanguage();
  const features = [
    t("services.s1_title", "Vizualizim 2D i sallës në kohë reale"),
    t("welcome.f1_title", "Menaxhim i kapacitetit dhe vendosjeve"),
    t("welcome.f1_desc", "Kategorizim VIP, Familje & Shoqëri"),
    t("services.s4_title", "Eksport automatik i planit"),
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
            {t("hall.badge", "HALL DESIGNER 2D")}
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
            {t("hall.title", "Planifikoni ulëset dhe strukturën e sallës suaj në detaje")}
          </h2>
          <p style={{ color: MUTED, lineHeight: 1.85, marginBottom: 28, fontSize: 15 }}>
            {t("hall.desc", "Me Hall Designer interactive ju ndërtoni sallën tuaj me tavolina, skenë, bar, dhe vendosni mysafirët në çdo karrige.")}
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
          <Link href="/sign-in">
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
   INTERACTIVE SAVINGS CALCULATOR
═══════════════════════════════════════════════════════════ */
function EventSavingsCalculator({ onOpenModal }: { onOpenModal: (plan?: PlanKey) => void }) {
  const { t } = useLanguage();
  const [guests, setGuests] = useState(250);

  const printSaved = Math.round(guests * 1.6);
  const hoursSaved = Math.round(guests * 0.12);

  return (
    <section style={{ background: WHITE, padding: "80px 0", borderTop: "1px solid #ede8e2", borderBottom: "1px solid #ede8e2" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: WINE, textTransform: "uppercase", marginBottom: 12 }}>
              {t("calc.badge", "INTERAKTIVE · KURSIMI I KOSTOS DHE KOHËS")}
            </p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", color: DARK, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {t("calc.title", "Llogaritni sa kurseni me NoaEvent")}
            </h2>
            <p style={{ color: MUTED, fontSize: 15, marginTop: 8 }}>
              {t("calc.subtitle", "Zgjidhni numrin e parashikuar të mysafirëve për të parë kursimin e menjëhershëm")}
            </p>
          </div>
        </FadeUp>

        <div style={{ background: CREAM, borderRadius: 16, padding: "40px 48px", border: "1px solid #eae3d9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("calc.guests", "Numri i Mysafirëve")}: <span style={{ color: WINE, fontSize: 24, fontWeight: 900, marginLeft: 8 }}>{guests}</span>
            </label>
            <input
              type="range"
              min={50}
              max={600}
              step={10}
              value={guests}
              onChange={e => setGuests(Number(e.target.value))}
              style={{ width: "100%", accentColor: WINE, height: 8, borderRadius: 4, cursor: "pointer", marginBottom: 24 }}
            />
            
            {/* Diaspora Multi-language note */}
            <div style={{ background: WHITE, padding: "16px 20px", borderRadius: 12, border: "1px solid #e8e2d8", display: "flex", alignItems: "center", gap: 14 }}>
              <Globe size={24} color={WINE} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: DARK, margin: 0 }}>{t("calc.diaspora_title", "Ftesa Shumëgjuhëshe për Diasporën")}</p>
                <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0 0" }}>{t("calc.diaspora_desc", "Dërgoni ftesat në Shqip 🇦🇱, Gjermanisht 🇩🇪, Anglisht 🇬🇧 apo Frëngjisht 🇫🇷 me 1-klik në WhatsApp.")}</p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: WHITE, padding: "24px 20px", borderRadius: 14, border: "1px solid #e8e2d8", textAlign: "center" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{t("calc.print_savings", "KURSIMI I SHTYPIT")}</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: WINE, margin: 0 }}>€{printSaved}+</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{t("calc.in_printing", "në letra & printime")}</p>
            </div>

            <div style={{ background: WHITE, padding: "24px 20px", borderRadius: 14, border: "1px solid #e8e2d8", textAlign: "center" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{t("calc.time_saved", "KOHË E KURSYESHME")}</p>
              <p style={{ fontSize: 32, fontWeight: 900, color: DARK, margin: 0 }}>{hoursSaved} h</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{t("calc.in_rsvp", "në telefonata RSVP")}</p>
            </div>

            <div style={{ background: WHITE, padding: "20px 20px", borderRadius: 14, border: "1px solid #e8e2d8", textAlign: "center", gridColumn: "span 2" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{t("calc.accuracy", "SAKTËSIA E SALLËS & USHQIMIT")}</p>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#15803d", margin: 0 }}>{t("calc.accuracy_val", "100% Saktësi")}</p>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{t("calc.accuracy_sub", "me Hall Designer & QR Check-in në hyrje")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING STICKY CTA BAR
═══════════════════════════════════════════════════════════ */
function FloatingCtaBar({ onOpenModal }: { onOpenModal: (plan?: PlanKey) => void }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99,
        background: DARK,
        color: WHITE,
        padding: "12px 28px",
        borderRadius: 50,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>
        {t("float.title", "✨ Planifikoni Dasmën tuaj me NoaEvent")}
      </span>

      <button
        onClick={() => onOpenModal("pro")}
        style={{
          background: WINE,
          color: WHITE,
          border: "none",
          padding: "8px 20px",
          borderRadius: 25,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.04em",
          cursor: "pointer",
          transition: "transform .15s",
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1.05)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
      >
        {t("float.btn", "Bëhu Klient")}
      </button>
    </motion.div>
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
    name: "Basic",
    planKey: "basic" as PlanKey,
    price: "€14.99",
    period: "/muaj",
    tag: null,
    events: "1 organizim (1 event)",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=70",
    perks: ["1 organizim (1 event)", "Menaxhim mysafirësh", "Ftesa digjitale me QR Code", "RSVP me kohë reale", "Support me email"],
    featured: false,
  },
  {
    name: "Pro",
    planKey: "pro" as PlanKey,
    price: "€29.99",
    period: "/muaj",
    tag: "Më i Popullarizuar",
    events: "3 organizime (3 evente)",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=70",
    perks: ["Deri në 3 organizime", "Hall Designer (Dizajnimi i Sallës 2D/3D)", "Ftesa me Audio & Video", "Eksport CSV / Excel / PDF", "Priority support 24/7"],
    featured: true,
  },
  {
    name: "Enterprise / Salla",
    planKey: "custom" as PlanKey,
    price: "€79.99",
    period: "/muaj",
    tag: "Pakufizuar",
    events: "Evente të pakufizuara",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=70",
    perks: ["Evente të pakufizuara (Unlimited)", "Branding i Sallës / Agjencisë", "Multi-user role & permissions", "Domain i personalizuar", "Menaxher personal i përkushtuar"],
    featured: false,
  },
];


function PricingSection({ onOpenModal }: { onOpenModal?: (plan?: PlanKey) => void }) {
  const { t } = useLanguage();
  return (
    <section id="order" style={{ background: CREAM, padding: "96px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(2rem, 3.5vw, 2.9rem)", color: DARK, marginBottom: 14 }}>{t("pricing.title", "Paketat & Çmimet")}</h2>
            <p style={{ color: MUTED, maxWidth: 520, margin: "0 auto", lineHeight: 1.8 }}>
              {t("pricing.subtitle", "Zgjidhni paketën e duhur për të aktivizuar llogarinë tuaj dhe për të përfituar nga të gjitha meçet tona.")}
            </p>
          </div>
        </FadeUp>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28, maxWidth: 1140, margin: "0 auto" }}>
          {PLANS.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.12}>
              <div
                style={{
                  position: "relative",
                  background: WHITE,
                  border: `2px solid ${p.featured ? WINE : "#e5e0d8"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "transform .25s, box-shadow .25s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: "100%",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-6px)"; el.style.boxShadow = "0 14px 36px rgba(0,0,0,0.09)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
              >
                {p.tag && (
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    background: WINE, color: WHITE, fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.1em", padding: "4px 12px", textTransform: "uppercase", borderRadius: 4, zIndex: 2,
                  }}>
                    {p.featured ? t("pricing.popular", p.tag) : p.tag}
                  </div>
                )}
                <div style={{ height: 140, overflow: "hidden" }}>
                  <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: 32, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

                  <div>
                    <h3 style={{ fontWeight: 900, fontSize: 22, color: DARK, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{p.name}</h3>
                    <p style={{ fontSize: 11, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
                      {p.planKey === "basic" ? t("pricing.basic", p.events) : p.planKey === "pro" ? t("pricing.pro", p.events) : t("pricing.custom", p.events)}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                      <span style={{ fontSize: 38, fontWeight: 900, color: DARK, letterSpacing: "-0.02em" }}>{p.price}</span>
                      <span style={{ fontSize: 13, color: MUTED }}>{p.period}</span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                      {p.perks.map(perk => (
                        <li key={perk} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 13.5, color: DARK }}>
                          <Check size={14} color={WINE} strokeWidth={2.5} /> {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <motion.button
                    onClick={() => onOpenModal?.(p.planKey)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: "100%",
                      textAlign: "center",
                      padding: "13px",
                      fontWeight: 800,
                      fontSize: 13,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      borderRadius: 8,
                      background: p.featured ? WINE : "transparent",
                      color: p.featured ? WHITE : WINE,
                      border: `2px solid ${WINE}`,
                      transition: "all .18s",
                    }}
                  >
                    {t("pricing.btn", "CHOOSE PLAN")}
                  </motion.button>
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
   FAQ SECTION — elegant accordion
═══════════════════════════════════════════════════════════ */
const FAQS = [
  { q: "Si funksionon QR Code check-in në hyrje të eventit?", a: "Secili mysafir merr një QR code unik me ftesën e tij digjitale. Në hyrje të sallës, ju ose stafi mund ta skenoni me telefon për të gjetur menjëherë emrin dhe tavolinën e caktuar per atë mysafir." },
  { q: "A mund t'i dërgoj ftesat me WhatsApp dhe Email?", a: "Po, platforma gjeneron një link individual dhe mesazh të parapërgatitur në shqip me 1-klik për WhatsApp, si dhe mundëson dërgimin masiv me email." },
  { q: "Si funksionon Hall Designer per rregullimin e sallës?", a: "Me Hall Designer ju ndërtoni sallën tuaj vizuale me tavolina rrethore, katrore, pista vallëzimi, skenën, DJ, etj., dhe mund të caktoni se kush ulet te cila tavolinë." },
  { q: "Si mund t'i provoj shërbimet e NoaEvent?", a: "Ju mund të regjistroheni lehtësisht dhe të zgjidhni paketën tuaj të preferuar me qasje të menjëhershme në platformë." },

  { q: "Çfarë ndodh nëse kam mysafirë nga diaspora?", a: "Ftesat digjitale mbështesin shumë gjuhë (Shqip, Gjermanisht, Anglisht), në mënyrë që mysafirët tuaj jashtë vendit ta kuptojnë dhe konfirmojnë ftesën me lehtësi." },
];

function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section style={{ background: WHITE, padding: "88px 0", borderTop: "1px solid #ede8e2" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px" }}>
        <FadeUp>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: WINE, textTransform: "uppercase", marginBottom: 12 }}>
              PYETJET MË TË SHPESHTA
            </p>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: DARK, textTransform: "uppercase" }}>
              Pyetje & Përgjigje
            </h2>
          </div>
        </FadeUp>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                background: CREAM,
                borderRadius: 12,
                border: "1px solid #eae3d9",
                overflow: "hidden",
                transition: "all .2s",
              }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 15,
                  fontWeight: 700,
                  color: DARK,
                }}
              >
                <span>{faq.q}</span>
                <span style={{ fontSize: 20, color: WINE, fontWeight: 300, transition: "transform .2s", transform: openIdx === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
              {openIdx === i && (
                <div style={{ padding: "0 24px 20px 24px", fontSize: 14, color: MUTED, lineHeight: 1.8, borderTop: "1px solid #eae3d9", paddingTop: 16 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════
   CONTACT SECTION & FORM — luxury contact form at bottom
═══════════════════════════════════════════════════════════ */
function ContactSection() {
  const { t } = useLanguage();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "wedding",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <section id="contact" style={{ background: CREAM, padding: "100px 0", borderTop: "1px solid #ede7e0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>
        <FadeUp>
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 60px" }}>
            <span
              style={{
                display: "inline-block",
                background: "rgba(123, 31, 58, 0.08)",
                color: WINE,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.15em",
                padding: "6px 16px",
                borderRadius: 20,
                marginBottom: 16,
                textTransform: "uppercase",
              }}
            >
              {t("contact.badge", "FORMULAR KONTAKTI")}
            </span>
            <h2
              style={{
                fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
                fontWeight: 900,
                color: DARK,
                lineHeight: 1.2,
                marginBottom: 16,
                letterSpacing: "-0.02em",
              }}
            >
              {t("contact.title", "Keni Pyetje Apo dëshironi një Demoni?")}
            </h2>
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.6 }}>
              {t(
                "contact.subtitle",
                "Plotësoni formularin më poshtë dhe ekipi ynë do t'ju kontaktojë brenda pak minutave me të gjitha detajet."
              )}
            </p>
          </div>
        </FadeUp>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.3fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* Left Column: Contact info & card */}
          <FadeUp delay={0.1}>
            <div
              style={{
                background: WINE,
                color: WHITE,
                borderRadius: 24,
                padding: "48px 40px",
                boxShadow: "0 20px 40px rgba(123, 31, 58, 0.15)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle background glow circle */}
              <div
                style={{
                  position: "absolute",
                  top: "-20%",
                  right: "-20%",
                  width: 260,
                  height: 260,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)",
                  pointerEvents: "none",
                }}
              />

              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
                {t("contact.info_title", "Informatat e Kontaktit")}
              </h3>
              <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.8)", marginBottom: 36, lineHeight: 1.6 }}>
                Ekipi ynë është në dispozicion për t'ju ndihmuar të krijoni përvojën më të mirë për ngjarjen tuaj.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={20} color={WHITE} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                      Vendndodhja
                    </h4>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{t("contact.address", "Prishtinë 10000, Kosovë")}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={20} color={WHITE} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                      Email
                    </h4>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>info@noa-event.com</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={20} color={WHITE} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                      Telefon & WhatsApp
                    </h4>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>+383 44 000 000</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={20} color={WHITE} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                      Orari i Punës
                    </h4>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{t("contact.working_hours", "E Hënë - E Shtunë: 08:00 - 20:00")}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Right Column: Contact Form */}
          <FadeUp delay={0.2}>
            <div
              style={{
                background: WHITE,
                borderRadius: 24,
                padding: "48px 40px",
                border: "1px solid #ede7e0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "#e6f4ea",
                      color: "#137333",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Check size={32} strokeWidth={2.5} />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: DARK, marginBottom: 12 }}>
                    {t("contact.success_title", "Faleminderit!")}
                  </h3>
                  <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.6, maxWidth: 440, marginBottom: 28 }}>
                    {t(
                      "contact.success",
                      "Mesazhi juaj u dërgua me sukses! Ekipi ynë do t'ju kontaktojë brenda pak minutave."
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: "", email: "", phone: "", eventType: "wedding", message: "" });
                    }}
                    style={{
                      padding: "12px 24px",
                      background: WINE,
                      color: WHITE,
                      borderRadius: 8,
                      border: "none",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Dërgo Mesazh Tjetër
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
                        {t("contact.name", "Emri dhe Mbiemri")} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder={t("contact.name_placeholder", "n.sh. Agon Berisha")}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid #dcd7d0",
                          fontSize: 14,
                          outline: "none",
                          background: CREAM,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
                        {t("contact.email", "Adresa Email")} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder={t("contact.email_placeholder", "emri@shembull.com")}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid #dcd7d0",
                          fontSize: 14,
                          outline: "none",
                          background: CREAM,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
                        {t("contact.phone", "Numri i Telefonit (WhatsApp)")}
                      </label>
                      <input
                        type="tel"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        placeholder={t("contact.phone_placeholder", "+383 44 123 456")}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid #dcd7d0",
                          fontSize: 14,
                          outline: "none",
                          background: CREAM,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
                        {t("contact.event_type", "Lloji i Eventit")}
                      </label>
                      <select
                        value={formState.eventType}
                        onChange={(e) => setFormState({ ...formState, eventType: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: 8,
                          border: "1px solid #dcd7d0",
                          fontSize: 14,
                          outline: "none",
                          background: CREAM,
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="wedding">{t("contact.event_wedding", "Dasmë")}</option>
                        <option value="engagement">{t("contact.event_engagement", "Fejesë")}</option>
                        <option value="birthday">{t("contact.event_birthday", "Ditëlindje")}</option>
                        <option value="corporate">{t("contact.event_corporate", "Event Korporativ / Konferencë")}</option>
                        <option value="other">{t("contact.event_other", "Tjetër")}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
                      {t("contact.message", "Mesazhi apo Pyetja Juaj")} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder={t(
                        "contact.message_placeholder",
                        "Përshkruani datën e parashikuar, numrin e mysafirëve apo ndonjë kërkesë të veçantë..."
                      )}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #dcd7d0",
                        fontSize: 14,
                        outline: "none",
                        background: CREAM,
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: "16px 32px",
                      background: WINE,
                      color: WHITE,
                      borderRadius: 8,
                      border: "none",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      opacity: isSubmitting ? 0.7 : 1,
                      transition: "all .2s ease",
                      marginTop: 8,
                    }}
                  >
                    <Send size={16} />
                    {isSubmitting
                      ? t("contact.submitting", "Duke dërguar...")
                      : t("contact.submit", "Dërgo Mesazhin")}
                  </button>
                </form>
              )}
            </div>
          </FadeUp>
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
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  return (
    <footer>
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
              {t("footer.sub_title", "Abonohu Sot dhe Kurseni 20% Në Planin e Parë")}
            </h3>
          </div>
          {/* Right: input + button */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t("footer.sub_placeholder", "Shkruani Adresën Email")}
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
              Abonohu Tani
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
              src="/logo-full.png"
              alt="NoaEvent"
              style={{ height: 200, width: "auto", marginBottom: 20, objectFit: "contain" }}
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("pro");

  const handleOpenModal = (plan: PlanKey = "pro") => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <div style={{ background: WHITE, color: DARK, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <TopBar onOpenModal={handleOpenModal} />
      <Navbar onOpenModal={handleOpenModal} />
      <Hero />
      <WelcomeSection />
      <ServicesSection />
      <HallSection />
      <EventSavingsCalculator onOpenModal={handleOpenModal} />
      <Testimonials />
      <PricingSection onOpenModal={handleOpenModal} />
      <FaqSection />
      <ContactSection />
      <Footer />

      <FloatingCtaBar onOpenModal={handleOpenModal} />

      <PlanRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlanKey={selectedPlan}
      />
    </div>
  );
}

