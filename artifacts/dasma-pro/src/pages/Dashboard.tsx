import { useGetDashboardOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Activity, Plus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { sq } from "date-fns/locale"; // actually use default or custom
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const { data: overview, isLoading } = useGetDashboardOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground">Pasqyra e Llogarisë</h1>
          <p className="text-muted-foreground mt-2 font-light">Mirësevini në NoaEvent. Këtu është një përmbledhje e eventeve tuaja.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none uppercase tracking-widest text-xs h-10 px-6">
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" /> Krijo Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/40 backdrop-blur border-border/50 rounded-none shadow-none hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Evente Totale</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif">{overview?.totalEvents || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur border-border/50 rounded-none shadow-none hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Mysafirë Totale</CardTitle>
            <Users className="h-4 w-4 text-primary/70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif">{overview?.totalGuests || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 shadow-none rounded-none border-border/50 bg-card/40">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="font-serif font-medium text-xl">Eventet e Ardhshme</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {overview?.upcomingEvents && overview.upcomingEvents.length > 0 ? (
              <div className="space-y-6">
                {overview.upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between border-b border-border/30 pb-6 last:border-0 last:pb-0">
                    <div>
                      <p className="font-serif text-lg text-foreground mb-1">{event.name}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{format(new Date(event.date), 'dd MMM yyyy')}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="rounded-none text-xs uppercase tracking-widest border-border/50 hover:bg-white/5">
                      <Link href={`/events/${event.id}`}>Menaxho</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground font-light italic font-serif">
                Nuk ka evente të ardhshme.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-none rounded-none border-border/50 bg-card/40">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="font-serif font-medium text-xl">Aktiviteti i Fundit</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {overview?.recentActivity && overview.recentActivity.length > 0 ? (
              <div className="space-y-6">
                {overview.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 border-b border-border/30 pb-6 last:border-0 last:pb-0">
                    <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-primary/5">
                      <Activity className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-light leading-relaxed">{activity.description}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{format(new Date(activity.timestamp), 'dd MMM yyyy HH:mm')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground font-light italic font-serif">
                Nuk ka aktivitet të fundit.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
