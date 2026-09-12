import { useState, useEffect } from "react";
import { useGetDashboardOverview, useGetSubscription } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays, Users, CheckCircle2, XCircle, Clock,
  UserCheck, LayoutGrid, Plus, ArrowRight, Crown, Sparkles, Building2,
  TrendingUp, MapPin,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

const PLAN_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  basic:  { label: "Basic",  icon: <Sparkles className="h-4 w-4" />,   color: "text-amber-500" },
  pro:    { label: "Pro",    icon: <Crown className="h-4 w-4" />,       color: "text-primary" },
  custom: { label: "Custom", icon: <Building2 className="h-4 w-4" />,  color: "text-purple-500" },
};

function CountdownHero({ nextEvent }: { nextEvent?: { id: number; name: string; date: string; venue?: string | null } }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!nextEvent?.date) return;
    const targetDate = new Date(nextEvent.date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextEvent?.date]);

  if (!nextEvent) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7B1F3A]/30 via-[#5e1729]/20 to-black/40 border border-[#7B1F3A]/30 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <Badge className="bg-[#7B1F3A]/20 text-[#EAA88F] border-[#7B1F3A]/40 text-xs px-3 py-1 uppercase tracking-widest">
              ✨ Mirë se vini në NoaEvent
            </Badge>
            <h2 className="text-3xl font-serif font-semibold text-white">Gati për të krijuar eventin tuaj?</h2>
            <p className="text-muted-foreground text-sm max-w-lg">
              Krijoni ftesa digjitale me countdown, menaxhoni listën e mysafirëve dhe planifikoni sallën e dasmës.
            </p>
          </div>
          <Button asChild size="lg" className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl px-8 shadow-lg shadow-[#7B1F3A]/30 transition-all hover:scale-105 shrink-0">
            <Link href="/events/new">
              <Plus className="mr-2 h-5 w-5" /> Krijo Event të Ri
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7B1F3A]/35 via-[#2d1a1f]/80 to-black/80 border border-[#7B1F3A]/40 p-8 shadow-2xl backdrop-blur-xl group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#7B1F3A]/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-[#7B1F3A]/30 transition-all duration-700" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7B1F3A]/30 border border-[#7B1F3A]/50 text-xs font-semibold text-[#EAA88F] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[#EAA88F]" /> Eventi i Ardhshëm
            </span>
            <span className="text-xs text-white/50">·</span>
            <span className="text-xs text-white/70 font-medium">
              {format(new Date(nextEvent.date), 'dd MMMM yyyy')}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            {nextEvent.name}
          </h2>

          {nextEvent.venue && (
            <p className="text-sm text-white/70 flex items-center gap-1.5 font-light">
              <MapPin className="h-4 w-4 text-[#7B1F3A]" /> {nextEvent.venue}
            </p>
          )}

          <div className="pt-2 flex items-center gap-3">
            <Button asChild size="sm" className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl px-5 text-xs uppercase tracking-wider shadow-md">
              <Link href={`/events/${nextEvent.id}`}>
                Menaxho Eventin <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {timeLeft && (
          <div className="flex flex-wrap items-center gap-3 md:gap-4 shrink-0 bg-black/40 p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
            {[
              { label: "Ditë", val: timeLeft.days },
              { label: "Orë", val: timeLeft.hours },
              { label: "Minuta", val: timeLeft.minutes },
              { label: "Sekonda", val: timeLeft.seconds },
            ].map((t, i) => (
              <div key={t.label} className="flex items-center gap-3 md:gap-4">
                <div className="text-center min-w-[64px]">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg bg-gradient-to-b from-white/10 to-transparent">
                    <span className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
                      {String(t.val).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/60 mt-2 block font-semibold">
                    {t.label}
                  </span>
                </div>
                {i < 3 && <span className="text-2xl font-serif text-white/20 pb-5">:</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label, value, icon, sub, accent = false,
}: {
  label: string; value: number | string; icon: React.ReactNode;
  sub?: string; accent?: boolean;
}) {
  return (
    <Card className={cn(
      "glass border border-white/5 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(217,56,94,0.1)] overflow-hidden relative",
      accent && "border-primary/20 bg-primary/5"
    )}>
      {accent && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />}
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative z-10">
        <CardTitle className="text-xs uppercase tracking-widest font-medium text-muted-foreground">{label}</CardTitle>
        <div className={cn("p-2 rounded-xl bg-white/5", accent && "bg-primary/20 text-primary")}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-4xl font-serif text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-2 font-light">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { t } = useLanguage();
  const { data: overview, isLoading: ovLoading } = useGetDashboardOverview();
  const { data: subscription, isLoading: subLoading } = useGetSubscription();

  const isLoading = ovLoading && !overview;

  const rsvpTotal = ((overview as any)?.totalConfirmed ?? 0) + ((overview as any)?.totalDeclined ?? 0) + ((overview as any)?.totalPending ?? 0);
  const confirmedPct = rsvpTotal > 0 ? Math.round((((overview as any)?.totalConfirmed ?? 0) / rsvpTotal) * 100) : 0;

  const plan = subscription?.plan ?? (overview as any)?.subscription?.plan ?? "basic";
  const pm = PLAN_META[plan] ?? PLAN_META.basic;
  const eventLimit = subscription?.eventLimit ?? (overview as any)?.subscription?.eventLimit ?? 1;
  const eventCount = overview?.totalEvents ?? 0;
  const limitPct = eventLimit ? Math.min(100, Math.round((eventCount / eventLimit) * 100)) : 0;

  const nextUpcomingEvent = overview?.upcomingEvents?.[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-60" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-28 rounded-none" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6 relative">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-4xl font-serif font-medium tracking-tight text-foreground">
            {t("dashboard.welcome", "Pasqyra e Llogarisë")} 👋
          </h1>
          <p className="text-muted-foreground mt-2 font-light text-lg">Mirë se vini në NoaEvent Dashboard</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-xl uppercase tracking-widest text-xs h-11 px-6 shadow-[0_0_20px_rgba(217,56,94,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,56,94,0.5)] relative z-10">
          <Link href="/events/new"><Plus className="mr-2 h-4 w-4" /> {t("dashboard.create_event", "Krijo Event")}</Link>
        </Button>
      </div>

      {/* ── Countdown Hero Widget ── */}
      <CountdownHero nextEvent={nextUpcomingEvent} />

      {/* ── Subscription banner ── */}
      <div className="flex items-center gap-4 rounded-2xl glass border-primary/20 bg-primary/5 px-6 py-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className={cn("rounded-xl bg-white/5 p-3 shadow-inner border border-white/5 relative z-10", pm.color)}>{pm.icon}</div>
        <div className="flex-1 min-w-0 relative z-10">
          <p className="font-semibold text-sm text-foreground">
            Plani aktual: <span className={cn("capitalize", pm.color)}>{pm.label}</span>
          </p>
          {eventLimit !== null ? (
            <div className="mt-2 flex items-center gap-4">
              <div className="flex-1 bg-black/40 rounded-full h-2 max-w-64 border border-white/5 overflow-hidden relative">
                <div className="bg-gradient-to-r from-primary/60 to-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(217,56,94,0.5)]" style={{ width: `${limitPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {eventCount} / {eventLimit} event{eventLimit !== 1 ? "e" : ""}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">Evente të pakufizuara</p>
          )}
        </div>
        {eventLimit !== null && eventCount >= eventLimit && (
          <Badge variant="destructive" className="rounded-md text-[10px] uppercase tracking-wider shrink-0 relative z-10">Limit i arritur</Badge>
        )}
        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs uppercase tracking-widest shrink-0 border-white/10 hover:bg-white/5 hover:text-foreground relative z-10">
          <Link href="/subscription">Ndrysho planin <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
        </Button>
      </div>

      {/* ── KPI grid ── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Evente" value={overview?.totalEvents ?? 0} icon={<CalendarDays className="h-4 w-4" />} />
        <KpiCard label="Mysafirë Totale" value={overview?.totalGuests ?? 0} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Tavolina" value={(overview as any)?.totalTables ?? 0} icon={<LayoutGrid className="h-4 w-4" />} />
        <KpiCard
          label="Check-in"
          value={(overview as any)?.totalCheckedIn ?? 0}
          icon={<UserCheck className="h-4 w-4" />}
          sub={(overview?.totalGuests ?? 0) > 0
            ? `${Math.round(((overview as any)?.totalCheckedIn / (overview?.totalGuests ?? 1)) * 100)}% e mysafirëve`
            : undefined}
        />
        <KpiCard label="Konfirmuar" value={(overview as any)?.totalConfirmed ?? 0} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} accent />
        <KpiCard label="Refuzuar" value={(overview as any)?.totalDeclined ?? 0} icon={<XCircle className="h-4 w-4 text-red-500" />} />
        <KpiCard label="Në Pritje" value={(overview as any)?.totalPending ?? 0} icon={<Clock className="h-4 w-4 text-amber-500" />} />
        <KpiCard
          label="Shkalla RSVP"
          value={`${confirmedPct}%`}
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          sub={rsvpTotal > 0 ? `${rsvpTotal} i ftuar, ${(overview as any)?.totalConfirmed ?? 0} konfirmoi` : "Ende nuk ka RSVP"}
        />
      </div>

      {/* ── RSVP visual bar ── */}
      {rsvpTotal > 0 && (
        <div className="rounded-2xl glass border-white/5 p-6 space-y-4 shadow-xl">
          <p className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Shpërndarja e RSVP</p>
          <div className="flex h-4 rounded-full overflow-hidden gap-1 bg-black/40 p-0.5 border border-white/5">
            <div
              className="bg-green-500/80 rounded-full transition-all shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              style={{ width: `${Math.round((((overview as any)?.totalConfirmed ?? 0) / rsvpTotal) * 100)}%` }}
              title={`Konfirmuar: ${(overview as any)?.totalConfirmed}`}
            />
            <div
              className="bg-red-500/80 rounded-full transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              style={{ width: `${Math.round(((overview as any)?.totalDeclined / rsvpTotal) * 100)}%` }}
              title={`Refuzuar: ${(overview as any)?.totalDeclined}`}
            />
            <div
              className="bg-amber-500/80 rounded-full transition-all shadow-[0_0_10px_rgba(245,158,11,0.4)]"
              style={{ width: `${Math.round(((overview as any)?.totalPending / rsvpTotal) * 100)}%` }}
              title={`Në pritje: ${(overview as any)?.totalPending}`}
            />
          </div>
          <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />Konfirmuar: {(overview as any)?.totalConfirmed ?? 0}</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />Refuzuar: {(overview as any)?.totalDeclined ?? 0}</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />Në pritje: {(overview as any)?.totalPending ?? 0}</span>
          </div>
        </div>
      )}

      {/* ── Upcoming events + quick actions ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-xl rounded-2xl glass border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4 flex flex-row items-center justify-between bg-white/[0.02]">
            <CardTitle className="font-serif font-medium text-xl text-foreground">Eventet e Ardhshme</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground rounded-xl hover:bg-white/5 hover:text-white transition-colors">
              <Link href="/events">Të gjitha <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {overview?.upcomingEvents && overview.upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {overview.upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-colors group">
                    <div>
                      <p className="font-serif text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{event.name}</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        <p className="text-[10px] uppercase tracking-wider">
                          {format(new Date(event.date), 'dd MMM yyyy')}
                        </p>
                        {event.venue && <span className="text-white/20">·</span>}
                        {event.venue && <p className="text-[10px] truncate max-w-24 uppercase tracking-wider">{event.venue}</p>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="rounded-lg text-xs uppercase tracking-widest border-white/10 hover:bg-white/10 hover:text-white">
                      <Link href={`/events/${event.id}`}>Menaxho</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <CalendarDays className="h-8 w-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground font-light text-sm">Nuk ka evente të ardhshme.</p>
                <Button asChild className="mt-6 rounded-xl text-xs uppercase tracking-widest bg-white/10 text-white hover:bg-white/20 border border-white/10" size="sm">
                  <Link href="/events/new">Krijo eventin e parë</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="shadow-xl rounded-2xl glass border-white/5 overflow-hidden">
          <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.02]">
            <CardTitle className="font-serif font-medium text-xl text-foreground">Veprime të Shpejta</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {[
              { href: "/events/new",    icon: <Plus className="h-5 w-5" />,         label: "Krijo Event të Ri",       desc: "Filloni planifikimin e eventit tuaj" },
              { href: "/events",        icon: <CalendarDays className="h-5 w-5" />,  label: "Shiko të gjitha eventet", desc: "Menaxhoni eventet ekzistuese" },
              { href: "/subscription",  icon: <Crown className="h-5 w-5" />,         label: "Abonimi & Planet",         desc: "Shikoni ose ndryshoni planin tuaj" },
            ].map(action => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-4 px-5 py-4 border border-white/5 bg-black/20 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer rounded-xl group hover:shadow-[0_4px_20px_rgba(217,56,94,0.1)]">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0 group-hover:border-primary/30">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-white transition-colors">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
