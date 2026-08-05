import { useState } from "react";
import { useParams } from "wouter";
import { useGetRsvp, useSubmitRsvp } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, X, MapPin, CalendarDays, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function RsvpPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const { data: rsvp, isLoading, isError } = useGetRsvp(token);
  const submitRsvp = useSubmitRsvp();
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState<"confirmed" | "declined" | null>(null);

  const handleRsvp = (attending: boolean) => {
    const resp = attending ? "confirmed" : "declined";
    submitRsvp.mutate(
      { token, data: { attending } },
      {
        onSuccess: () => {
          setResponse(resp);
          setSubmitted(true);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FEFAF5] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !rsvp) {
    return (
      <div className="min-h-screen bg-[#FEFAF5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="text-4xl">😔</div>
          <h2 className="font-serif text-2xl font-bold">Ftesa nuk u gjet</h2>
          <p className="text-muted-foreground">Linku mund të jetë i pasaktë ose i skaduar.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FEFAF5] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          {response === "confirmed" ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Faleminderit!</h2>
                <p className="text-muted-foreground mt-2">
                  Konfirmimi juaj u regjistrua. Presim me padurim t'ju shohim!
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100">
                <X className="h-10 w-10 text-gray-500" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Mirëkuptojmë</h2>
                <p className="text-muted-foreground mt-2">
                  Refuzimi juaj u regjistrua. Faleminderit për përgjigjen.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const event = (rsvp as any).event;
  const guest = (rsvp as any).guest;

  return (
    <div className="min-h-screen bg-[#FEFAF5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Invitation card */}
        <div className="rounded-3xl border-2 border-[#d4c5a9] bg-white shadow-2xl overflow-hidden">
          {/* Top decorative header */}
          <div className="bg-gradient-to-br from-[#C9A96E] to-[#b8934d] p-8 text-center text-white">
            <p className="text-sm uppercase tracking-widest opacity-80 mb-2">Ftesë Personale</p>
            <h1 className="font-serif text-3xl font-bold">
              {(rsvp as any).coupleName || event?.name}
            </h1>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Greeting */}
            <div className="text-center">
              <p className="text-muted-foreground">Të nderuar</p>
              <p className="font-serif text-xl font-semibold text-foreground">
                {guest?.firstName} {guest?.lastName}
              </p>
            </div>

            {/* Message */}
            {(rsvp as any).message && (
              <p className="text-center text-sm text-muted-foreground italic border-l-4 border-primary/30 pl-4">
                "{(rsvp as any).message}"
              </p>
            )}

            {/* Event details */}
            {event && (
              <div className="space-y-2.5 bg-[#FEFAF5] rounded-xl p-4">
                <div className="flex items-center gap-2.5 text-sm">
                  <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                  <span>{format(new Date(event.date), "dd MMMM yyyy")}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>{event.time}</span>
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{event.venue}{event.address && `, ${event.address}`}</span>
                  </div>
                )}
              </div>
            )}

            {/* RSVP buttons */}
            <div className="space-y-3">
              <p className="text-center text-sm font-medium text-muted-foreground">A do të vini?</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleRsvp(true)}
                  disabled={submitRsvp.isPending}
                  className="bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold"
                >
                  {submitRsvp.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "✓ Do të vij"}
                </Button>
                <Button
                  onClick={() => handleRsvp(false)}
                  disabled={submitRsvp.isPending}
                  variant="outline"
                  className="h-12 text-base border-2"
                >
                  ✗ Nuk vij
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Powered by <span className="text-primary font-medium">Dasma Pro</span>
        </p>
      </div>
    </div>
  );
}
