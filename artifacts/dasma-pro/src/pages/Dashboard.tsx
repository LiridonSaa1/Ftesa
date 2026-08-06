import { useGetDashboardOverview, useGetSubscription } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays, Users, CheckCircle2, XCircle, Clock,
  UserCheck, LayoutGrid, Plus, ArrowRight, Crown, Sparkles, Building2,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PLAN_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  basic:  { label: "Basic",  icon: <Sparkles className="h-4 w-4" />,   color: "text-amber-500" },
  pro:    { label: "Pro",    icon: <Crown className="h-4 w-4" />,       color: "text-primary" },
  custom: { label: "Custom", icon: <Building2 className="h-4 w-4" />,  color: "text-purple-500" },
};

function KpiCard({
  label, value, icon, sub, accent = false,
}: {
  label: string; value: number | string; icon: React.ReactNode;
  sub?: string; accent?: boolean;
}) {
  return (
    <Card className={cn(
      "border-border/50 bg-card/40 rounded-none shadow-none hover:border-primary/30 transition-colors",
      accent && "border-primary/30 bg-primary/5"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <CardTitle className="text-xs uppercase tracking-widest font-medium text-muted-foreground">{label}</CardTitle>
        <span className="text-primary/70">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-serif">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1 font-light">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { data: overview, isLoading: ovLoading } = useGetDashboardOverview();
  const { data: subscription, isLoading: subLoading } = useGetSubscription();

  const isLoading = ovLoading || subLoading;

  const rsvpTotal = (overview?.totalConfirmed ?? 0) + (overview?.totalDeclined ?? 0) + (overview?.totalPending ?? 0);
  const confirmedPct = rsvpTotal > 0 ? Math.round(((overview?.totalConfirmed ?? 0) / rsvpTotal) * 100) : 0;

  const plan = subscription?.plan ?? (overview as any)?.subscription?.plan ?? "basic";
  const pm = PLAN_META[plan] ?? PLAN_META.basic;
  const eventLimit = subscription?.eventLimit ?? (overview as any)?.subscription?.eventLimit ?? 1;
  const eventCount = overview?.totalEvents ?? 0;
  const limitPct = eventLimit ? Math.min(100, Math.round((eventCount / eventLimit) * 100)) : 0;

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
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight">Pasqyra e Llogarisë</h1>
          <p className="text-muted-foreground mt-2 font-light">Mirësevini në NoaEvent. Ja situata aktuale.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none uppercase tracking-widest text-xs h-10 px-6">
          <Link href="/events/new"><Plus className="mr-2 h-4 w-4" /> Krijo Event</Link>
        </Button>
      </div>

      {/* ── Subscription banner ── */}
      <div className="flex items-center gap-4 rounded-none border border-primary/20 bg-primary/5 px-5 py-4">
        <div className={cn("rounded-full bg-background p-2.5", pm.color)}>{pm.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">
            Plani aktual: <span className={cn("capitalize", pm.color)}>{pm.label}</span>
          </p>
          {eventLimit !== null ? (
            <div className="mt-1.5 flex items-center gap-3">
              <div className="flex-1 bg-muted/50 rounded-full h-1.5 max-w-48">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${limitPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {eventCount} / {eventLimit} event{eventLimit !== 1 ? "e" : ""}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">Evente të pakufizuara</p>
          )}
        </div>
        {eventLimit !== null && eventCount >= eventLimit && (
          <Badge variant="destructive" className="rounded-none text-[10px] uppercase tracking-wider shrink-0">Limit i arritur</Badge>
        )}
        <Button asChild variant="outline" size="sm" className="rounded-none text-xs uppercase tracking-widest shrink-0">
          <Link href="/subscription">Ndrysho planin <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
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
          sub={rsvpTotal > 0 ? `${rsvpTotal} i ftuar, ${overview?.totalConfirmed ?? 0} konfirmoi` : "Ende nuk ka RSVP"}
        />
      </div>

      {/* ── RSVP visual bar ── */}
      {rsvpTotal > 0 && (
        <div className="rounded-none border border-border/50 bg-card/40 p-6 space-y-3">
          <p className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Shpërndarja e RSVP</p>
          <div className="flex h-3 rounded-full overflow-hidden gap-px">
            <div
              className="bg-green-500 transition-all"
              style={{ width: `${Math.round(((overview?.totalConfirmed ?? 0) / rsvpTotal) * 100)}%` }}
              title={`Konfirmuar: ${overview?.totalConfirmed}`}
            />
            <div
              className="bg-red-400 transition-all"
              style={{ width: `${Math.round(((overview as any)?.totalDeclined / rsvpTotal) * 100)}%` }}
              title={`Refuzuar: ${(overview as any)?.totalDeclined}`}
            />
            <div
              className="bg-amber-300 transition-all"
              style={{ width: `${Math.round(((overview as any)?.totalPending / rsvpTotal) * 100)}%` }}
              title={`Në pritje: ${(overview as any)?.totalPending}`}
            />
          </div>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" />Konfirmuar {overview?.totalConfirmed ?? 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" />Refuzuar {(overview as any)?.totalDeclined ?? 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-300" />Në pritje {(overview as any)?.totalPending ?? 0}</span>
          </div>
        </div>
      )}

      {/* ── Upcoming events + quick actions ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-none rounded-none border-border/50 bg-card/40">
          <CardHeader className="border-b border-border/30 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="font-serif font-medium text-xl">Eventet e Ardhshme</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground rounded-none">
              <Link href="/events">Të gjitha <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {overview?.upcomingEvents && overview.upcomingEvents.length > 0 ? (
              <div className="space-y-5">
                {overview.upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between border-b border-border/30 pb-5 last:border-0 last:pb-0">
                    <div>
                      <p className="font-serif text-base text-foreground mb-1">{event.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {format(new Date(event.date), 'dd MMM yyyy')}
                        </p>
                        {event.venue && <span className="text-muted-foreground">·</span>}
                        {event.venue && <p className="text-[10px] text-muted-foreground truncate max-w-24">{event.venue}</p>}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="rounded-none text-xs uppercase tracking-widest border-border/50">
                      <Link href={`/events/${event.id}`}>Menaxho</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="h-8 w-8 text-primary/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-light italic font-serif text-sm">Nuk ka evente të ardhshme.</p>
                <Button asChild className="mt-4 rounded-none text-xs uppercase tracking-widest" size="sm">
                  <Link href="/events/new">Krijo eventin e parë</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="shadow-none rounded-none border-border/50 bg-card/40">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="font-serif font-medium text-xl">Veprime të Shpejta</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {[
              { href: "/events/new",    icon: <Plus className="h-4 w-4" />,         label: "Krijo Event të Ri",       desc: "Filloni planifikimin e eventit tuaj" },
              { href: "/events",        icon: <CalendarDays className="h-4 w-4" />,  label: "Shiko të gjitha eventet", desc: "Menaxhoni eventet ekzistuese" },
              { href: "/subscription",  icon: <Crown className="h-4 w-4" />,         label: "Abonimi & Planet",         desc: "Shikoni ose ndryshoni planin tuaj" },
            ].map(action => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-4 px-4 py-3.5 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer rounded-none group">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors shrink-0">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground font-light">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
