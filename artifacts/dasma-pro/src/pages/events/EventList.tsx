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
    <div className="space-y-8 animate-in fade-in slide-in-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Eventet e mia</h1>
          <p className="text-muted-foreground mt-1">Menaxhoni të gjitha eventet tuaja në një vend.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" /> Krijo Event
          </Link>
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-card/30">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <CalendarDays className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-serif font-semibold mb-2">Nuk ka evente</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            Nuk keni krijuar asnjë event akoma. Filloni duke krijuar eventin tuaj të parë për të menaxhuar mysafirët dhe sallën.
          </p>
          <Button asChild>
            <Link href="/events/new">Krijo Eventin e Parë</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col overflow-hidden transition-all hover:shadow-md border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="font-serif text-xl line-clamp-1">{event.name}</CardTitle>
                  <Badge variant={event.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4 text-primary/70" />
                  {format(new Date(event.date), "dd MMM yyyy")}
                </div>
                {event.time && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4 text-primary/70" />
                    {event.time}
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 text-primary/70" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/20">
                <Button className="w-full" variant="outline" asChild>
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
