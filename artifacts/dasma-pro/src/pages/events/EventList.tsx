import { useListEvents } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Plus, Clock } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function EventList() {
  const { data: events, isLoading } = useListEvents();

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
      <div className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground">Eventet e mia</h1>
          <p className="text-muted-foreground mt-2 font-light">Menaxhoni të gjitha eventet tuaja në një vend.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none uppercase tracking-widest text-xs h-10 px-6">
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" /> Krijo Event
          </Link>
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center border border-border/50 rounded-none bg-card/20">
          <div className="rounded-full bg-primary/5 p-6 mb-6">
            <CalendarDays className="h-10 w-10 text-primary/70" />
          </div>
          <h2 className="text-2xl font-serif font-medium mb-3 text-foreground">Nuk ka evente</h2>
          <p className="text-muted-foreground max-w-md mb-8 font-light leading-relaxed">
            Nuk keni krijuar asnjë event akoma. Filloni duke krijuar eventin tuaj të parë për të menaxhuar mysafirët dhe sallën.
          </p>
          <Button asChild className="rounded-none uppercase tracking-widest text-xs px-8 h-12">
            <Link href="/events/new">Krijo Eventin e Parë</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col overflow-hidden transition-all hover:border-primary/30 border-border/50 bg-card/40 rounded-none shadow-none">
              <CardHeader className="pb-6 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <CardTitle className="font-serif text-xl line-clamp-1">{event.name}</CardTitle>
                  <Badge variant={event.status === 'active' ? 'default' : 'secondary'} className="capitalize rounded-none text-[10px] uppercase tracking-wider px-2 font-medium">
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pt-6">
                <div className="flex items-center text-sm font-light text-muted-foreground">
                  <CalendarDays className="mr-3 h-4 w-4 text-primary/70" />
                  {format(new Date(event.date), "dd MMM yyyy")}
                </div>
                {event.time && (
                  <div className="flex items-center text-sm font-light text-muted-foreground">
                    <Clock className="mr-3 h-4 w-4 text-primary/70" />
                    {event.time}
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center text-sm font-light text-muted-foreground">
                    <MapPin className="mr-3 h-4 w-4 text-primary/70" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-6 px-6">
                <Button className="w-full rounded-none uppercase tracking-widest text-xs border-border hover:bg-white/5 hover:text-foreground" variant="outline" asChild>
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
