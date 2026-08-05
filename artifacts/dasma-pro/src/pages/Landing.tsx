import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, CalendarDays, Users, QrCode, LayoutDashboard, Mail, Map } from "lucide-react";

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

export function Landing() {
  return (
    <div className="min-h-screen bg-[#FEFAF5] text-foreground font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[#d4c5a9]/40 bg-[#FEFAF5]/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`}
              alt="Dasma Pro"
              className="h-8 w-auto"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="font-serif text-xl font-semibold tracking-wide text-foreground">
              Dasma Pro
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
          ✦ Platforma №1 për Organizimin e Dasmave
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
        <p>© {new Date().getFullYear()} Dasma Pro — Të gjitha të drejtat e rezervuara.</p>
      </footer>
    </div>
  );
}
