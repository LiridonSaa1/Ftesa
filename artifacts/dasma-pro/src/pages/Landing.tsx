import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  Check,
  CalendarDays,
  Users,
  QrCode,
  LayoutDashboard,
  Mail,
  Map,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Clock,
  TrendingUp,
} from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const G = "#C9A96E";   // gold
const C = "#FAF8F5";   // cream
const D = "#1C1917";   // deep onyx
const R = "#E8C4B8";   // blush rose

// ─── Framer variants ──────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] } }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({ opacity: 1, transition: { delay: i * 0.07, duration: 0.6 } }),
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString() + suffix);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(count, to, { duration: 2, ease: "easeOut" });
    return ctrl.stop;
  }, [inView, count, to]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: Users, title: "Menaxhim Mysafirësh", color: "#C9A96E", desc: "Shtoni, importoni dhe organizoni mysafirët sipas familjes, kategorisë dhe statusit RSVP — gjithçka në një vend." },
  { icon: LayoutDashboard, title: "Hall Designer", color: "#8FA88A", desc: "Krijoni planin vizual të sallës me drag & drop — tavolina, karriger, skenë dhe çdo detaj tjetër." },
  { icon: Mail, title: "Ftesa Digjitale", color: R, desc: "Dërgoni ftesa elegante me link unik dhe QR code. Çdo mysafir merr një faqe personale me countdown live." },
  { icon: QrCode, title: "QR Check-in", color: "#8B9DC3", desc: "Stafi skanon QR-in me telefon dhe sistemi tregon menjëherë emrin, tavolinën dhe vendin e mysafirit." },
  { icon: CalendarDays, title: "RSVP Automatik", color: "#C4856A", desc: "Mysafirët konfirmojnë ose refuzojnë me një klik. Dashboardi përditësohet në kohë reale automatikisht." },
  { icon: Map, title: "Seat Planner", color: "#7C9E87", desc: "Pamje e plotë me tavolina, karriger dhe emrat e mysafirëve. Gjithçka vizuale dhe intuitive." },
];

const photos = [
  { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85", caption: "Momente të paharrueshme", sub: "Çdo detaj, i planifikuar me dashuri" },
  { url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=85", caption: "Salla e ëndrrave tuaja", sub: "Dizajnoni çdo tryezë, çdo karrigie" },
  { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&q=85", caption: "Ftesa që lënë gjurmë", sub: "Elegancë digjitale për çdo mysafir" },
  { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1600&q=85", caption: "Bukuria e momentit", sub: "Organizoni me dashuri, jetoni çdo sekondë" },
  { url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1600&q=85", caption: "Dasma e përsosur fillon këtu", sub: "NoaEvent — platforma juaj e besuar" },
];

const testimonials = [
  { name: "Arta Krasniqi", role: "Nuse, Prishtinë 2024", initials: "AK", color: G, quote: "NoaEvent e bëri organizimin e dasmës tonë gjë kënaqësi. QR check-in funksionoi pa asnjë problem dhe mysafirët ishin të mahnitur me ftesën digjitale!" },
  { name: "Blerim Osmani", role: "Wedding Planner, Tiranë", initials: "BO", color: "#8FA88A", quote: "Kam organizuar mbi 40 dasma dhe NoaEvent është mjeti më i mirë që kam përdorur. Hall designer-i kursen orë pune dhe ndihmon të gjithë ekipin." },
  { name: "Drita Hoxha", role: "Menaxhere Sale, Shkodër", initials: "DH", color: "#8B9DC3", quote: "Klientët tanë janë jashtëzakonisht të kënaqur me ftesat digjitale. Platforma është intuitive dhe mbështetja teknike është fantastike." },
];

const stats = [
  { value: 12000, suffix: "+", label: "Mysafirë menaxhuar", icon: Users },
  { value: 480, suffix: "+", label: "Dasma të organizuara", icon: Heart },
  { value: 99, suffix: ".8%", label: "RSVP me sukses", icon: TrendingUp },
  { value: 4, suffix: ".9 ★", label: "Vlerësim mesatar", icon: Star },
];

const steps = [
  { n: "01", title: "Krijoni Eventin", desc: "Plotësoni emrin e çiftit, datën dhe vendin. Sistemi gjeneron automatikisht faqen tuaj të eventit.", color: G },
  { n: "02", title: "Shtoni Mysafirët", desc: "Importoni nga Excel/CSV ose shtoni manualisht. Organizoni sipas VIP, familje dhe miq.", color: "#8FA88A" },
  { n: "03", title: "Dërgoni Ftesat", desc: "Çdo mysafir merr link personal me QR kod, countdown dhe opsion RSVP me një klik.", color: "#8B9DC3" },
  { n: "04", title: "Dizajnoni Sallën", desc: "Drag & drop hall planner. Caktoni mysafirët automatikisht sipas preferencave.", color: "#C4856A" },
  { n: "05", title: "Check-in Live", desc: "Ditën e madhe — skanoni QR dhe shikoni statistikat live në dashboard.", color: "#7C9E87" },
];

const plans = [
  { name: "Starter", price: "€10", period: "/muaj", tag: null, events: "1 event aktiv", perks: ["Deri 100 mysafirë", "Ftesa digjitale", "QR Check-in", "Support me email"] },
  { name: "Pro", price: "€50", period: "/muaj", tag: "Më i popullarizuar", events: "11 evente", perks: ["Mysafirë të pakufizuar", "Hall Designer", "RSVP automatik", "Priority support", "Eksport CSV/Excel"] },
  { name: "Enterprise", price: "—", period: "Marrëveshje", tag: null, events: "Pa limit", perks: ["Gjithçka nga Pro", "Branding personal", "API access", "Trajnim ekipi", "SLA i garantuar"] },
];

// ─── Floating orb ─────────────────────────────────────────────────────────────
function Orb({ cx, cy, r, color, dur }: { cx: string; cy: string; r: number; color: string; dur: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: cx, top: cy, width: r * 2, height: r * 2, background: color, filter: "blur(80px)", transform: "translate(-50%,-50%)" }}
      animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.55, 0.35] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Photo Carousel ───────────────────────────────────────────────────────────
function PhotoCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const prev = useCallback(() => setActive((a) => (a - 1 + photos.length) % photos.length), []);
  const next = useCallback(() => setActive((a) => (a + 1) % photos.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "72vh", minHeight: 500 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={photos[active].url} alt={photos[active].caption} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`cap-${active}`}
          className="absolute bottom-16 left-0 right-0 text-center px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="font-serif text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{photos[active].caption}</p>
          <p className="text-white/65 text-lg">{photos[active].sub}</p>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      {[{ fn: prev, Icon: ChevronLeft, side: "left-5" }, { fn: next, Icon: ChevronRight, side: "right-5" }].map(({ fn, Icon, side }) => (
        <button key={side} onClick={fn} className={`absolute ${side} top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/55 transition-all`}>
          <Icon className="h-5 w-5" />
        </button>
      ))}

      {/* Dots */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
        {photos.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} className="rounded-full bg-white transition-all duration-500" style={{ width: i === active ? 28 : 8, height: 8, opacity: i === active ? 1 : 0.4 }} />
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % testimonials.length), 5500);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[active];

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: C }}>
      <div className="absolute inset-0 pointer-events-none">
        <Orb cx="10%" cy="30%" r={200} color={`${G}22`} dur={7} />
        <Orb cx="90%" cy="70%" r={180} color={`${R}33`} dur={9} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-5 border" style={{ background: `${G}12`, borderColor: `${G}30`, color: G }}>
            <Heart className="h-3.5 w-3.5" /> Çfarë thonë klientët
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold" style={{ color: D }}>Histori të vërteta</h2>
        </Reveal>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl p-10 md:p-14 border shadow-xl relative overflow-hidden"
              style={{ background: "white", borderColor: "#e8e0d5" }}
            >
              {/* Large decorative quote */}
              <div className="absolute -top-3 left-8 font-serif text-[130px] leading-none select-none" style={{ color: `${G}15` }}>"</div>

              <div className="flex gap-1 mb-7">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-[#C9A96E] text-[#C9A96E]" />)}
              </div>

              <p className="font-serif text-2xl md:text-3xl leading-relaxed italic mb-10" style={{ color: D }}>
                "{t.quote}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`, width: 52, height: 52 }}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-base" style={{ color: D }}>{t.name}</p>
                  <p className="text-sm" style={{ color: "#8a7f74" }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} className="rounded-full transition-all duration-400" style={{ width: i === active ? 28 : 8, height: 8, background: G, opacity: i === active ? 1 : 0.28 }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Landing ─────────────────────────────────────────────────────────────
export function Landing() {
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: C, color: D, fontFamily: "var(--app-font-sans)" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ background: `${C}ee`, borderColor: "#e4d9cc" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={`${BASE}/NoaEvent_transparent.png`} alt="NoaEvent" className="h-9 w-auto" />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#7a6f64" }}>
            {[["#features","Funksionet"],["#how","Si funksionon"],["#pricing","Çmimet"]].map(([href,label]) => (
              <a key={href} href={href} className="hover:text-[#C9A96E] transition-colors duration-200">{label}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-sm font-medium" style={{ color: "#7a6f64" }}>
              <Link href="/sign-in">Hyr</Link>
            </Button>
            <Button size="sm" asChild className="rounded-full px-5 text-sm font-semibold shadow-md text-white" style={{ background: D }}>
              <Link href="/sign-up">Fillo Falas <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Ambient orbs */}
        <Orb cx="15%" cy="25%" r={280} color={`${G}18`} dur={8} />
        <Orb cx="80%" cy="60%" r={240} color={`${R}25`} dur={10} />
        <Orb cx="50%" cy="90%" r={200} color={`${"#8FA88A"}20`} dur={12} />

        {/* Decorative rings */}
        <svg className="absolute right-0 top-0 w-72 h-72 opacity-[0.06] pointer-events-none" viewBox="0 0 300 300">
          <circle cx="300" cy="0" r="200" fill="none" stroke={G} strokeWidth="1.5" />
          <circle cx="300" cy="0" r="130" fill="none" stroke={G} strokeWidth="1" />
        </svg>

        <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border" style={{ background: `${G}12`, borderColor: `${G}30`, color: G }}>
                <Sparkles className="h-3.5 w-3.5" /> Platforma №1 për Ftesa Digjitale
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-serif font-bold leading-[1.08]" style={{ fontSize: "clamp(2.8rem,5vw,4rem)", color: D }}>
              Dasma e ëndrrave<br />
              <span style={{ color: G }}>fillon këtu.</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg leading-relaxed" style={{ color: "#7a6f64", maxWidth: 420 }}>
              Ftesa digjitale, menaxhim mysafirësh, hall designer dhe QR check-in — gjithçka në një platformë të vetme, moderne dhe elegante.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="rounded-full px-9 text-base font-semibold shadow-xl text-white transition-transform hover:scale-[1.03]" style={{ background: `linear-gradient(135deg, ${G}, #b8934d)`, boxShadow: `0 8px 32px ${G}40` }}>
                <Link href="/sign-up">Fillo Falas Sot <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-9 text-base font-semibold transition-all hover:scale-[1.02]" style={{ borderColor: "#d4c5a9", color: D }}>
                <Link href="/sign-in">Hyr në llogari</Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-5 pt-1">
              {[
                { icon: Shield, text: "E sigurt & e kriptuar" },
                { icon: Zap, text: "Setup në 5 minuta" },
                { icon: Check, text: "Pa kreditim fillestar" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm" style={{ color: "#a09589" }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: G }} /> {text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: invitation card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center"
          >
            {/* Glow behind card */}
            <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${G}, transparent 70%)` }} />

            {/* Card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-72 rounded-3xl shadow-2xl overflow-hidden border"
              style={{ background: "white", borderColor: "#e8dfcf" }}
            >
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${G}, #e8c98a, ${G})` }} />
              <div className="p-7 space-y-5">
                <div className="text-center space-y-1">
                  <p className="text-[10px] tracking-[4px] uppercase font-semibold" style={{ color: G }}>Ftesë Zyrtare</p>
                  <p className="font-serif text-2xl font-bold" style={{ color: D }}>Artion & Mirela</p>
                  <p className="text-xs" style={{ color: "#a09589" }}>14 Shtator 2025 · Prishtinë</p>
                </div>

                <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, #d4c5a9, transparent)` }} />

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[["28","Ditë"],["14","Orë"],["32","Min"]].map(([n,l]) => (
                    <div key={l} className="rounded-xl py-3" style={{ background: D }}>
                      <p className="text-xl font-bold font-mono" style={{ color: G }}>{n}</p>
                      <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-xl p-2 border-2" style={{ borderColor: `${G}40` }}>
                    <div className="w-full h-full grid grid-cols-5 gap-0.5">
                      {Array.from({length:25}).map((_,i)=>(
                        <div key={i} className="rounded-[1px]" style={{ background: [0,1,2,5,7,10,12,14,17,22,23,24,6,18].includes(i) ? D : "transparent" }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button className="h-10 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: `linear-gradient(135deg,${G},#b8934d)` }}>✓ Po vij</button>
                  <button className="h-10 rounded-full text-xs font-semibold border transition-colors hover:border-[#C9A96E]" style={{ borderColor: "#d4c5a9", color: "#7a6f64" }}>✗ Nuk vij</button>
                </div>

                <p className="text-center text-[9px]" style={{ color: "#c0b5a8" }}>
                  Powered by <span style={{ color: G }} className="font-medium">NoaEvent</span>
                </p>
              </div>
            </motion.div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -top-4 -right-2 rounded-2xl px-4 py-3 shadow-xl border"
              style={{ background: "white", borderColor: "#e8dfcf" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#4ade80" }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: D }}>248 RSVP</p>
                  <p className="text-[10px]" style={{ color: "#a09589" }}>Konfirmuar sot</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-2 rounded-2xl px-4 py-3 shadow-xl border"
              style={{ background: "white", borderColor: "#e8dfcf" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${G}18` }}>
                  <Users className="h-4 w-4" style={{ color: G }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: D }}>12,000+</p>
                  <p className="text-[10px]" style={{ color: "#a09589" }}>Mysafirë</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Marquee strip ────────────────────────────────────────────────────── */}
      <div className="border-y py-4 overflow-hidden" style={{ background: D, borderColor: "#2e2926" }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...Array(2)].map((_, rep) => (
            <div key={rep} className="flex gap-12">
              {["Ftesa Digjitale", "QR Check-in", "Hall Designer", "RSVP Automatik", "Seat Planner", "Menaxhim Mysafirësh", "Countdown Live", "Import Excel"].map((item) => (
                <span key={item} className="text-sm font-medium flex items-center gap-3" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <span style={{ color: G }}>✦</span> {item}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b" style={{ background: `linear-gradient(135deg, ${D} 0%, #2a2320 100%)`, borderColor: "#2e2926" }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label, icon: Icon }, i) => (
            <Reveal key={label} delay={i} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 mx-auto" style={{ background: `${G}18` }}>
                <Icon className="h-5 w-5" style={{ color: G }} />
              </div>
              <p className="font-serif text-4xl font-bold mb-1" style={{ color: G }}>
                <Counter to={value} suffix={suffix} />
              </p>
              <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Photo Carousel ───────────────────────────────────────────────────── */}
      <PhotoCarousel />

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-5 border" style={{ background: `${G}12`, borderColor: `${G}30`, color: G }}>
              ✦ Funksionet
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" style={{ color: D }}>Çfarë ofron NoaEvent?</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#8a7f74" }}>Çdo mjet që ju nevojitet për të organizuar eventin e ëndrrave tuaja.</p>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: `0 20px 48px ${color}22` }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group rounded-3xl border p-8 cursor-default"
                style={{ background: C, borderColor: "#e4d9cc" }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ background: `${color}18` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3" style={{ color: D }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8a7f74" }}>{desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold transition-opacity opacity-0 group-hover:opacity-100" style={{ color }}>
                  Mëso më shumë <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section id="how" className="py-28 relative overflow-hidden" style={{ background: D }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(${G} 1px, transparent 1px), linear-gradient(90deg, ${G} 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
        <Orb cx="85%" cy="20%" r={250} color={`${G}15`} dur={9} />

        <div className="relative max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-5 border" style={{ background: `${G}15`, borderColor: `${G}30`, color: G }}>
              <Sparkles className="h-3.5 w-3.5" /> Si funksionon
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Nga ideja te<br /><span style={{ color: G }}>dita e madhe</span></h2>
          </Reveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${G}40, ${G}40, transparent)` }} />

            <div className="space-y-16">
              {steps.map(({ n, title, desc, color }, i) => (
                <Reveal key={n} delay={i} className={`relative flex gap-8 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center`}>
                  {/* Number bubble */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm z-10 shadow-lg border-2" style={{ background: D, borderColor: color, color }}>
                    {n}
                  </div>

                  {/* Content */}
                  <div className={`md:w-1/2 pl-16 md:pl-0 ${i % 2 === 0 ? "md:pr-20" : "md:pl-20 md:text-right"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="rounded-2xl p-7 border"
                      style={{ background: `${color}10`, borderColor: `${color}25` }}
                    >
                      <h3 className="font-serif text-2xl font-bold text-white mb-3">{title}</h3>
                      <p className="leading-relaxed text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{desc}</p>
                    </motion.div>
                  </div>

                  <div className="hidden md:block md:w-1/2" />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <Testimonials />

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 relative overflow-hidden" style={{ background: "white" }}>
        <div className="absolute inset-0 pointer-events-none">
          <Orb cx="50%" cy="0%" r={300} color={`${G}10`} dur={11} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-5 border" style={{ background: `${G}12`, borderColor: `${G}30`, color: G }}>
              ✦ Çmimet
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4" style={{ color: D }}>Planet e Abonimit</h2>
            <p className="text-lg" style={{ color: "#8a7f74" }}>Çmime të qarta, pa surpriza.</p>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-6 md:grid-cols-3"
          >
            {plans.map(({ name, price, period, tag, events, perks }, i) => {
              const highlighted = !!tag;
              return (
                <motion.div
                  key={name}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: highlighted ? -4 : -8 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="rounded-3xl p-8 flex flex-col border relative overflow-hidden"
                  style={highlighted
                    ? { background: D, borderColor: `${G}50`, boxShadow: `0 24px 60px ${G}30` }
                    : { background: C, borderColor: "#e4d9cc" }
                  }
                >
                  {highlighted && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${G}, #e8c98a, ${G})` }} />
                      <span className="inline-block text-xs font-bold rounded-full px-3 py-1 mb-5 w-fit" style={{ background: `${G}25`, color: G }}>★ {tag}</span>
                    </>
                  )}

                  <h3 className="font-serif text-2xl font-bold mb-2" style={{ color: highlighted ? "white" : D }}>{name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-serif text-4xl font-bold" style={{ color: highlighted ? G : D }}>{price}</span>
                    <span className="text-sm" style={{ color: highlighted ? "rgba(255,255,255,0.5)" : "#a09589" }}>{period}</span>
                  </div>
                  <p className="text-sm mb-7" style={{ color: highlighted ? "rgba(255,255,255,0.45)" : "#a09589" }}>{events}</p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {perks.map((p) => (
                      <li key={p} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: highlighted ? `${G}25` : `${G}18` }}>
                          <Check className="h-3 w-3" style={{ color: G }} />
                        </div>
                        <span className="text-sm" style={{ color: highlighted ? "rgba(255,255,255,0.8)" : "#5a5048" }}>{p}</span>
                      </li>
                    ))}
                  </ul>

                  <Button asChild className="w-full rounded-full font-semibold h-11 transition-transform hover:scale-[1.02]"
                    style={highlighted
                      ? { background: `linear-gradient(135deg,${G},#b8934d)`, color: "white", boxShadow: `0 6px 24px ${G}50` }
                      : { background: D, color: "white" }
                    }
                  >
                    <Link href="/sign-up">Fillo tani</Link>
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${D} 0%, #2a2320 100%)` }}>
        <Orb cx="20%" cy="50%" r={280} color={`${G}18`} dur={8} />
        <Orb cx="80%" cy="50%" r={250} color={`${R}20`} dur={11} />

        <svg className="absolute left-0 bottom-0 w-64 h-64 opacity-[0.06] pointer-events-none" viewBox="0 0 300 300">
          <circle cx="0" cy="300" r="220" fill="none" stroke={G} strokeWidth="1.5" />
          <circle cx="0" cy="300" r="140" fill="none" stroke={G} strokeWidth="1" />
        </svg>

        <Reveal className="relative text-center max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-8 border" style={{ background: `${G}15`, borderColor: `${G}30`, color: G }}>
            <Heart className="h-3.5 w-3.5" /> Gati për aventurën tuaj?
          </div>
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6 leading-[1.1]">
            Gati për ditën<br /><span style={{ color: G }}>tuaj të veçantë?</span>
          </h2>
          <p className="text-xl mb-12 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Bashkohuni me qindra organizatorë që i besojnë NoaEvent për momentet e tyre më të çmuara.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button size="lg" asChild className="rounded-full px-12 py-6 text-lg font-bold shadow-2xl text-white" style={{ background: `linear-gradient(135deg,${G},#b8934d)`, boxShadow: `0 16px 48px ${G}50` }}>
              <Link href="/sign-up">Fillo Falas — Pa Kreditim <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="py-14 border-t" style={{ background: D, borderColor: "#2e2926" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-10 border-b" style={{ borderColor: "#2e2926" }}>
            <img src={`${BASE}/NoaEvent_transparent.png`} alt="NoaEvent" className="h-10 w-auto" />
            <div className="flex flex-wrap gap-8 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              {[["#features","Funksionet"],["#how","Si funksionon"],["#pricing","Çmimet"]].map(([href,label]) => (
                <a key={href} href={href} className="hover:text-[#C9A96E] transition-colors">{label}</a>
              ))}
              <Link href="/sign-in" className="hover:text-[#C9A96E] transition-colors">Hyrja</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
            <p>© {new Date().getFullYear()} NoaEvent — Të gjitha të drejtat e rezervuara.</p>
            <p className="mt-2 md:mt-0 flex items-center gap-1.5">Bërë me <Heart className="h-3.5 w-3.5" style={{ color: G }} fill={G} /> për çiftet shqipfolëse</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
