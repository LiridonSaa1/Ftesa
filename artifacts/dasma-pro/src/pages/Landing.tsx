import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Check, CalendarDays, Users, QrCode, LayoutDashboard,
  Mail, Map, ChevronLeft, ChevronRight, Heart, Sparkles,
  Facebook, Instagram, Phone, MapPin,
} from "lucide-react";

/* ─── Palette (Gademan-style: wine/maroon + white + cream) ─ */
const WINE   = "#7B1F3A";   // primary dark wine/maroon
const WINE2  = "#9B2A4A";   // slightly lighter
const WHITE  = "#FFFFFF";
const CREAM  = "#FAF8F5";   // off-white cream bg
const DARK   = "#1a1a1a";   // near-black text
const MUTED  = "#666666";   // muted text

/* ─── Reveal animation ──────────────────────────────────── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ──────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: "#welcome",    label: "BALLINA"    },
  { href: "#features",   label: "SHËRBIMET"  },
  { href: "#hall",       label: "SALLA"      },
  { href: "#pricing",    label: "ÇMIMET"     },
];

const FEATURES = [
  { icon: Users,         label: "Menaxhim Mysafirësh", desc: "Shtoni, importoni dhe organizoni mysafirët sipas familjes, kategorisë dhe statusit RSVP — gjithçka në një vend." },
  { icon: LayoutDashboard,label: "Hall Designer",      desc: "Krijoni planin vizual të sallës me drag & drop — tavolina, karriger, skenë dhe çdo detaj tjetër." },
  { icon: Mail,          label: "Ftesa Digjitale",     desc: "Dërgoni ftesa elegante me link unik dhe QR code. Çdo mysafir merr faqe personale me countdown live." },
  { icon: QrCode,        label: "QR Check-in",         desc: "Stafi skanon QR-in me telefon dhe sistemi tregon menjëherë emrin, tavolinën dhe vendin e mysafirit." },
  { icon: CalendarDays,  label: "RSVP Automatik",      desc: "Mysafirët konfirmojnë ose refuzojnë me një klik. Dashboardi përditësohet në kohë reale automatikisht." },
  { icon: Map,           label: "Seat Planner",         desc: "Pamje e plotë me tavolina, karriger dhe emrat e mysafirëve. Gjithçka vizuale dhe intuitive." },
];

const PLANS = [
  {
    name: "Starter", price: "€19", period: "/muaj", featured: false,
    events: "1 event aktiv",
    perks: ["Deri 150 mysafirë", "Ftesa digjitale", "QR Check-in bazik", "Support me email"],
  },
  {
    name: "Pro", price: "€49", period: "/muaj", featured: true,
    events: "Evente të pakufizuara",
    perks: ["Mysafirë të pakufizuar", "Hall Designer Premium", "RSVP automatik", "Priority support 24/7", "Eksport CSV/Excel"],
  },
];

const TESTIMONIALS = [
  { name: "Arta & Besniku", role: "Prishtinë, 2024", quote: "NoaEvent e bëri organizimin e dasmës tonë gjë kënaqësi. QR check-in funksionoi pa asnjë problem dhe mysafirët ishin të mahnitur me ftesën digjitale!" },
  { name: "Blerim Osmani", role: "Wedding Planner", quote: "Kam organizuar mbi 40 dasma dhe NoaEvent është mjeti më i mirë që kam përdorur. Hall designer-i kursen orë pune dhe ndihmon të gjithë ekipin." },
  { name: "Drita Hoxha", role: "Menaxhere Sale", quote: "Klientët tanë janë jashtëzakonisht të kënaqur me ftesat digjitale. Platforma është intuitive dhe mbështetja teknike është fantastike." },
];

/* ═══════════════════════════════════════════════════════════
   TOP BAR (like Gademan: address + contact bar)
═══════════════════════════════════════════════════════════ */
function TopBar() {
  return (
    <div className="hidden md:flex items-center justify-between px-8 py-2 text-xs" style={{ background: DARK, color: "#aaa" }}>
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Prishtinë, Kosovë</span>
        <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> info@noa-event.com</span>
      </div>
      <div className="flex items-center gap-6">
        <span>Bëhu Klient?</span>
        <span className="flex items-center gap-1.5"><Facebook className="h-3 w-3" /> <Instagram className="h-3 w-3" /></span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAV (like Gademan: logo center-left + links + CTA button)
═══════════════════════════════════════════════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 transition-all"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : WHITE,
        borderBottom: `1px solid #e5e5e5`,
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: WINE }}>
            <Heart className="h-5 w-5" style={{ color: WINE }} />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-lg tracking-wide" style={{ color: DARK }}>NoaEvent</span>
            <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: MUTED }}>Wedding Platform</p>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-xs font-bold tracking-[0.15em] transition-colors hover:underline underline-offset-4"
              style={{ color: DARK, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = WINE)}
              onMouseLeave={e => (e.currentTarget.style.color = DARK)}
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <span className="hidden sm:block text-xs font-bold tracking-widest cursor-pointer transition-colors" style={{ color: MUTED }}>Hyr</span>
          </Link>
          <Link href="/sign-up">
            <span
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer border-2 transition-all hover:opacity-80"
              style={{ borderColor: WINE, color: WINE, background: WHITE }}
            >
              Bëhu Klient?
            </span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO — full-width photo with dark wine overlay + bold text
   (saktësisht si Gademan hero)
═══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section
      id="welcome"
      className="relative w-full flex items-end overflow-hidden"
      style={{ minHeight: "80vh" }}
    >
      {/* Background photo */}
      <img
        src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80"
        alt="Wedding"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Wine/maroon overlay — exactly like Gademan */}
      <div className="absolute inset-0" style={{ background: `${WINE}CC` }} />

      {/* Hero text — bottom-left aligned, like Gademan */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 px-8 md:px-20 pb-16 pt-32 w-full"
      >
        <h1
          className="font-black text-white leading-tight mb-6 uppercase"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "0.02em" }}
        >
          MIRË ERDHËT NË<br />
          NOAEVENT
        </h1>
        <Link href="/sign-up">
          <span
            className="inline-block px-8 py-3 font-bold text-sm uppercase tracking-widest cursor-pointer border-2 border-white text-white hover:bg-white transition-all"
            style={{ color: WHITE }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = WINE; (e.currentTarget as HTMLElement).style.background = WHITE; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = WHITE; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            Bëhu Klient?
          </span>
        </Link>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   WELCOME SECTION — white bg, photo LEFT + bold text RIGHT
   (si seksioni "Welkom bij" i Gademan)
═══════════════════════════════════════════════════════════ */
function WelcomeSection() {
  return (
    <section className="py-20" style={{ background: WHITE }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image left */}
          <Reveal>
            <img
              src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"
              alt="Wedding planning"
              className="w-full object-cover"
              style={{ maxHeight: 500 }}
            />
          </Reveal>

          {/* Text right */}
          <Reveal delay={0.1}>
            <h2
              className="font-black uppercase leading-tight mb-6"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: DARK, letterSpacing: "0.02em" }}
            >
              MIRË ERDHËT NË<br />
              NOAEVENT
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: MUTED }}>
              Ne punojmë me shumë dashuri, pasion dhe kujdes për të krijuar eventin tuaj të ëndrrave. Platforma jonë është krijuar posaçërisht për dasmave shqiptare — nga ftesa e parë digjitale deri tek check-in i fundit.
            </p>
            <p className="leading-relaxed mb-8" style={{ color: MUTED }}>
              Ekipi ynë ka ndihmuar mbi 200 çifte të organizojnë ditën e tyre të veçantë me elegancë dhe precizion. Jemi krenarë për platformën tonë dhe shërbimin premium ndaj çdo klienti.
            </p>
            <Link href="/sign-up">
              <span
                className="inline-block px-8 py-3 font-bold text-sm uppercase tracking-widest cursor-pointer text-white transition-all hover:opacity-85"
                style={{ background: WINE }}
              >
                Bëhu Klient?
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HISTORY / STORY SECTION — photo RIGHT + dark card LEFT
   (si seksioni "Historie" i Gademan me kard bordo + foto b&w)
═══════════════════════════════════════════════════════════ */
function StorySection() {
  return (
    <section className="py-20 overflow-hidden" style={{ background: CREAM }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-0 items-stretch">
          {/* Dark card left */}
          <Reveal>
            <div
              className="flex flex-col justify-center p-12 md:p-16"
              style={{ background: WINE, color: WHITE, minHeight: 460 }}
            >
              <h2 className="font-black text-3xl md:text-4xl uppercase mb-6" style={{ letterSpacing: "0.02em" }}>
                HISTORIA JONË
              </h2>
              <p className="leading-relaxed mb-4 text-white/80">
                NoaEvent u themelua nga pasioni për organizimin e eventeve të veçanta. Filloi si një ide e thjeshtë — si mund t'i ndihmojmë çiftet të organizojnë dasmën e tyre pa stres dhe me elegancë.
              </p>
              <p className="leading-relaxed mb-8 text-white/80">
                Sot, me mbi 200 dasma të organizuara dhe mijëra mysafirë të menaxhuar, NoaEvent ka u bërë platforma kryesore e eventeve në Kosovë dhe rajon.
              </p>
              <Link href="/sign-up">
                <span
                  className="inline-block border border-white/60 px-7 py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer text-white transition-all hover:bg-white hover:text-[#7B1F3A]"
                >
                  Lexo Më Shumë...
                </span>
              </Link>
            </div>
          </Reveal>

          {/* Photo right (slightly desaturated effect) */}
          <Reveal delay={0.1}>
            <img
              src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80"
              alt="Wedding story"
              className="w-full h-full object-cover"
              style={{ minHeight: 460, filter: "grayscale(20%)" }}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURES / SERVICES — white bg, centered title + 6 cards
   (si seksioni "Smaken" i Gademan me kartat e produkteve)
═══════════════════════════════════════════════════════════ */
function FeaturesSection() {
  const SERVICE_IMAGES = [
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
    "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=80",
    "https://images.unsplash.com/photo-1429514513361-8a632ff5e384?w=600&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&q=80",
  ];

  return (
    <section id="features" className="py-20" style={{ background: WHITE }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal className="text-center mb-16">
          <h2
            className="font-black uppercase mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: DARK, letterSpacing: "0.05em" }}
          >
            Shërbimet
          </h2>
          <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            Zbuloni gamën tonë të shërbimeve dhe lini tingujt e zemrës tuaj të flasin. Ndërtojmë eventin tuaj të ëndrrave me precizion dhe kujdes.
            <br />Nuk gjeni atë që kërkoni? Kontaktoni ekipin tonë dhe do të gjejmë zgjidhjen e duhur.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.07}>
              <div className="group border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg" style={{ borderColor: "#e5e5e5" }}>
                {/* Card image */}
                <div className="relative overflow-hidden" style={{ height: 200 }}>
                  <img
                    src={SERVICE_IMAGES[i % SERVICE_IMAGES.length]}
                    alt={f.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Card body */}
                <div className="p-6 text-center" style={{ background: WHITE }}>
                  <h3 className="font-bold text-lg mb-2 uppercase tracking-wide" style={{ color: DARK, letterSpacing: "0.05em" }}>
                    {f.label}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: MUTED }}>{f.desc}</p>
                  <Link href="/sign-up">
                    <span
                      className="inline-block border px-5 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all hover:bg-[#7B1F3A] hover:text-white hover:border-[#7B1F3A]"
                      style={{ borderColor: WINE, color: WINE }}
                    >
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
   HALL SECTION — dark photo + text (like Gademan preparation)
═══════════════════════════════════════════════════════════ */
function HallSection() {
  return (
    <section id="hall" className="py-20 overflow-hidden" style={{ background: CREAM }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text left */}
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: WINE }}>HALL DESIGNER</p>
            <h2
              className="font-black uppercase leading-tight mb-6"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: DARK, letterSpacing: "0.02em" }}
            >
              KRIJONI PLANIN<br />E SALLËS
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: MUTED }}>
              Salla e dasmës suaj është kanavaca juaj. Ndërtoni planimetrinë vizuale, vendosni tavolinat, dhe ulni mysafirët tuaj me ndërfaqe drag-and-drop.
            </p>
            <ul className="space-y-3 mb-8">
              {["Vizualizim 2D i sallës në kohë reale", "Menaxhim i kapacitetit dhe vendosjeve", "Kategorizim VIP, Familje dhe Shoqëri"].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm" style={{ color: DARK }}>
                  <div
                    className="w-5 h-5 flex items-center justify-center border rounded-full shrink-0"
                    style={{ borderColor: WINE, color: WINE }}
                  >
                    <Check className="h-3 w-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/sign-up">
              <span
                className="inline-block px-8 py-3 font-bold text-sm uppercase tracking-widest cursor-pointer border-2 transition-all hover:opacity-80"
                style={{ borderColor: WINE, color: WHITE, background: WINE }}
              >
                Zbuloni Mundësitë
              </span>
            </Link>
          </Reveal>

          {/* Image right */}
          <Reveal delay={0.1}>
            <div className="relative">
              <div className="absolute -bottom-4 -right-4 w-full h-full" style={{ background: `${WINE}20` }} />
              <img
                src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80"
                alt="Hall layout"
                className="relative w-full object-cover"
                style={{ maxHeight: 480 }}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIAL — centered quote (like Gademan inline quote)
═══════════════════════════════════════════════════════════ */
function TestimonialSection() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);
  const t = TESTIMONIALS[idx];
  return (
    <section className="py-24 text-center px-6" style={{ background: WHITE }}>
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <p
              className="font-bold italic leading-relaxed mb-8"
              style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", color: DARK, fontFamily: "Georgia, serif" }}
            >
              "{t.quote}"
            </p>
            <div className="flex items-center justify-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style={{ background: WINE }}
              >
                {t.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-bold text-sm uppercase tracking-wide" style={{ color: DARK }}>{t.name}</p>
                <p className="text-xs" style={{ color: MUTED }}>{t.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === idx ? WINE : "#ddd" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING — 2 cards (like Gademan's order/plan section)
═══════════════════════════════════════════════════════════ */
function PricingSection() {
  return (
    <section id="pricing" className="py-20" style={{ background: CREAM }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Reveal className="text-center mb-16">
          <h2 className="font-black uppercase mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: DARK, letterSpacing: "0.05em" }}>
            Çmimet
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: MUTED }}>
            Një investim i vogël për qetësi mendore në ditën tuaj më të madhe.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <div
                className="relative overflow-hidden border-2 transition-all hover:-translate-y-1"
                style={{ borderColor: p.featured ? WINE : "#e5e5e5", background: WHITE }}
              >
                {p.featured && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: WINE }}>
                    Më i Popullarizuar
                  </div>
                )}
                {/* Card image strip */}
                <div className="overflow-hidden" style={{ height: 140 }}>
                  <img
                    src={p.featured
                      ? "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80"
                      : "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    style={{ filter: `saturate(0.8)` }}
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-black text-2xl uppercase mb-1" style={{ color: DARK, letterSpacing: "0.05em" }}>{p.name}</h3>
                  <p className="text-xs uppercase tracking-widest mb-6" style={{ color: MUTED }}>{p.events}</p>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-black text-4xl" style={{ color: DARK }}>{p.price}</span>
                    <span className="text-sm" style={{ color: MUTED }}>{p.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {p.perks.map(perk => (
                      <li key={perk} className="flex items-center gap-3 text-sm" style={{ color: DARK }}>
                        <Check className="h-4 w-4 shrink-0" style={{ color: WINE }} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up">
                    <span
                      className="block w-full py-3 text-center text-xs font-bold uppercase tracking-widest cursor-pointer border-2 transition-all hover:opacity-80"
                      style={p.featured
                        ? { background: WINE, color: WHITE, borderColor: WINE }
                        : { background: WHITE, color: WINE, borderColor: WINE }}
                    >
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
   FOOTER — photo strip + dark maroon subscribe box + info grid
   (si Gademan footer saktësisht)
═══════════════════════════════════════════════════════════ */
function Footer() {
  const [email, setEmail] = useState("");
  return (
    <footer style={{ background: WHITE }}>
      {/* Photo strip at top — like Gademan's ice cream row */}
      <div className="w-full overflow-hidden" style={{ height: 100 }}>
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=60"
          alt=""
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Subscribe box — dark maroon like Gademan */}
      <div className="py-12 px-6" style={{ background: WINE }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-black text-2xl uppercase text-white mb-2" style={{ letterSpacing: "0.02em" }}>
              Regjistrohuni Sot<br />
              dhe Kurseni 20% Në<br />
              Abonimin e Parë
            </h3>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Adresa Email"
              className="w-full px-4 py-3 text-sm bg-white/20 border border-white/30 text-white placeholder-white/50 outline-none focus:bg-white/25"
            />
            <button
              className="w-full py-3 font-bold text-sm uppercase tracking-widest text-[#7B1F3A] bg-white hover:bg-white/90 transition-all"
            >
              Regjistrohu Tani
            </button>
          </div>
        </div>
      </div>

      {/* Footer info grid */}
      <div className="py-12 px-6 border-t" style={{ borderColor: "#e5e5e5" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: WINE }}>
                <Heart className="h-4 w-4" style={{ color: WINE }} />
              </div>
            </div>
            <p className="font-bold text-sm" style={{ color: DARK }}>NoaEvent</p>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Wedding Platform</p>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Adresa: Prishtinë, Kosovë</p>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Tel: +383 44 000 000</p>
            <p className="text-xs mt-1" style={{ color: MUTED }}>Email: info@noa-event.com</p>
          </div>
          <div>
            <p className="font-bold text-xs uppercase tracking-widest mb-4" style={{ color: DARK }}>Shërbimet</p>
            {["Ftesa Digjitale", "Hall Designer", "RSVP Automatik", "QR Check-in"].map(l => (
              <p key={l} className="text-xs mb-2 cursor-pointer hover:underline" style={{ color: MUTED }}>{l}</p>
            ))}
          </div>
          <div>
            <p className="font-bold text-xs uppercase tracking-widest mb-4" style={{ color: DARK }}>Kompania</p>
            {["Rreth Nesh", "Historia", "Blog", "Partnerë"].map(l => (
              <p key={l} className="text-xs mb-2 cursor-pointer hover:underline" style={{ color: MUTED }}>{l}</p>
            ))}
          </div>
          <div>
            <p className="font-bold text-xs uppercase tracking-widest mb-4" style={{ color: DARK }}>Ligjore</p>
            {["Kushtet e Shërbimit", "Politika e Privatësisë", "Cookie Policy", "Disclaimer"].map(l => (
              <p key={l} className="text-xs mb-2 font-bold cursor-pointer hover:underline" style={{ color: DARK }}>{l}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="py-4 px-6 border-t text-center text-xs" style={{ borderColor: "#e5e5e5", color: MUTED }}>
        © {new Date().getFullYear()} NoaEvent. Të gjitha të drejtat e rezervuara.
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export function Landing() {
  return (
    <div className="min-h-screen" style={{ background: WHITE, color: DARK }}>
      <TopBar />
      <Navbar />
      <Hero />
      <WelcomeSection />
      <StorySection />
      <FeaturesSection />
      <HallSection />
      <TestimonialSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
