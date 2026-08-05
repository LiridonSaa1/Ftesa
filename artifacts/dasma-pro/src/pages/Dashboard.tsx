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
    <div className="space-y-8 animate-in fade-in slide-in-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Pasqyra e Llogarisë</h1>
          <p className="text-muted-foreground mt-1">Mirësevini në NoaEvent. Këtu është një përmbledhje e eventeve tuaja.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" /> Krijo Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-sm hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evente Totale</CardTitle>
            <CalendarDays className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{overview?.totalEvents || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-sm hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mysafirë Totale</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{overview?.totalGuests || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="font-serif">Eventet e Ardhshme</CardTitle>
          </CardHeader>
          <CardContent>
            {overview?.upcomingEvents && overview.upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {overview.upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-foreground">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(event.date), 'dd MMM yyyy')}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/events/${event.id}`}>Menaxho</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nuk ka evente të ardhshme.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="font-serif">Aktiviteti i Fundit</CardTitle>
          </CardHeader>
          <CardContent>
            {overview?.recentActivity && overview.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {overview.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-2">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(activity.timestamp), 'dd MMM yyyy HH:mm')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nuk ka aktivitet të fundit.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
