import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, Users, LayoutDashboard, Mail, Map, QrCode, CalendarDays, Heart, MapPin, Facebook, Instagram, Phone } from "lucide-react";

/* ─── Exact Gademan palette ─────────────────────────────── */
const WINE   = "#7B1F3A";   // wine/maroon — buttons, hero bg, footer
const WHITE  = "#FFFFFF";
const CREAM  = "#FAF8F5";   // off-white sections
const DARK   = "#2d1a1f";   // dark text (not pure black — Gademan uses dark-maroon text)
const MUTED  = "#6b6b6b";
const TOPBAR_BG = "#1a0a10"; // very dark top bar

/* ─── Reveal ────────────────────────────────────────────── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOP BAR — dark, small, exact Gademan style
   "Edisonstraat 19..." left | "Klant Worden? Account FB" right
═══════════════════════════════════════════════════════════ */
function TopBar() {
  return (
    <div style={{ background: TOPBAR_BG, color: "rgba(255,255,255,0.70)", fontSize: 12, padding: "7px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={12} /> Prishtinë 10000, Kosovë
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Mail size={12} /> info@noa-event.com
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Link href="/sign-in"><span style={{ cursor: "pointer" }}>Bëhu Klient?</span></Link>
        <Link href="/sign-in"><span style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <Heart size={12} /> Llogaria
        </span></Link>
        <Facebook size={12} style={{ cursor: "pointer" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR — WHITE background, logo protrudes, dark links,
             wine "Become A Customer?" button — EXACT Gademan
═══════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { href: "#home",     label: "HOME"       },
  { href: "#services", label: "SHËRBIMET"  },
  { href: "#history",  label: "HISTORIA"   },
  { href: "#hall",     label: "SALLA"      },
  { href: "#order",    label: "ÇMIMET"     },
];

function Navbar() {
  const [active, setActive] = useState("#home");
  return (
    /* sticky wrapper */
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: WHITE, borderBottom: "1px solid #ece8e4" }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 32px",
        height: 80,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative",
      }}>

        {/* ── Circular logo — protrudes top & bottom exactly like Gademan ── */}
        <div style={{ position: "relative", flexShrink: 0, zIndex: 10 }}>
          <div style={{
            width: 100, height: 100,
            borderRadius: "50%",
            background: WHITE,
            border: "2px solid #d4c9b8",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            /* protrude: nav is 80px, logo 100px → 10px top + 10px bottom */
            marginTop: -20, marginBottom: -20,
            position: "relative", zIndex: 10,
          }}>
            {/* Inner decorative ring — like Gademan stamp */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              border: "1.5px solid #c8b99a",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 2, textAlign: "center",
            }}>
              <Heart size={14} color={WINE} />
              <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", color: WINE, textTransform: "uppercase", lineHeight: 1 }}>NoaEvent</span>
              <span style={{ fontSize: 6, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>Ambachtelijke</span>
              <span style={{ fontSize: 6, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>Evente</span>
            </div>
          </div>
        </div>

        {/* ── Links centered — dark text, active underlined ── */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = active === href;
            return (
              <a key={href} href={href} onClick={() => setActive(href)}
                style={{
                  fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
                  color: DARK,
                  textDecoration: isActive ? "underline" : "none",
                  textUnderlineOffset: 4, textDecorationThickness: 2,
                  textDecorationColor: DARK,
                  opacity: isActive ? 1 : 0.8,
                  cursor: "pointer", transition: "opacity 0.15s",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = isActive ? "1" : "0.8")}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* ── "Become A Customer?" — wine bg, white text, rounded — exact Gademan ── */}
        <div style={{ flexShrink: 0 }}>
          <Link href="/sign-up">
            <span style={{
              display: "inline-block",
              background: WINE,
              color: WHITE,
              padding: "10px 24px",
              borderRadius: 6,
              fontSize: 13, fontWeight: 700,
              letterSpacing: "0.04em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              Bëhu Klient?
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO — full-width wine/maroon bg with photo + title + CTA
   (same as Gademan hero: bold white text, wine bg overlay)
═══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section id="home" style={{ position: "relative", minHeight: "72vh", background: WINE, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
      {/* Background photo */}
      <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80"
        alt="Wedding" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* Wine overlay */}
      <div style={{ position: "absolute", inset: 0, background: `${WINE}CC` }} />

      {/* Text — bottom-left, bold white uppercase like Gademan */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", zIndex: 10, padding: "0 80px 64px" }}>
        <h1 style={{
          color: WHITE, fontWeight: 900, fontSize: "clamp(2rem, 4.5vw, 3.8rem)",
          letterSpacing: "0.04em", lineHeight: 1.2, marginBottom: 28, textTransform: "uppercase",
        }}>
          MIRË ERDHËT NË<br />
          NOAEVENT
        </h1>
        <Link href="/sign-up">
          <span style={{
            display: "inline-block", background: WHITE, color: WINE,
            padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 14,
            letterSpacing: "0.04em", cursor: "pointer", transition: "opacity 0.15s",
          }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            Bëhu Klient?
          </span>
        </Link>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   WELCOME — white bg, image LEFT, text + CTA RIGHT
   (Gademan "Welkom bij" section)
═══════════════════════════════════════════════════════════ */
function WelcomeSection() {
  return (
    <section style={{ background: WHITE, padding: "80px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <Reveal>
          <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"
            alt="Wedding planning" style={{ width: "100%", maxHeight: 500, objectFit: "cover" }} />
        </Reveal>
        <Reveal delay={0.1}>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: DARK, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.25, marginBottom: 24 }}>
            MIRË ERDHËT NË<br />NOAEVENT
          </h2>
          <p style={{ color: MUTED, lineHeight: 1.8, marginBottom: 16 }}>
            Ne punojmë me shumë dashuri, pasion dhe kujdes për të krijuar eventin e ëndrrave tuaja. Platforma jonë është ndërtuar posaçërisht për dasmat dhe ngjarjet shqiptare — nga ftesa e parë digjitale deri tek check-in i fundit.
          </p>
          <p style={{ color: MUTED, lineHeight: 1.8, marginBottom: 32 }}>
            Teknologjia jonë garanton higjenë dhe profesionalizëm të lartë. Jemi krenarë për transparencën, bashkëpunimin dhe marrëdhënien e personalizuar me çdo klient. Jemi krenarë për platformën tonë dhe dasmën tuaj!
          </p>
          <Link href="/sign-up">
            <span style={{ display: "inline-block", background: WINE, color: WHITE, padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", cursor: "pointer" }}>
              Bëhu Klient?
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HISTORY — b&w-style photo RIGHT, dark card LEFT with white text
   (Gademan "Historie" section: dark maroon card + photo)
═══════════════════════════════════════════════════════════ */
function HistorySection() {
  return (
    <section id="history" style={{ background: CREAM, padding: "80px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, alignItems: "stretch" }}>
        {/* Dark card left */}
        <Reveal>
          <div style={{ background: WINE, padding: "64px 56px", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 460 }}>
            <h2 style={{ color: WHITE, fontWeight: 900, fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 24 }}>
              HISTORIA
            </h2>
            <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.8, marginBottom: 16, fontSize: 15 }}>
              NoaEvent u themelua nga pasioni për organizimin e eventeve të veçanta. Filloi si një ide e thjeshtë — si mund t'i ndihmojmë çiftet të organizojnë dasmën e tyre pa stres dhe me elegancë të pashoqe.
            </p>
            <p style={{ color: "rgba(255,255,255,0.82)", lineHeight: 1.8, marginBottom: 36, fontSize: 15 }}>
              Sot, me mbi 200 dasma të organizuara dhe mijëra mysafirë të menaxhuar, NoaEvent ka u bërë platforma kryesore e eventeve premium në Kosovë dhe rajon.
            </p>
            <Link href="/sign-up">
              <span style={{ display: "inline-block", border: "1.5px solid rgba(255,255,255,0.55)", color: WHITE, padding: "10px 24px", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", cursor: "pointer", borderRadius: 4, textTransform: "uppercase" }}>
                Lexo Më Shumë...
              </span>
            </Link>
          </div>
        </Reveal>

        {/* Photo right — slight desaturation like Gademan b&w */}
        <Reveal delay={0.1}>
          <img src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80"
            alt="History" style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 460, filter: "grayscale(30%) contrast(1.05)" }} />
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SMAKEN / SERVICES — centered title + description,
   then 2 large cards with photo bg + centered title + CTA button
   (Exact Gademan "Smaken" section: Sorbetijs + Melkijs layout)
═══════════════════════════════════════════════════════════ */
const SERVICE_CARDS = [
  {
    label: "Ftesa Digjitale",
    img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    href: "/sign-up",
  },
  {
    label: "Hall Designer",
    img: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80",
    href: "/sign-up",
  },
];

function ServicesSection() {
  return (
    <section id="services" style={{ background: WHITE, padding: "80px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>
        {/* Centered text block — like Gademan "Smaken" description */}
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(2rem, 3.5vw, 3rem)", color: DARK, textTransform: "none", letterSpacing: "0.02em", marginBottom: 20 }}>
              Shërbimet
            </h2>
            <p style={{ color: MUTED, lineHeight: 1.8, maxWidth: 680, margin: "0 auto", fontSize: 15 }}>
              Lërini zemrën tuaj të flasë dhe ne do të kujdesemi për çdo detaj të ditës suaj të veçantë.
              Nga ftesat digjitale tek plani i sallës — gjithçka në një platformë elegante dhe intuitive.
              Nuk gjeni atë që kërkoni? Kontaktoni ekipin tonë dhe do të gjejmë zgjidhjen e duhur.
            </p>
          </div>
        </Reveal>

        {/* Two large photo cards side by side — exact Gademan layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {SERVICE_CARDS.map((card, i) => (
            <Reveal key={card.label} delay={i * 0.1}>
              <div style={{
                position: "relative", overflow: "hidden",
                border: "1px solid #e8e0d8",
                display: "flex", flexDirection: "column",
              }}>
                {/* Photo */}
                <div style={{ height: 280, overflow: "hidden" }}>
                  <img src={card.img} alt={card.label}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1.04)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                  />
                </div>
                {/* Card body: title + button */}
                <div style={{ textAlign: "center", padding: "32px 24px", background: WHITE }}>
                  <h3 style={{ fontWeight: 800, fontSize: 22, color: DARK, marginBottom: 20, letterSpacing: "0.03em" }}>
                    {card.label}
                  </h3>
                  <Link href={card.href}>
                    <span style={{
                      display: "inline-block", border: `2px solid ${WINE}`,
                      color: WINE, padding: "9px 28px", fontWeight: 700,
                      fontSize: 13, letterSpacing: "0.08em", cursor: "pointer", borderRadius: 4,
                      transition: "all 0.18s",
                    }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = WINE; el.style.color = WHITE; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = WINE; }}
                    >
                      Shiko Shërbimin
                    </span>
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Second row: 4 smaller feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginTop: 24 }}>
          {[
            { label: "QR Check-in",     img: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=70" },
            { label: "RSVP Automatik",  img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=70" },
            { label: "Mysafirët",        img: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=400&q=70" },
            { label: "Seat Planner",    img: "https://images.unsplash.com/photo-1429514513361-8a632ff5e384?w=400&q=70" },
          ].map((card, i) => (
            <Reveal key={card.label} delay={i * 0.07}>
              <div style={{ border: "1px solid #e8e0d8", overflow: "hidden" }}>
                <div style={{ height: 160, overflow: "hidden" }}>
                  <img src={card.img} alt={card.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ textAlign: "center", padding: "20px 12px", background: WHITE }}>
                  <h3 style={{ fontWeight: 800, fontSize: 15, color: DARK, marginBottom: 12, letterSpacing: "0.03em" }}>{card.label}</h3>
                  <Link href="/sign-up">
                    <span style={{ display: "inline-block", border: `1.5px solid ${WINE}`, color: WINE, padding: "6px 16px", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", cursor: "pointer", borderRadius: 4 }}>
                      Shiko →
                    </span>
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HALL SECTION — text left + photo right (Gademan "Preparation")
═══════════════════════════════════════════════════════════ */
function HallSection() {
  return (
    <section id="hall" style={{ background: CREAM, padding: "80px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <Reveal>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: WINE, textTransform: "uppercase", marginBottom: 12 }}>
            HALL DESIGNER
          </p>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: DARK, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.25, marginBottom: 24 }}>
            KRIJONI PLANIN<br />E SALLËS
          </h2>
          <p style={{ color: MUTED, lineHeight: 1.8, marginBottom: 16 }}>
            Salla e dasmës suaj është kanavaca juaj. Ndërtoni planimetrinë vizuale, vendosni tavolinat me drag & drop dhe ulni çdo mysafir me saktësi dhe elegancë.
          </p>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: 32 }}>
            {["Vizualizim 2D i sallës në kohë reale", "Menaxhim i kapacitetit dhe vendosjeve", "Kategorizim VIP, Familje & Shoqëri"].map(item => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 14, color: DARK }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${WINE}` }}>
                  <Check size={11} color={WINE} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link href="/sign-up">
            <span style={{ display: "inline-block", background: WINE, color: WHITE, padding: "12px 28px", borderRadius: 6, fontWeight: 700, fontSize: 14, letterSpacing: "0.04em", cursor: "pointer" }}>
              Zbuloni Mundësitë
            </span>
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", bottom: -8, right: -8, width: "100%", height: "100%", background: `${WINE}18` }} />
            <img src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80"
              alt="Hall" style={{ width: "100%", maxHeight: 480, objectFit: "cover", position: "relative" }} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS — centered quote slider (Gademan "Ervaringen")
═══════════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  { name: "Arta & Besniku", role: "Prishtinë, 2024", q: "NoaEvent e bëri organizimin e dasmës tonë gjë kënaqësi. QR check-in funksionoi pa asnjë problem dhe mysafirët ishin të mahnitur me ftesën digjitale!" },
  { name: "Blerim Osmani",  role: "Wedding Planner",  q: "Kam organizuar mbi 40 dasma dhe NoaEvent është mjeti më i mirë që kam përdorur. Hall designer-i kursen orë pune dhe ndihmon të gjithë ekipin." },
  { name: "Drita Hoxha",   role: "Menaxhere Sale",   q: "Klientët tanë janë jashtëzakonisht të kënaqur me ftesat digjitale. Platforma është intuitive dhe mbështetja teknike është fantastike." },
];

function Testimonials() {
  const [idx, setIdx] = useState(0);
  return (
    <section style={{ background: WHITE, padding: "80px 0", textAlign: "center" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: WINE, textTransform: "uppercase", marginBottom: 16 }}>ERVARINGEN</p>
        <h2 style={{ fontWeight: 900, fontSize: "clamp(1.4rem, 2.5vw, 2rem)", color: DARK, marginBottom: 40 }}>Ij që tregon histori. Klientët tanë e ndajnë me kënaqësi.</h2>
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }}>
            <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.85, marginBottom: 24, fontStyle: "italic" }}>"{TESTIMONIALS[idx].q}"</p>
            <p style={{ fontWeight: 700, fontSize: 13, color: DARK, letterSpacing: "0.06em", textTransform: "uppercase" }}>{TESTIMONIALS[idx].name}</p>
            <p style={{ fontSize: 12, color: MUTED }}>{TESTIMONIALS[idx].role}</p>
          </motion.div>
        </AnimatePresence>
        {/* Dot nav */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ width: 8, height: 8, borderRadius: "50%", background: i === idx ? WINE : "#ddd", border: "none", cursor: "pointer", padding: 0, transition: "background 0.2s" }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING — 2 cards with photo strip on top (Gademan order)
═══════════════════════════════════════════════════════════ */
const PLANS = [
  { name: "Starter", price: "€19", period: "/muaj", featured: false, events: "1 event aktiv",
    perks: ["Deri 150 mysafirë", "Ftesa digjitale", "QR Check-in bazik", "Support me email"],
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=70" },
  { name: "Pro",     price: "€49", period: "/muaj", featured: true,  events: "Evente të pakufizuara",
    perks: ["Mysafirë të pakufizuar", "Hall Designer Premium", "RSVP automatik", "Priority support 24/7", "Eksport CSV/Excel"],
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=70" },
];

function PricingSection() {
  return (
    <section id="order" style={{ background: CREAM, padding: "80px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(2rem, 3.5vw, 3rem)", color: DARK, marginBottom: 16 }}>Çmimet</h2>
            <p style={{ color: MUTED, maxWidth: 520, margin: "0 auto" }}>Një investim i vogël për qetësi mendore në ditën tuaj më të madhe.</p>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 900, margin: "0 auto" }}>
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div style={{ position: "relative", background: WHITE, border: `2px solid ${p.featured ? WINE : "#e5e0d8"}`, overflow: "hidden", transition: "transform 0.2s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "translateY(-4px)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
              >
                {p.featured && (
                  <div style={{ position: "absolute", top: 0, right: 24, background: WINE, color: WHITE, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "4px 12px", textTransform: "uppercase", transform: "translateY(-50%)" }}>
                    Më i Popullarizuar
                  </div>
                )}
                <div style={{ height: 140, overflow: "hidden" }}>
                  <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: 32 }}>
                  <h3 style={{ fontWeight: 900, fontSize: 22, color: DARK, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{p.name}</h3>
                  <p style={{ fontSize: 12, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>{p.events}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, color: DARK }}>{p.price}</span>
                    <span style={{ fontSize: 14, color: MUTED }}>{p.period}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: 28 }}>
                    {p.perks.map(perk => (
                      <li key={perk} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 14, color: DARK }}>
                        <Check size={14} color={WINE} /> {perk}
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up">
                    <span style={{
                      display: "block", textAlign: "center", padding: "12px", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", cursor: "pointer", borderRadius: 4,
                      background: p.featured ? WINE : "transparent",
                      color: p.featured ? WHITE : WINE,
                      border: `2px solid ${WINE}`,
                      transition: "all 0.18s",
                    }}>
                      {p.featured ? "Fillo Me Pro" : "Zgjidh Starter"}
                    </span>
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER — photo strip + wine subscribe box + white info grid
   (Exact Gademan footer layout)
═══════════════════════════════════════════════════════════ */
function Footer() {
  const [email, setEmail] = useState("");
  return (
    <footer>
      {/* Photo strip — like Gademan ice cream row */}
      <div style={{ height: 90, overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=60"
          alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
      </div>

      {/* Wine subscribe box — exact Gademan layout */}
      <div style={{ background: WINE, padding: "48px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          {/* Left: image + text */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=60"
              alt="" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: "50%", opacity: 0.7 }} />
            <div>
              <h3 style={{ color: WHITE, fontWeight: 900, fontSize: "clamp(1.2rem, 2vw, 1.6rem)", lineHeight: 1.35 }}>
                Regjistrohu Sot<br />dhe Kurseni 20%<br />Në Planin e Parë
              </h3>
            </div>
          </div>
          {/* Right: input + button */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Shkruani Adresën Email"
              style={{ width: "100%", padding: "13px 16px", fontSize: 14, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: WHITE, outline: "none", boxSizing: "border-box" }}
            />
            <button style={{ width: "100%", padding: "13px 0", background: WHITE, color: WINE, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", letterSpacing: "0.04em" }}>
              Regjistrohu Tani
            </button>
          </div>
        </div>
      </div>

      {/* White info grid — exact Gademan 4-column footer */}
      <div style={{ background: WHITE, padding: "48px 0 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 32 }}>
          {/* Col 1: Company */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", border: "1.5px solid #c8b99a", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM }}>
                <Heart size={18} color={WINE} />
              </div>
            </div>
            <p style={{ fontWeight: 700, fontSize: 14, color: DARK, marginBottom: 6 }}>NoaEvent</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>Adresa: Prishtinë 10000, Kosovë</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>Tel: +383 44 000 000</p>
            <p style={{ fontSize: 13, color: MUTED }}>Email: info@noa-event.com</p>
          </div>
          {/* Col 2: Bank info (like Gademan) */}
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: DARK, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Banka</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}><strong style={{ color: DARK }}>Bank:</strong> Raiffeisen</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}><strong style={{ color: DARK }}>IBAN:</strong> XK05 1234 0000 0000 0000</p>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}><strong style={{ color: DARK }}>NUI:</strong> 811234567</p>
            <p style={{ fontSize: 13, color: MUTED }}><strong style={{ color: DARK }}>TVSH:</strong> 123456789</p>
          </div>
          {/* Col 3: empty or services */}
          <div />
          {/* Col 4: Legal links — bold like Gademan */}
          <div>
            {["Dokumentet", "Politika Cookie", "Privatësia", "Disclaimer"].map(l => (
              <p key={l} style={{ fontWeight: 700, fontSize: 13, color: DARK, marginBottom: 8, cursor: "pointer" }}>{l}</p>
            ))}
          </div>
        </div>
        {/* Bottom line */}
        <div style={{ maxWidth: 1280, margin: "24px auto 0", padding: "16px 48px 0", borderTop: "1px solid #e8e0d8", fontSize: 12, color: MUTED, textAlign: "center" }}>
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
    <div style={{ background: WHITE, color: DARK, fontFamily: "system-ui, -apple-system, sans-serif" }}>
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
