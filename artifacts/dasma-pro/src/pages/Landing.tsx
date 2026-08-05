import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Users className="h-5 w-5" />,
    title: "Menaxhim Mysafirësh",
    desc: "Shtoni, importoni dhe organizoni mysafirët sipas familjes, kategorisë dhe statusit RSVP.",
  },
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Hall Designer",
    desc: "Krijoni planin vizual të sallës me drag & drop — tavolina, karriger, skenë dhe çdo detaj.",
  },
  {
    icon: <Mail className="h-5 w-5" />,
    title: "Ftesa Digjitale",
    desc: "Dërgoni ftesa elegante me link unik, QR code dhe countdown live drejt ditës speciale.",
  },
  {
    icon: <QrCode className="h-5 w-5" />,
    title: "QR Check-in",
    desc: "Stafi skanon QR-in dhe sistemi tregon menjëherë tavolinën dhe vendin e mysafirit.",
  },
  {
    icon: <CalendarDays className="h-5 w-5" />,
    title: "RSVP Automatik",
    desc: "Mysafirët konfirmojnë ose refuzojnë me një klik — dashboardi përditësohet në kohë reale.",
  },
  {
    icon: <Map className="h-5 w-5" />,
    title: "Seat Planner",
    desc: "Pamje e plotë me tavolina, karriger dhe emrat e mysafirëve — gjithçka vizuale dhe intuitive.",
  },
];

const weddingPhotos = [
  {
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85",
    caption: "Momente të paharrueshme",
    sub: "Çdo detaj i planifikuar me përsosmëri",
  },
  {
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600&q=85",
    caption: "Salla e ëndrrave tuaja",
    sub: "Dizajnoni çdo tavolinë, çdo vend",
  },
  {
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&q=85",
    caption: "Ftesa që lënë gjurmë",
    sub: "Elegancë digjitale për çdo mysafir",
  },
  {
    url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1600&q=85",
    caption: "Bukuria e momentit",
    sub: "Organizoni me dashuri, jetoni çdo sekondë",
  },
  {
    url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1600&q=85",
    caption: "Dasma e përsosur fillon këtu",
    sub: "NoaInvite — platforma juaj e besuar",
  },
];

const testimonials = [
  {
    name: "Arta Krasniqi",
    role: "Nuse, Prishtinë 2024",
    avatar: "AK",
    color: "#C9A96E",
    quote:
      "NoaInvite e bëri organizimin e dasmës tonë gjë kënaqësi. QR check-in funksionoi pa asnjë problem dhe mysafirët ishin të mahnitur me ftesën digjitale!",
    stars: 5,
  },
  {
    name: "Blerim Osmani",
    role: "Wedding Planner, Tiranë",
    avatar: "BO",
    color: "#7C9E87",
    quote:
      "Kam organizuar mbi 40 dasma dhe NoaInvite është mjeti më i mirë që kam përdorur. Hall designer-i kursen orë pune dhe ndihmon të gjithë ekipin.",
    stars: 5,
  },
  {
    name: "Drita Hoxha",
    role: "Menaxhere Sale, Shkodër",
    avatar: "DH",
    color: "#8B9DC3",
    quote:
      "Klientët tanë janë jashtëzakonisht të kënaqur me ftesat digjitale. Platforma është intuiticë dhe mbështetja teknike është fantastike.",
    stars: 5,
  },
];

const plans = [
  {
    name: "Basic",
    price: "€10",
    period: "/muaj",
    events: "1 event aktiv",
    perks: ["Deri 100 mysafirë", "Ftesa digjitale", "QR Check-in", "Support me email"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "€50",
    period: "/muaj",
    events: "11 evente",
    perks: ["Mysafirë të pakufizuar", "Hall Designer", "RSVP automatik", "Priority support", "Eksport CSV/Excel"],
    highlight: true,
  },
  {
    name: "Custom",
    price: "—",
    period: "Marrëveshje",
    events: "Pa limit",
    perks: ["Gjithçka nga Pro", "Branding personal", "API access", "Trajnim ekipi", "SLA i garantuar"],
    highlight: false,
  },
];

const stats = [
  { value: "12,000+", label: "Mysafirë menaxhuar" },
  { value: "480+", label: "Dasma të organizuara" },
  { value: "99.8%", label: "RSVP me sukses" },
  { value: "4.9 ★", label: "Vlerësim mesatar" },
];

const steps = [
  {
    number: "01",
    title: "Krijoni Eventin",
    subtitle: "Gjithçka fillon me disa klikime",
    desc: "Plotësoni emrin e çiftit, datën, vendin dhe numrin e pritshëm të mysafirëve. Sistemi gjeneron automatikisht një faqe eventi me stilin tuaj.",
    color: "#C9A96E",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="w-72 bg-white rounded-2xl shadow-2xl border border-[#d4c5a9]/60 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#C9A96E] to-[#e8c98a]" />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="h-2.5 w-28 bg-[#1a1a1a] rounded-full" />
                <div className="h-2 w-16 bg-muted rounded-full mt-1" />
              </div>
            </div>
            <div className="border border-dashed border-[#d4c5a9] rounded-xl p-3 space-y-2">
              <div className="h-2 w-full bg-[#f0e8d8] rounded" />
              <div className="h-2 w-3/4 bg-[#f0e8d8] rounded" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["Data", "Salla", "Mysafirë"].map((l) => (
                <div key={l} className="rounded-lg bg-[#FEFAF5] border border-[#d4c5a9]/50 p-2 text-center">
                  <div className="h-2 w-8 bg-[#C9A96E]/40 rounded mx-auto mb-1" />
                  <p className="text-[9px] text-muted-foreground font-medium">{l}</p>
                </div>
              ))}
            </div>
            <div className="h-8 bg-gradient-to-r from-[#C9A96E] to-[#e8c98a] rounded-lg flex items-center justify-center">
              <div className="h-2 w-24 bg-white/60 rounded" />
            </div>
          </div>
        </div>
        <div className="absolute top-8 right-8 bg-white rounded-xl shadow-lg border border-[#d4c5a9]/60 px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-medium text-muted-foreground">I publikuar</span>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    title: "Shtoni Mysafirët",
    subtitle: "Import me Excel ose manualisht",
    desc: "Ngarkoni listën nga Excel/CSV ose shtoni mysafirët një nga një. Organizojini sipas familjes, tryezës ose kategorisë — VIP, familje, miq.",
    color: "#7C9E87",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="w-72 bg-white rounded-2xl shadow-2xl border border-[#d4c5a9]/60 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#7C9E87] to-[#a3c2af]" />
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <div className="h-2.5 w-24 bg-[#1a1a1a] rounded" />
              <div className="px-2 py-0.5 rounded-full bg-[#7C9E87]/10 border border-[#7C9E87]/30">
                <span className="text-[9px] font-semibold text-[#7C9E87]">248 mysafirë</span>
              </div>
            </div>
            {[
              { name: "Agim Berisha", table: "T-01", badge: "VIP", color: "#C9A96E" },
              { name: "Mirela Krasniqi", table: "T-02", badge: "Familje", color: "#7C9E87" },
              { name: "Drita Hoxha", table: "T-03", badge: "Miq", color: "#8B9DC3" },
              { name: "Burim Osmani", table: "T-01", badge: "VIP", color: "#C9A96E" },
            ].map((g) => (
              <div key={g.name} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-[#FEFAF5] transition-colors">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: g.color }}>
                  {g.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-[#1a1a1a] truncate">{g.name}</p>
                  <p className="text-[9px] text-muted-foreground">{g.table}</p>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: g.color + "20", color: g.color }}>{g.badge}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-[#d4c5a9]/60 pt-2 flex gap-1.5">
              <div className="flex-1 h-6 rounded-lg bg-[#7C9E87]/10 border border-[#7C9E87]/30 flex items-center justify-center">
                <span className="text-[9px] text-[#7C9E87] font-medium">+ Shto</span>
              </div>
              <div className="flex-1 h-6 rounded-lg bg-[#f0e8d8] border border-[#d4c5a9]/40 flex items-center justify-center">
                <span className="text-[9px] text-muted-foreground font-medium">↑ Import</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-8 bg-white rounded-xl shadow-lg border border-[#d4c5a9]/60 px-3 py-1.5 flex items-center gap-1.5">
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-[10px] font-medium text-muted-foreground">48 RSVP sot</span>
        </div>
      </div>
    ),
  },
  {
    number: "03",
    title: "Dërgoni Ftesa Digjitale",
    subtitle: "Ftesa elegante me QR dhe countdown",
    desc: "Çdo mysafir merr një link personal me QR kod. Ftesa shfaq detajet e eventit, countdown-in dhe opsionin për të konfirmuar praninë me një klik.",
    color: "#8B9DC3",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="w-48 bg-[#1a1a1a] rounded-[2rem] shadow-2xl p-1.5">
          <div className="bg-white rounded-[1.6rem] overflow-hidden">
            <div className="h-5 bg-[#FEFAF5] flex items-center justify-center">
              <div className="w-12 h-1.5 bg-[#1a1a1a]/20 rounded-full" />
            </div>
            <div className="bg-gradient-to-b from-[#FEFAF5] to-white px-3 pb-4 space-y-2">
              <div className="text-center py-2">
                <p className="text-[7px] text-[#C9A96E] font-semibold tracking-widest uppercase">Dasma</p>
                <p className="text-[12px] font-serif font-bold text-[#1a1a1a] leading-tight">Artion & Mirela</p>
                <p className="text-[7px] text-muted-foreground">14 Shtator 2025 • Prishtinë</p>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[["28", "Ditë"], ["14", "Orë"], ["32", "Min"]].map(([n, l]) => (
                  <div key={l} className="bg-[#1a1a1a] rounded-lg py-1.5 text-center">
                    <p className="text-[12px] font-bold text-[#C9A96E]">{n}</p>
                    <p className="text-[6px] text-white/60">{l}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <div className="w-14 h-14 border-2 border-[#C9A96E]/30 rounded-lg p-1">
                  <div className="w-full h-full grid grid-cols-4 gap-0.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`rounded-[1px] ${[0,1,4,6,9,11,14,15,3,12].includes(i) ? "bg-[#1a1a1a]" : "bg-transparent"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-5 bg-[#C9A96E] rounded-full flex items-center justify-center">
                  <span className="text-[7px] text-white font-semibold">✓ Po vij</span>
                </div>
                <div className="h-5 border border-[#d4c5a9] rounded-full flex items-center justify-center">
                  <span className="text-[7px] text-muted-foreground font-semibold">✗ Nuk vij</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-10 left-6 bg-white rounded-xl shadow-lg border border-[#d4c5a9]/60 p-2.5 flex items-center gap-2">
          <div className="w-6 h-6 bg-[#8B9DC3]/10 rounded-full flex items-center justify-center">
            <Mail className="h-3 w-3 text-[#8B9DC3]" />
          </div>
          <div>
            <p className="text-[9px] font-semibold text-[#1a1a1a]">Ftesa dërguar</p>
            <p className="text-[8px] text-muted-foreground">248 mysafirë</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    title: "Dizajnoni Sallën",
    subtitle: "Drag & drop hall planner",
    desc: "Vizatoni planin e sallës me drag & drop. Shtoni tavolina, karriget, skenën dhe emërtoni çdo vend. Mysafirët caktohen automatikisht.",
    color: "#C4856A",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="w-72 bg-white rounded-2xl shadow-2xl border border-[#d4c5a9]/60 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#C4856A] to-[#e0a88e]" />
          <div className="p-3">
            <div className="flex gap-1.5 mb-2">
              {["Tryezë ⊙", "Karrige ■", "Skenë ▬", "Undo ↩"].map((t) => (
                <div key={t} className="text-[8px] px-2 py-1 rounded-md bg-[#FEFAF5] border border-[#d4c5a9]/50 text-muted-foreground cursor-default">
                  {t}
                </div>
              ))}
            </div>
            <div className="relative w-full h-40 bg-[#FEFAF5] rounded-xl border border-dashed border-[#d4c5a9] overflow-hidden">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1a1a1a]/10 rounded border border-[#1a1a1a]/20 flex items-center justify-center">
                <span className="text-[7px] text-[#1a1a1a]/50 font-medium">SKENË</span>
              </div>
              {[
                { x: 16, y: 30, label: "T1", color: "#C9A96E" },
                { x: 60, y: 30, label: "T2", color: "#7C9E87" },
                { x: 104, y: 30, label: "T3", color: "#8B9DC3" },
                { x: 148, y: 30, label: "T4", color: "#C4856A" },
                { x: 38, y: 80, label: "T5", color: "#C9A96E" },
                { x: 82, y: 80, label: "T6", color: "#7C9E87" },
                { x: 126, y: 80, label: "T7", color: "#8B9DC3" },
              ].map((t) => (
                <div
                  key={t.label}
                  className="absolute flex items-center justify-center rounded-full border-2 text-[7px] font-bold text-white shadow-md"
                  style={{ left: t.x, top: t.y, width: 30, height: 30, background: t.color, borderColor: t.color + "80" }}
                >
                  {t.label}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[8px] text-muted-foreground">
              <span>7 tryeza • 50 karriget</span>
              <span className="text-[#C9A96E] font-medium">48/50 plotësuar</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: "05",
    title: "Check-in me QR",
    subtitle: "Ditën e madhe, pa kaos",
    desc: "Stafi skanon QR kodin e mysafirit me telefon. Sistemi tregon menjëherë emrin, tavolinën dhe vendin. Dashboardi shfaq numrin e të ardhurve në kohë reale.",
    color: "#6B7FA3",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="w-48 bg-[#1a1a1a] rounded-[2rem] shadow-2xl p-1.5">
          <div className="bg-[#0a0a0a] rounded-[1.6rem] overflow-hidden">
            <div className="h-5 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>
            <div className="px-3 pb-4 space-y-2">
              <div className="relative h-28 bg-[#111] rounded-xl overflow-hidden flex items-center justify-center">
                {[["top-1 left-1", "border-t-2 border-l-2"],
                  ["top-1 right-1", "border-t-2 border-r-2"],
                  ["bottom-1 left-1", "border-b-2 border-l-2"],
                  ["bottom-1 right-1", "border-b-2 border-r-2"]].map(([pos, cls], i) => (
                  <div key={i} className={`absolute ${pos} w-4 h-4 border-[#C9A96E] ${cls} rounded-sm`} />
                ))}
                <div className="w-14 h-14 border border-[#C9A96E]/40 rounded-md grid grid-cols-4 gap-0.5 p-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`rounded-[1px] ${[0,1,4,6,9,11,14,15,3,12].includes(i) ? "bg-[#C9A96E]/80" : "bg-transparent"}`} />
                  ))}
                </div>
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent animate-pulse" />
              </div>
              <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <p className="text-[10px] font-bold text-green-400">Konfirmuar!</p>
                </div>
                <p className="text-[11px] font-semibold text-white">Agim Berisha</p>
                <div className="flex gap-2">
                  <span className="text-[8px] text-white/60">📍 Tryeza 1</span>
                  <span className="text-[8px] text-white/60">💺 Vendi 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-8 right-6 bg-white rounded-xl shadow-lg border border-[#d4c5a9]/60 p-2.5 space-y-1.5 w-28">
          <p className="text-[8px] font-semibold text-[#1a1a1a] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            Live
          </p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-muted-foreground">Arritën</span>
              <span className="text-[9px] font-bold text-[#1a1a1a]">186</span>
            </div>
            <div className="w-full h-1 bg-[#f0e8d8] rounded-full">
              <div className="h-1 bg-[#C9A96E] rounded-full" style={{ width: "75%" }} />
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

// ─── Photo Carousel ────────────────────────────────────────────────────────────

function PhotoCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => setActive((a) => (a - 1 + weddingPhotos.length) % weddingPhotos.length), []);
  const next = useCallback(() => setActive((a) => (a + 1) % weddingPhotos.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "70vh", minHeight: 480 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Images */}
      {weddingPhotos.map((photo, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ))}

      {/* Caption */}
      <div className="absolute bottom-12 left-0 right-0 text-center px-6">
        <p className="font-serif text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          {weddingPhotos[active].caption}
        </p>
        <p className="text-white/70 text-lg">{weddingPhotos[active].sub}</p>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {weddingPhotos.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="transition-all duration-300 rounded-full bg-white"
            style={{ width: i === active ? 28 : 8, height: 8, opacity: i === active ? 1 : 0.4 }}
            aria-label={`Foto ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── How It Works Carousel ─────────────────────────────────────────────────────

function HowItWorksCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => setActive((a) => (a - 1 + steps.length) % steps.length), []);
  const next = useCallback(() => setActive((a) => (a + 1) % steps.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [paused, next]);

  const step = steps[active];

  return (
    <section
      className="py-24 bg-[#111] relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(#C9A96E 1px, transparent 1px), linear-gradient(90deg, #C9A96E 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 px-4 py-1.5 text-sm text-[#C9A96E] font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Si funksionon
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Nga ideja te<br />
            <span className="text-[#C9A96E]">dita e madhe</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Pesë hapa të thjeshtë — gjithçka tjetër e bën NoaInvite.
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[460px]">
            <div className="space-y-6">
              <div
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full border"
                style={{ borderColor: step.color + "40", background: step.color + "15" }}
              >
                <span className="font-mono text-sm font-bold" style={{ color: step.color }}>{step.number}</span>
                <span className="text-sm text-white/60">{step.subtitle}</span>
              </div>
              <h3 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight">{step.title}</h3>
              <p className="text-white/60 text-lg leading-relaxed">{step.desc}</p>
              <div className="flex items-center gap-3 pt-4">
                {steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{ width: i === active ? 28 : 8, height: 8, background: i === active ? s.color : "rgba(255,255,255,0.2)" }}
                    aria-label={`Hapi ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={prev} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white transition-all">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={next} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white transition-all">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${step.color}18, ${step.color}08)`, border: `1px solid ${step.color}30`, height: 380 }}
            >
              <div className="absolute inset-x-0 top-0 h-32 opacity-30" style={{ background: `radial-gradient(ellipse at 50% 0%, ${step.color}, transparent 70%)` }} />
              {step.visual}
            </div>
          </div>
          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-300"
                style={
                  i === active
                    ? { background: s.color, color: "#fff", fontWeight: 600 }
                    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                <span className="font-mono text-xs opacity-70">{s.number}</span>
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Carousel ─────────────────────────────────────────────────────

function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => setActive(i), []);

  useEffect(() => {
    intervalRef.current = setInterval(() => setActive((a) => (a + 1) % testimonials.length), 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <section className="py-24 bg-[#FEFAF5]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary font-medium mb-4">
            ✦ Çfarë thonë klientët
          </div>
          <h2 className="font-serif text-4xl font-bold text-foreground">Histori të vërteta</h2>
        </div>

        {/* Big quote */}
        <div className="relative bg-white rounded-3xl border border-[#d4c5a9]/50 shadow-xl p-10 md:p-14 mb-8 overflow-hidden">
          <div className="absolute top-6 left-8 text-[120px] leading-none text-[#C9A96E]/10 font-serif select-none">"</div>
          <div className="relative">
            <div className="flex gap-1 mb-6">
              {Array.from({ length: testimonials[active].stars }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-[#C9A96E] text-[#C9A96E]" />
              ))}
            </div>
            <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed mb-8 italic">
              "{testimonials[active].quote}"
            </p>
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ background: testimonials[active].color }}
              >
                {testimonials[active].avatar}
              </div>
              <div>
                <p className="font-semibold text-foreground">{testimonials[active].name}</p>
                <p className="text-sm text-muted-foreground">{testimonials[active].role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="transition-all duration-300 rounded-full bg-[#C9A96E]"
              style={{ width: i === active ? 28 : 8, height: 8, opacity: i === active ? 1 : 0.3 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Landing ──────────────────────────────────────────────────────────────

export function Landing() {
  const logoSrc = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/NoaInvite_transparent.png`;

  return (
    <div className="min-h-screen bg-[#FEFAF5] text-foreground font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-[#d4c5a9]/40 bg-[#FEFAF5]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoSrc} alt="NoaInvite" className="h-9 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Funksionet</a>
            <a href="#how" className="hover:text-foreground transition-colors">Si funksionon</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Çmimet</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Hyr</Link>
            </Button>
            <Button size="sm" asChild className="bg-[#1a1a1a] hover:bg-[#333] text-white rounded-full px-5">
              <Link href="/sign-up">Fillo Falas →</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#FEFAF5]">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#C9A96E]/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#C9A96E]/8 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-28 md:py-36 grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary font-medium">
              <Sparkles className="h-3.5 w-3.5" /> Platforma №1 për Ftesa Digjitale
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#1a1a1a] leading-[1.1]">
              Dasma e ëndrrave<br />
              <span className="text-[#C9A96E]">fillon këtu.</span>
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-md">
              Ftesa digjitale, menaxhim mysafirësh, hall designer dhe QR check-in — gjithçka në një platformë moderne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-[#1a1a1a] hover:bg-[#333] text-white text-base px-8 rounded-full shadow-lg">
                <Link href="/sign-up">
                  Fillo Falas Sot <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 rounded-full border-[#d4c5a9] text-[#1a1a1a] hover:border-[#C9A96E] hover:bg-[#C9A96E]/5">
                <Link href="/sign-in">Hyr në llogari</Link>
              </Button>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { icon: <Shield className="h-3.5 w-3.5" />, text: "E sigurt & e kriptuar" },
                { icon: <Zap className="h-3.5 w-3.5" />, text: "Setup në 5 minuta" },
                { icon: <Check className="h-3.5 w-3.5" />, text: "Pa kreditim fillestar" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  {b.icon} {b.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: invitation card mockup */}
          <div className="relative flex justify-center">
            {/* Main card */}
            <div className="w-72 bg-[#FEFAF5] rounded-3xl shadow-2xl overflow-hidden border border-[#d4c5a9]/40">
              <div className="h-1.5 bg-gradient-to-r from-[#C9A96E] via-[#e8d4a0] to-[#C9A96E]" />
              <div className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-[10px] tracking-[4px] uppercase text-[#C9A96E] font-semibold">Ftesë Zyrtare</p>
                  <p className="font-serif text-2xl font-bold text-[#1a1a1a]">Artion & Mirela</p>
                  <p className="text-xs text-muted-foreground">14 Shtator 2025 · Prishtinë</p>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#d4c5a9] to-transparent" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[["28", "Ditë"], ["14", "Orë"], ["32", "Min"]].map(([n, l]) => (
                    <div key={l} className="bg-[#1a1a1a] rounded-xl py-2.5">
                      <p className="text-xl font-bold text-[#C9A96E] font-mono">{n}</p>
                      <p className="text-[8px] text-white/50 uppercase tracking-wider">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center py-1">
                  <div className="w-20 h-20 border-2 border-[#C9A96E]/30 rounded-xl p-1.5">
                    <div className="w-full h-full grid grid-cols-5 gap-0.5">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`rounded-[1px] ${[0,1,2,5,7,10,12,14,17,22,23,24,6,18].includes(i) ? "bg-[#1a1a1a]" : "bg-transparent"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-9 bg-[#C9A96E] rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">✓ Po vij</span>
                  </div>
                  <div className="h-9 border border-[#d4c5a9] rounded-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-semibold">✗ Nuk vij</span>
                  </div>
                </div>
                <p className="text-center text-[9px] text-muted-foreground">
                  Powered by <span className="text-[#C9A96E] font-medium">NoaInvite</span>
                </p>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-[#d4c5a9]/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <p className="text-[11px] font-semibold text-[#1a1a1a]">248 RSVP</p>
                  <p className="text-[9px] text-muted-foreground">Konfirmuar sot</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-[#d4c5a9]/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#C9A96E]/15 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-[#C9A96E]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#1a1a1a]">12,000+</p>
                  <p className="text-[9px] text-muted-foreground">Mysafirë</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-[#C9A96E] py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl md:text-4xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-white/75 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Photo Carousel ── */}
      <PhotoCarousel />

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary font-medium mb-4">
              ✦ Funksionet
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Çfarë ofron NoaInvite?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Çdo mjet që ju nevojitet për të organizuar eventin e ëndrrave tuaja.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-[#d4c5a9]/40 bg-[#FEFAF5] p-7 hover:bg-[#1a1a1a] hover:border-[#C9A96E]/30 transition-all duration-300 cursor-default"
              >
                <div className="mb-5 inline-flex rounded-xl bg-[#C9A96E]/10 group-hover:bg-[#C9A96E]/20 p-3.5 text-[#C9A96E] transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-white transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground group-hover:text-white/60 leading-relaxed transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <div id="how">
        <HowItWorksCarousel />
      </div>

      {/* ── Testimonials ── */}
      <TestimonialsSection />

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-[#111]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 px-4 py-1.5 text-sm text-[#C9A96E] font-medium mb-4">
              ✦ Çmimet
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Planet e Abonimit</h2>
            <p className="text-white/50 text-lg">Çmime të qarta, pa surpriza.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl p-8 flex flex-col transition-all ${
                  p.highlight
                    ? "bg-[#C9A96E] shadow-2xl shadow-[#C9A96E]/20 scale-105"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                {p.highlight && (
                  <div className="text-xs font-bold bg-white/20 rounded-full px-3 py-1 mb-4 inline-block w-fit text-white">
                    ★ Më i popullarizuar
                  </div>
                )}
                <h3 className={`font-serif text-2xl font-bold mb-1 ${p.highlight ? "text-white" : "text-white"}`}>{p.name}</h3>
                <div className={`flex items-baseline gap-1 mb-1 ${p.highlight ? "text-white" : "text-white"}`}>
                  <span className="text-4xl font-bold font-serif">{p.price}</span>
                  <span className={`text-sm ${p.highlight ? "text-white/70" : "text-white/50"}`}>{p.period}</span>
                </div>
                <p className={`text-sm mb-6 ${p.highlight ? "text-white/80" : "text-white/50"}`}>{p.events}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2.5">
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0 ${p.highlight ? "bg-white/20" : "bg-[#C9A96E]/20"}`}>
                        <Check className={`h-3 w-3 ${p.highlight ? "text-white" : "text-[#C9A96E]"}`} />
                      </div>
                      <span className={`text-sm ${p.highlight ? "text-white/90" : "text-white/65"}`}>{perk}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full rounded-full font-semibold ${
                    p.highlight
                      ? "bg-white text-[#C9A96E] hover:bg-white/90"
                      : "bg-[#C9A96E] hover:bg-[#b8934d] text-white"
                  }`}
                >
                  <Link href="/sign-up">Fillo tani</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 bg-[#FEFAF5] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="w-[600px] h-[600px] rounded-full bg-[#C9A96E] blur-3xl" />
        </div>
        <div className="relative text-center max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Gati për ditën<br />
            <span className="text-[#C9A96E]">tuaj të veçantë?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Bashkohuni me qindra organizatorë që i besojnë NoaInvite për momentet e tyre më të rëndësishme.
          </p>
          <Button size="lg" asChild className="bg-[#1a1a1a] hover:bg-[#333] text-white text-lg px-12 py-6 rounded-full shadow-xl">
            <Link href="/sign-up">
              Fillo Falas — Pa Kreditim <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#1a1a1a] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
            <img
              src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/NoaInvite_transparent.png`}
              alt="NoaInvite"
              className="h-10 w-auto"
            />
            <div className="flex gap-8 text-sm text-white/40">
              <a href="#features" className="hover:text-white/70 transition-colors">Funksionet</a>
              <a href="#how" className="hover:text-white/70 transition-colors">Si funksionon</a>
              <a href="#pricing" className="hover:text-white/70 transition-colors">Çmimet</a>
              <Link href="/sign-in" className="hover:text-white/70 transition-colors">Hyrja</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-white/30">
            <p>© {new Date().getFullYear()} NoaInvite — Të gjitha të drejtat e rezervuara.</p>
            <p className="mt-2 md:mt-0">Bërë me ♥ për çiftet shqipfolëse</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
