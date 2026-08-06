import { useGetSubscription, useUpdateSubscription, getGetSubscriptionQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Sparkles, Crown, Building2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "basic",
    name: "Basic",
    price: "€10",
    period: "/muaj",
    description: "Perfekt për organizimet e para.",
    icon: <Sparkles className="h-6 w-6" />,
    features: [
      "1 organizim (1 event)",
      "Menaxhim mysafirësh",
      "Ftesa digjitale",
      "QR Code check-in",
      "Dashboard statistika",
    ],
    color: "border-primary/40",
    badge: null,
  },
  {
    key: "pro",
    name: "Pro",
    price: "€50",
    period: "/muaj",
    description: "Për organizatorë profesionistë.",
    icon: <Crown className="h-6 w-6" />,
    features: [
      "Deri në 11 organizime",
      "Të gjitha funksionet e platformës",
      "Hall Designer",
      "QR check-in",
      "Import nga CSV/Excel",
      "Eksport PDF",
      "Seat Planner",
    ],
    color: "border-primary shadow-lg shadow-primary/10",
    badge: "Më i popullarizuar",
  },
  {
    key: "custom",
    name: "Custom",
    price: "Me marrëveshje",
    period: "",
    description: "Zgjidhje enterprise me opsione të personalizuara.",
    icon: <Building2 className="h-6 w-6" />,
    features: [
      "Organizime të pakufizuara",
      "Multi-user",
      "White Label (opsionale)",
      "Mbështetje prioritare",
      "Çmim sipas kërkesës",
    ],
    color: "border-muted-foreground/30",
    badge: null,
  },
];

export function Subscription() {
  const { data: subscription, isLoading } = useGetSubscription();
  const updateSubscription = useUpdateSubscription();
  const queryClient = useQueryClient();

  const handleUpgrade = (plan: string) => {
    if (plan === "custom") {
      toast({
        title: "Kontaktoni ekipin tonë",
        description: "Për planin Custom, ju lutem na kontaktoni drejtpërdrejt për çmim dhe konfigurim.",
      });
      return;
    }
    updateSubscription.mutate(
      { data: { plan: plan as "basic" | "pro" | "custom" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey() });
          toast({
            title: "Plani u ndryshua!",
            description: `Tani jeni në planin ${plan.charAt(0).toUpperCase() + plan.slice(1)}.`,
          });
        },
        onError: () => {
          toast({
            title: "Gabim",
            description: "Nuk mund të ndryshohej plani. Provoni përsëri.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Abonimi</h1>
        <p className="text-muted-foreground mt-1">
          Zgjidhni planin që i përshtatet nevojave tuaja.
        </p>
      </div>

      {/* Current plan status */}
      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : subscription ? (
        <div className="flex items-start gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="rounded-full bg-primary/10 p-2.5">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              Plani aktual:{" "}
              <span className="text-primary capitalize">{subscription.plan}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {subscription.eventLimit !== null
                ? `Keni përdorur ${subscription.currentEventCount} nga ${subscription.eventLimit} event${subscription.eventLimit === 1 ? "" : "e"} të lejuara.`
                : `Keni ${subscription.currentEventCount} event${subscription.currentEventCount === 1 ? "" : "e"} — pa kufizim.`}
            </p>
          </div>
          {subscription.eventLimit != null &&
            subscription.currentEventCount >= subscription.eventLimit && (
              <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Kufiri i arritur
              </div>
            )}
        </div>
      ) : null}

      {/* Pricing cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = subscription?.plan === plan.key;
          const isPending = updateSubscription.isPending && updateSubscription.variables?.data?.plan === plan.key;

          return (
            <Card
              key={plan.key}
              className={cn(
                "relative flex flex-col border-2 bg-card/60 backdrop-blur transition-all",
                plan.color,
                isCurrent && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold shadow">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    {plan.icon}
                  </div>
                  <CardTitle className="font-serif text-xl">{plan.name}</CardTitle>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold font-serif text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                  )}
                </div>
                <CardDescription className="mt-1">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col flex-1 gap-6">
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full",
                    isCurrent
                      ? "bg-muted text-muted-foreground cursor-default pointer-events-none"
                      : plan.key === "pro"
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : ""
                  )}
                  variant={plan.key === "pro" ? "default" : "outline"}
                  disabled={isCurrent || updateSubscription.isPending}
                  onClick={() => !isCurrent && handleUpgrade(plan.key)}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Duke ndryshuar...
                    </span>
                  ) : isCurrent ? (
                    "Plani aktual ✓"
                  ) : plan.key === "custom" ? (
                    "Na kontaktoni"
                  ) : (
                    `Kalo te ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ / note */}
      <div className="rounded-xl border border-border/50 bg-muted/30 p-6 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">Shënime të rëndësishme</p>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>Ndryshimi i planit hyn në fuqi menjëherë.</li>
          <li>Plani Basic lejon krijimin e 1 eventi. Nëse keni arritur limitin, kaloni te Pro.</li>
          <li>Plani Custom është i negociueshëm — na kontaktoni për çmim dhe kushte.</li>
        </ul>
      </div>
    </div>
  );
}
