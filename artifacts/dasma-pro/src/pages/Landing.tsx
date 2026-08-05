import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

const features = [
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Menaxhim Mysafirësh",
    desc: "Shtoni, importoni dhe organizoni mysafirët sipas familjes, kategorisë dhe statusit.",
  },
  {
    icon: <LayoutDashboard className="h-6 w-6 text-primary" />,
    title: "Hall Designer",
    desc: "Krijoni planin vizual të sallës me drag & drop — tavolina, karriger, skenë dhe më shumë.",
  },
  {
    icon: <Mail className="h-6 w-6 text-primary" />,
    title: "Ftesa Digjitale",
    desc: "Dërgoni ftesa personale me link unik, QR code dhe countdown drejt ditës së madhe.",
  },
  {
    icon: <QrCode className="h-6 w-6 text-primary" />,
    title: "QR Check-in",
    desc: "Stafi skanon QR-in e mysafirit dhe sistemi tregon tavolinën dhe vendosjen automatikisht.",
  },
  {
    icon: <CalendarDays className="h-6 w-6 text-primary" />,
    title: "RSVP Automatik",
    desc: "Mysafirët konfirmojnë ose refuzojnë me një klik — dashboardi përditësohet menjëherë.",
  },
  {
    icon: <Map className="h-6 w-6 text-primary" />,
    title: "Seat Planner",
    desc: "Pamje vizuale e plotë me tavolina, karriger dhe emrat e mysafirëve të ulur.",
  },
];

const plans = [
  { name: "Basic", price: "€10/muaj", events: "1 event", highlight: false },
  { name: "Pro", price: "€50/muaj", events: "11 evente", highlight: true },
  { name: "Custom", price: "Me marrëveshje", events: "Pa limit", highlight: false },
];

// ─── How-it-works carousel slides ────────────────────────────────────────────

const steps = [
  {
    number: "01",
    title: "Krijoni Eventin",
    subtitle: "Gjithçka fillon me disa klikime",
    desc: "Plotësoni emrin e çiftit, datën, vendin dhe numrin e pritshëm të mysafirëve. Sistemi gjeneron automatikisht një faqe eventi me stilin tuaj.",
    color: "#C9A96E",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-6">
        {/* Event card mockup */}
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
        {/* floating badge */}
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
        {/* Phone mockup */}
        <div className="w-48 bg-[#1a1a1a] rounded-[2rem] shadow-2xl p-1.5">
          <div className="bg-white rounded-[1.6rem] overflow-hidden">
            {/* Status bar */}
            <div className="h-5 bg-[#FEFAF5] flex items-center justify-center">
              <div className="w-12 h-1.5 bg-[#1a1a1a]/20 rounded-full" />
            </div>
            <div className="bg-gradient-to-b from-[#FEFAF5] to-white px-3 pb-4 space-y-2">
              {/* Invitation header */}
              <div className="text-center py-2">
                <p className="text-[7px] text-[#C9A96E] font-semibold tracking-widest uppercase">Dasma</p>
                <p className="text-[12px] font-serif font-bold text-[#1a1a1a] leading-tight">Artion & Mirela</p>
                <p className="text-[7px] text-muted-foreground">14 Shtator 2025 • Prishtinë</p>
              </div>
              {/* Countdown */}
              <div className="grid grid-cols-3 gap-1">
                {[["28", "Ditë"], ["14", "Orë"], ["32", "Min"]].map(([n, l]) => (
                  <div key={l} className="bg-[#1a1a1a] rounded-lg py-1.5 text-center">
                    <p className="text-[12px] font-bold text-[#C9A96E]">{n}</p>
                    <p className="text-[6px] text-white/60">{l}</p>
                  </div>
                ))}
              </div>
              {/* QR */}
              <div className="flex justify-center">
                <div className="w-14 h-14 border-2 border-[#C9A96E]/30 rounded-lg p-1">
                  <div className="w-full h-full grid grid-cols-4 gap-0.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`rounded-[1px] ${[0,1,4,6,9,11,14,15,3,12].includes(i) ? "bg-[#1a1a1a]" : "bg-transparent"}`} />
                    ))}
                  </div>
                </div>
              </div>
              {/* RSVP buttons */}
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
        {/* Envelope floating */}
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
    desc: "Vizatoni planin e sallës me drag & drop. Shtoni tavolina të rrumbullakëta ose katrore, karriget, skenën dhe emërtoni çdo vend. Mysafirët caktohen automatikisht.",
    color: "#C4856A",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-6">
        <div className="w-72 bg-white rounded-2xl shadow-2xl border border-[#d4c5a9]/60 overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-[#C4856A] to-[#e0a88e]" />
          <div className="p-3">
            {/* Toolbar */}
            <div className="flex gap-1.5 mb-2">
              {["Tryezë ⊙", "Karrige ■", "Skenë ▬", "Undo ↩"].map((t) => (
                <div key={t} className="text-[8px] px-2 py-1 rounded-md bg-[#FEFAF5] border border-[#d4c5a9]/50 text-muted-foreground cursor-default">
                  {t}
                </div>
              ))}
            </div>
            {/* Hall grid */}
            <div className="relative w-full h-40 bg-[#FEFAF5] rounded-xl border border-dashed border-[#d4c5a9] overflow-hidden">
              {/* Stage */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1a1a1a]/10 rounded border border-[#1a1a1a]/20 flex items-center justify-center">
                <span className="text-[7px] text-[#1a1a1a]/50 font-medium">SKENË</span>
              </div>
              {/* Tables */}
              {[
                { x: 16, y: 30, label: "T1", color: "#C9A96E", guests: 8 },
                { x: 60, y: 30, label: "T2", color: "#7C9E87", guests: 6 },
                { x: 104, y: 30, label: "T3", color: "#8B9DC3", guests: 8 },
                { x: 148, y: 30, label: "T4", color: "#C4856A", guests: 6 },
                { x: 38, y: 80, label: "T5", color: "#C9A96E", guests: 8 },
                { x: 82, y: 80, label: "T6", color: "#7C9E87", guests: 6 },
                { x: 126, y: 80, label: "T7", color: "#8B9DC3", guests: 8 },
              ].map((t) => (
                <div
                  key={t.label}
                  className="absolute flex items-center justify-center rounded-full border-2 text-[7px] font-bold text-white shadow-md cursor-move"
                  style={{ left: t.x, top: t.y, width: 30, height: 30, background: t.color, borderColor: t.color + "80" }}
                >
                  {t.label}
                </div>
              ))}
              {/* Selected indicator */}
              <div className="absolute" style={{ left: 82, top: 110 }}>
                <div className="bg-white rounded-lg shadow-lg border border-[#d4c5a9]/60 px-2 py-1 whitespace-nowrap">
                  <p className="text-[7px] font-semibold text-[#1a1a1a]">Tryeza 6 • 6 karriget</p>
                  <p className="text-[6px] text-muted-foreground">Agim, Mirela, +4</p>
                </div>
              </div>
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
        {/* Scanner phone */}
        <div className="w-48 bg-[#1a1a1a] rounded-[2rem] shadow-2xl p-1.5">
          <div className="bg-[#0a0a0a] rounded-[1.6rem] overflow-hidden">
            <div className="h-5 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>
            <div className="px-3 pb-4 space-y-2">
              {/* Camera viewfinder */}
              <div className="relative h-28 bg-[#111] rounded-xl overflow-hidden flex items-center justify-center">
                {/* Scan lines */}
                <div className="absolute inset-0 opacity-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-px bg-[#C9A96E] w-full" style={{ marginTop: i * 15 }} />
                  ))}
                </div>
                {/* Corner brackets */}
                {[["top-1 left-1", "border-t-2 border-l-2"],
                  ["top-1 right-1", "border-t-2 border-r-2"],
                  ["bottom-1 left-1", "border-b-2 border-l-2"],
                  ["bottom-1 right-1", "border-b-2 border-r-2"]].map(([pos, cls], i) => (
                  <div key={i} className={`absolute ${pos} w-4 h-4 border-[#C9A96E] ${cls} rounded-sm`} />
                ))}
                {/* QR placeholder */}
                <div className="w-14 h-14 border border-[#C9A96E]/40 rounded-md grid grid-cols-4 gap-0.5 p-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className={`rounded-[1px] ${[0,1,4,6,9,11,14,15,3,12].includes(i) ? "bg-[#C9A96E]/80" : "bg-transparent"}`} />
                  ))}
                </div>
                {/* Scan laser */}
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent animate-pulse" />
              </div>
              {/* Result card */}
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

        {/* Live stats */}
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
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-muted-foreground">Presin</span>
              <span className="text-[9px] font-bold text-[#1a1a1a]">62</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

// ─── Carousel component ───────────────────────────────────────────────────────

function HowItWorksCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() => setActive((a) => (a - 1 + steps.length) % steps.length), []);
  const next = useCallback(() => setActive((a) => (a + 1) % steps.length), []);

  // Auto-advance every 4 s
  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, next]);

  const step = steps[active];

  return (
    <section
      className="py-24 bg-[#1a1a1a] relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#C9A96E 1px, transparent 1px), linear-gradient(90deg, #C9A96E 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 px-4 py-1.5 text-sm text-[#C9A96E] font-medium mb-4">
            ✦ Si funksionon
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Nga ideja te<br />
            <span className="text-[#C9A96E]">dita e madhe</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Pesë hapa të thjeshtë — gjithçka tjetër e bën Dasma Pro.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="grid md:grid-cols-2 gap-8 items-center min-h-[460px]">
            {/* Left: text */}
            <div className="space-y-6">
              {/* Step number */}
              <div
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full border"
                style={{ borderColor: step.color + "40", background: step.color + "15" }}
              >
                <span className="font-mono text-sm font-bold" style={{ color: step.color }}>
                  {step.number}
                </span>
                <span className="text-sm text-white/60">{step.subtitle}</span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight">
                {step.title}
              </h3>

              {/* Desc */}
              <p className="text-white/60 text-lg leading-relaxed">{step.desc}</p>

              {/* Progress dots */}
              <div className="flex items-center gap-3 pt-4">
                {steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: i === active ? 28 : 8,
                      height: 8,
                      background: i === active ? s.color : "rgba(255,255,255,0.2)",
                    }}
                    aria-label={`Hapi ${i + 1}`}
                  />
                ))}
              </div>

              {/* Nav arrows */}
              <div className="flex gap-3">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right: visual mockup */}
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${step.color}18, ${step.color}08)`,
                border: `1px solid ${step.color}30`,
                height: 380,
              }}
            >
              {/* subtle top glow */}
              <div
                className="absolute inset-x-0 top-0 h-32 opacity-30"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${step.color}, transparent 70%)`,
                }}
              />
              {step.visual}
            </div>
          </div>

          {/* Step pills row */}
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

// ─── Main Landing component ───────────────────────────────────────────────────

export function Landing() {
  return (
    <div className="min-h-screen bg-[#FEFAF5] text-foreground font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[#d4c5a9]/40 bg-[#FEFAF5]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center rounded-lg bg-[#111] px-2 py-1">
              <img
                src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.png`}
                alt="NoaInvite"
                className="h-6 w-auto"
              />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Hyr</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/sign-up">Fillo Falas</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary font-medium mb-8">
          ✦ Platforma №1 për Ftesa Digjitale
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
          Organizoni dasmat tuaja
          <br />
          <span className="text-primary">me elegancë dhe lehtësi</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Nga ftesa digjitale deri te plani i sallës — gjithçka që ju nevojitet për një ditë
          të përsosur, në një platformë moderne.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white text-base px-8">
            <Link href="/sign-up">Fillo Falas Sot</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base px-8 border-primary/30 hover:border-primary">
            <Link href="/sign-in">Hyr në llogari</Link>
          </Button>
        </div>
      </section>

      {/* How it works carousel */}
      <HowItWorksCarousel />

      {/* Features */}
      <section className="bg-white/60 border-y border-[#d4c5a9]/30 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-3">
              Çfarë ofron Dasma Pro?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Çdo mjet që ju nevojitet për të organizuar eventin e ëndrrave tuaja.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#d4c5a9]/40 bg-[#FEFAF5] p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">{f.icon}</div>
                <h3 className="font-serif text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-3">Planet e Abonimit</h2>
          <p className="text-muted-foreground text-lg">Çmime të qarta, pa surpriza.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border-2 p-7 text-center transition-all ${
                p.highlight
                  ? "border-primary shadow-xl shadow-primary/10 bg-white"
                  : "border-[#d4c5a9]/40 bg-[#FEFAF5]"
              }`}
            >
              {p.highlight && (
                <div className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-4 inline-block">
                  Më i popullarizuar
                </div>
              )}
              <h3 className="font-serif text-2xl font-bold mb-1">{p.name}</h3>
              <p className="text-primary font-semibold text-lg mb-2">{p.price}</p>
              <p className="text-sm text-muted-foreground mb-5">{p.events}</p>
              <Button
                asChild
                className={`w-full ${p.highlight ? "bg-primary hover:bg-primary/90 text-white" : ""}`}
                variant={p.highlight ? "default" : "outline"}
              >
                <Link href="/sign-up">Fillo tani</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d4c5a9]/30 py-8 text-center text-sm text-muted-foreground bg-white/40">
        <p>© {new Date().getFullYear()} NoaInvite — Të gjitha të drejtat e rezervuara.</p>
      </footer>
    </div>
  );
}
