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
  useSpring,
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
  Instagram,
  Facebook,
  Twitter
} from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────────────────
const ACCENT = "#C94B6E"; // rose/magenta
const BG = "#171215";     // dark plum/charcoal
const TEXT = "#e9e4e1";   // soft cream
const MUTED = "#998b92";  // muted mauve
const CARD = "#1e171b";   // slightly lighter dark
const BORDER = "#33262e"; // subtle border

// ─── Framer variants ──────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] } }),
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

// ─── Data ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: Users, title: "Menaxhim Mysafirësh", color: "#C94B6E", desc: "Shtoni, importoni dhe organizoni mysafirët sipas familjes, kategorisë dhe statusit RSVP — gjithçka në një vend." },
  { icon: LayoutDashboard, title: "Hall Designer", color: "#b65675", desc: "Krijoni planin vizual të sallës me drag & drop — tavolina, karriger, skenë dhe çdo detaj tjetër." },
  { icon: Mail, title: "Ftesa Digjitale", color: "#d16886", desc: "Dërgoni ftesa elegante me link unik dhe QR code. Çdo mysafir merr një faqe personale me countdown live." },
  { icon: QrCode, title: "QR Check-in", color: "#8a5868", desc: "Stafi skanon QR-in me telefon dhe sistemi tregon menjëherë emrin, tavolinën dhe vendin e mysafirit." },
  { icon: CalendarDays, title: "RSVP Automatik", color: "#9a4a62", desc: "Mysafirët konfirmojnë ose refuzojnë me një klik. Dashboardi përditësohet në kohë reale automatikisht." },
  { icon: Map, title: "Seat Planner", color: "#a86377", desc: "Pamje e plotë me tavolina, karriger dhe emrat e mysafirëve. Gjithçka vizuale dhe intuitive." },
];

const testimonials = [
  { name: "Arta & Besniku", role: "Prishtinë, 2024", initials: "A&B", color: ACCENT, quote: "NoaEvent e bëri organizimin e dasmës tonë gjë kënaqësi. QR check-in funksionoi pa asnjë problem dhe mysafirët ishin të mahnitur me ftesën digjitale!" },
  { name: "Blerim Osmani", role: "Wedding Planner", initials: "BO", color: "#9a4a62", quote: "Kam organizuar mbi 40 dasma dhe NoaEvent është mjeti më i mirë që kam përdorur. Hall designer-i kursen orë pune dhe ndihmon të gjithë ekipin." },
  { name: "Drita Hoxha", role: "Menaxhere Sale", initials: "DH", color: "#b65675", quote: "Klientët tanë janë jashtëzakonisht të kënaqur me ftesat digjitale. Platforma është intuitive dhe mbështetja teknike është fantastike." },
];

const plans = [
  { name: "Starter", price: "€19", period: "/muaj", tag: null, events: "1 event aktiv", perks: ["Deri 150 mysafirë", "Ftesa digjitale", "QR Check-in bazik", "Support me email"] },
  { name: "Pro", price: "€49", period: "/muaj", tag: "Më i popullarizuar", events: "Evente të pakufizuara", perks: ["Mysafirë të pakufizuar", "Hall Designer Premium", "RSVP automatik", "Priority support 24/7", "Eksport CSV/Excel"] },
];

// ─── Hero Section ─────────────────────────────────────────────────────────────
const cyclingWords = ["Dasmës", "Eventit", "Festës", "Ditës suaj"];

function HeroSection({ BASE }: { BASE: string }) {
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setWordIdx((i) => (i + 1) % cyclingWords.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden pt-20" style={{ background: BG }}>
      {/* Background Image / Texture */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#171215]/80 via-[#171215]/90 to-[#171215] z-10" />
        <img 
          src="/attached_assets/generated_images/hero-wedding.jpg" 
          alt="Luxury Wedding" 
          className="w-full h-full object-cover opacity-60"
        />
        {/* Soft radial blur for mood */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(201,75,110,0.1)_0%,_transparent_60%)] z-10 pointer-events-none" />
      </div>

      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 text-center">
        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">
          <motion.div variants={fadeUp} custom={0} className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium border uppercase tracking-widest" style={{ background: `${ACCENT}10`, borderColor: `${ACCENT}30`, color: ACCENT }}>
              <Sparkles className="h-3 w-3" /> Platforma Ekskluzive e Eventeve
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="font-serif font-medium leading-[1.1]" style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", color: TEXT }}>
            Krijoni magjinë e<br />
            <span className="relative inline-flex items-center h-[1.15em] overflow-hidden align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block italic pr-2"
                  style={{ color: ACCENT }}
                >
                  {cyclingWords[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl leading-relaxed mx-auto" style={{ color: MUTED, maxWidth: 600 }}>
            Nga ftesat e para digjitale tek check-in dita e dasmës. Organizoni çdo detaj me elegancë dhe precizion të pashoq.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button size="lg" asChild className="rounded-none px-10 h-14 text-sm uppercase tracking-widest font-medium transition-all hover:bg-white hover:text-black" style={{ background: ACCENT, color: "white" }}>
              <Link href="/sign-up">Fillo Tani</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-none px-10 h-14 text-sm uppercase tracking-widest font-medium bg-transparent hover:bg-white/5 transition-all" style={{ borderColor: BORDER, color: TEXT }}>
              <Link href="/sign-in">Hyr në Llogari</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: MUTED }}>Zbuloni Më Shumë</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-[#C94B6E] to-transparent" />
      </motion.div>
    </section>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div ref={ref} variants={fadeUp} custom={delay} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Main Landing ─────────────────────────────────────────────────────────────
export function Landing() {
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-[#C94B6E] selection:text-white" style={{ background: BG, color: TEXT, fontFamily: "var(--app-font-sans)" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl bg-[#171215]/80"
        style={{ borderColor: BORDER }}
      >
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Sparkles className="h-5 w-5" style={{ color: ACCENT }} />
             <span className="font-serif font-medium text-xl tracking-wide">NoaEvent</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm uppercase tracking-widest font-medium" style={{ color: MUTED }}>
            {[["#features","Eksperienca"],["#hall","Salla"],["#pricing","Koleksioni"]].map(([href,label]) => (
              <a key={href} href={href} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-sm uppercase tracking-widest font-medium hover:bg-white/5 hover:text-white" style={{ color: TEXT }}>
              <Link href="/sign-in">Hyr</Link>
            </Button>
            <Button asChild className="rounded-none text-xs uppercase tracking-widest font-medium transition-all" style={{ background: ACCENT, color: "white" }}>
              <Link href="/sign-up">Rezervo</Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <HeroSection BASE={BASE} />

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-24 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Elegancë Digjitale</p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium" style={{ color: TEXT }}>Detajet Bëjnë Diferencën</h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <div className="group relative p-8 h-full border transition-all duration-500 hover:border-[#C94B6E]/50" style={{ background: CARD, borderColor: BORDER }}>
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C94B6E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6" style={{ background: `${f.color}15` }}>
                    <f.icon className="h-5 w-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-serif text-xl font-medium mb-3" style={{ color: TEXT }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Image Feature ───────────────────────────────────────────────────── */}
      <section id="hall" className="py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal className="relative aspect-[4/5] md:aspect-[3/4] w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-[#C94B6E]/10 translate-x-4 translate-y-4" />
              <img 
                src="/attached_assets/generated_images/feature-hall.jpg" 
                alt="Luxury Hall" 
                className="absolute inset-0 w-full h-full object-cover border"
                style={{ borderColor: BORDER }}
              />
            </Reveal>
            
            <div className="space-y-8">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Kontroll i Plotë</p>
                <h2 className="font-serif text-4xl md:text-5xl font-medium mt-4 leading-tight" style={{ color: TEXT }}>
                  Krijoni planin e sallës me një shikim.
                </h2>
              </Reveal>
              
              <Reveal delay={0.1}>
                <p className="text-lg" style={{ color: MUTED }}>
                  Salla e dasmës suaj është kanavaca juaj. Ndërtoni planimetrinë vizuale, vendosni tavolinat, dhe ulni mysafirët tuaj me një ndërfaqe elegante drag-and-drop. Çdo detaj është në duart tuaja.
                </p>
              </Reveal>
              
              <Reveal delay={0.2}>
                <ul className="space-y-4 pt-4">
                  {["Vizualizim 2D i sallës", "Menaxhim i kapacitetit live", "Kategorizim VIP & Familje"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center border" style={{ borderColor: ACCENT, color: ACCENT }}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span style={{ color: TEXT }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              
              <Reveal delay={0.3}>
                <Button size="lg" asChild className="rounded-none mt-4 text-sm uppercase tracking-widest font-medium" style={{ background: "white", color: "black" }}>
                  <Link href="/sign-up">Zbuloni Mundësitë <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────────────── */}
      <section className="py-32 relative border-t" style={{ borderColor: BORDER, background: CARD }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <Sparkles className="h-6 w-6 mx-auto mb-6" style={{ color: ACCENT }} />
            <h2 className="font-serif text-3xl md:text-4xl font-medium italic mb-16" style={{ color: TEXT }}>
              "E bëri ditën tonë më të rëndësishme absolutisht të përsosur dhe pa stres. Një eksperiencë premium nga ftesa e parë deri te check-in i fundit."
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#C94B6E]/20 flex items-center justify-center font-serif text-[#C94B6E]">
                A&B
              </div>
              <div className="text-left">
                <p className="font-medium text-sm tracking-wide uppercase" style={{ color: TEXT }}>Arta & Besniku</p>
                <p className="text-xs" style={{ color: MUTED }}>Prishtinë, Shtator 2024</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-20 space-y-4">
            <h2 className="font-serif text-4xl md:text-5xl font-medium" style={{ color: TEXT }}>Koleksioni i Çmimeve</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: MUTED }}>
              Një investim i vogël për qetësi mendore në ditën tuaj më të madhe.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.1}>
                <div className="relative p-10 border transition-all hover:-translate-y-1" style={{ background: CARD, borderColor: p.tag ? ACCENT : BORDER }}>
                  {p.tag && (
                    <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: ACCENT }}>
                      {p.tag}
                    </div>
                  )}
                  <h3 className="font-serif text-2xl font-medium mb-2" style={{ color: TEXT }}>{p.name}</h3>
                  <p className="text-sm mb-6" style={{ color: MUTED }}>{p.events}</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-4xl font-serif font-medium" style={{ color: TEXT }}>{p.price}</span>
                    {p.price !== "—" && <span className="text-sm" style={{ color: MUTED }}>{p.period}</span>}
                  </div>
                  <ul className="space-y-4 mb-10">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-3 text-sm" style={{ color: TEXT }}>
                        <Check className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full rounded-none h-12 text-xs uppercase tracking-widest font-medium" style={{ background: p.tag ? ACCENT : "transparent", color: p.tag ? "white" : TEXT, border: p.tag ? "none" : `1px solid ${BORDER}` }}>
                    <Link href="/sign-up">{p.tag ? "Fillo Me Pro" : "Zgjidh Starter"}</Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="pt-20 pb-10 border-t" style={{ background: BG, borderColor: BORDER }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: ACCENT }} />
              <span className="font-serif text-2xl font-medium tracking-wide" style={{ color: TEXT }}>NoaEvent</span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: MUTED }}>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Pinterest</a>
              <a href="#" className="hover:text-white transition-colors">Email</a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs" style={{ color: MUTED }}>
            <p>© {new Date().getFullYear()} NoaEvent. Të gjitha të drejtat e rezervuara.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Kushtet</a>
              <a href="#" className="hover:text-white transition-colors">Privatësia</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
