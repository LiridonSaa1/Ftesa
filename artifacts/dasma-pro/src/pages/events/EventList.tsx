import { useListEvents } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Plus, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function EventList() {
  const { data: rawEvents, isLoading } = useListEvents();

  const events = Array.isArray(rawEvents)
    ? rawEvents
    : (rawEvents as any)?.events && Array.isArray((rawEvents as any).events)
    ? (rawEvents as any).events
    : [];

  if (isLoading) {

    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-white/10 pb-6 relative">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-4xl font-serif font-medium tracking-tight text-foreground">Eventet e mia</h1>
          <p className="text-muted-foreground mt-2 font-light text-lg">Menaxhoni të gjitha eventet tuaja në një vend.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-xl uppercase tracking-widest text-xs h-11 px-6 shadow-[0_0_20px_rgba(217,56,94,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,56,94,0.5)] relative z-10">
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" /> Krijo Event
          </Link>
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border border-white/5 rounded-2xl glass shadow-xl mt-8">
          <div className="rounded-full bg-white/5 p-6 mb-6 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <CalendarDays className="h-10 w-10 text-primary/70" />
          </div>
          <h2 className="text-2xl font-serif font-medium mb-3 text-foreground">Nuk ka evente</h2>
          <p className="text-muted-foreground max-w-md mb-8 font-light leading-relaxed">
            Nuk keni krijuar asnjë event akoma. Filloni duke krijuar eventin tuaj të parë për të menaxhuar mysafirët dhe sallën.
          </p>
          <Button asChild className="rounded-xl uppercase tracking-widest text-xs px-8 h-12 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(217,56,94,0.3)]">
            <Link href="/events/new">Krijo Eventin e Parë</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {events.map((event: any) => (
            <Card key={event.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 border-white/5 glass rounded-2xl shadow-xl hover:shadow-[0_8px_30px_rgba(217,56,94,0.1)] relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
              <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                <div className="flex justify-between items-start">
                  <CardTitle className="font-serif text-2xl line-clamp-1 text-foreground">{event.name}</CardTitle>
                  <Badge variant={event.status === 'active' ? 'default' : 'secondary'} className={cn(
                    "capitalize rounded-md text-[10px] uppercase tracking-wider px-2.5 py-0.5 font-medium border border-white/10",
                    event.status === 'active' ? "bg-primary/20 text-primary hover:bg-primary/30" : "bg-white/10 text-muted-foreground"
                  )}>
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-6 relative z-10">
                <div className="flex items-center text-sm font-light text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 border border-white/10 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  {format(new Date(event.date), "dd MMM yyyy")}
                </div>
                {event.time && (
                  <div className="flex items-center text-sm font-light text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 border border-white/10 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>
                    {event.time}
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center text-sm font-light text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 border border-white/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-6 px-6 relative z-10">
                <Button className="w-full rounded-xl uppercase tracking-widest text-xs border-white/10 bg-white/5 hover:bg-primary hover:text-white hover:border-primary transition-all text-muted-foreground shadow-sm" variant="outline" asChild>
                  <Link href={`/events/${event.id}`}>Menaxho Eventin</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
