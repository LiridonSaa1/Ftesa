import { useState } from "react";
import { useGetSubscription, getGetSubscriptionQueryKey } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { usePaddle } from "@/hooks/usePaddle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Sparkles, Crown, Building2, AlertCircle, CreditCard, Receipt, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const PLANS = [
  {
    key: "basic", name: "Starter", price: "€14.99", period: "/muaj",
    description: "Perfekt për organizimet e para.",
    icon: <Sparkles className="h-6 w-6" />,
    features: ["1 organizim (1 event)", "Menaxhim mysafirësh", "Ftesa digjitale", "QR Code check-in", "Dashboard statistika"],
    color: "border-primary/40", badge: null,
  },
  {
    key: "pro", name: "Pro", price: "€29.99", period: "/muaj",
    description: "Për organizatorë profesionistë.",
    icon: <Crown className="h-6 w-6" />,
    features: ["Deri në 11 organizime", "Të gjitha funksionet e platformës", "Hall Designer", "QR check-in", "Import nga CSV/Excel", "Eksport PDF", "Seat Planner"],
    color: "border-primary shadow-lg shadow-primary/10", badge: "Më i popullarizuar",
  },
  {
    key: "custom", name: "Advanced", price: "€79.99", period: "/muaj",
    description: "Zgjidhje enterprise me opsione të personalizuara.",
    icon: <Building2 className="h-6 w-6" />,
    features: ["Organizime të pakufizuara", "Multi-user", "White Label (opsionale)", "Mbështetje prioritare", "Çmim sipas kërkesës"],
    color: "border-muted-foreground/30", badge: null,
  },
];

interface Payment {
  id: string;
  amount: number;
  amountFormatted: string;
  currency: string;
  status: string;
  paddleTransactionId: string;
  createdAt: string;
}

function PaymentStatusIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "failed")    return <XCircle      className="h-4 w-4 text-red-500" />;
  return                             <RefreshCcw   className="h-4 w-4 text-blue-500" />;
}

function PaymentHistory() {
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/subscription/payments"],
    queryFn: async () => {
      const res = await fetch("/api/subscription/payments", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60_000,
  });

  if (isLoading) return <Skeleton className="h-32 w-full rounded-xl" />;
  if (!payments?.length) return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
      Nuk ka pagesa akoma.
    </div>
  );

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Transaction ID</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Shuma</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statusi</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => (
            <tr key={p.id} className={cn("border-b border-border/30 hover:bg-muted/20 transition-colors", i === payments.length - 1 && "border-0")}>
              <td className="px-4 py-3 text-muted-foreground">{format(new Date(p.createdAt), "dd MMM yyyy")}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground truncate max-w-[200px]">{p.paddleTransactionId}</td>
              <td className="px-4 py-3 font-semibold">{p.amountFormatted}</td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-1.5">
                  <PaymentStatusIcon status={p.status} />
                  <span className={cn("capitalize text-xs font-medium",
                    p.status === "completed" ? "text-green-600" : p.status === "failed" ? "text-red-600" : "text-blue-600"
                  )}>
                    {p.status === "completed" ? "E kryer" : p.status === "failed" ? "Dështuar" : "Rimbursuar"}
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Subscription() {
  const { data: subscription, isLoading } = useGetSubscription();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { paddle, config, loading: paddleLoading } = usePaddle();
  const [canceling, setCanceling] = useState(false);

  const handleUpgrade = (planKey: string) => {
    if (!paddle || !config) {
      toast({ title: "Gabim", description: "Sistemi i pagesës nuk u ngarkua. Provoni përsëri.", variant: "destructive" });
      return;
    }
    const priceId = planKey === "pro" ? config.priceIdPro : planKey === "custom" ? config.priceIdCustom : config.priceIdBasic;
    if (!priceId) {
      toast({ title: "Gabim konfigurimi", description: "Çmimi i planit nuk është konfiguruar. Kontaktoni mbështetjen.", variant: "destructive" });
      return;
    }
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: user?.primaryEmailAddress?.emailAddress ? { email: user.primaryEmailAddress.emailAddress } : undefined,
      customData: { userId: user?.id ?? "" },
      settings: { successUrl: `${window.location.origin}/subscription`, displayMode: "overlay", theme: "light" },
    });
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["user-status"] });
    }, 5000);
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error();
      toast({ title: "Abonimi u anulua", description: "Keni kaluar në planin Basic." });
      queryClient.invalidateQueries({ queryKey: getGetSubscriptionQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["user-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/payments"] });
    } catch {
      toast({ title: "Gabim", description: "Nuk u anulua. Provoni përsëri.", variant: "destructive" });
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Abonimi</h1>
        <p className="text-muted-foreground mt-1">Zgjidhni planin që i përshtatet nevojave tuaja.</p>
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
              Plani aktual: <span className="text-primary capitalize">{subscription.plan}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {subscription.eventLimit !== null
                ? `Keni përdorur ${subscription.currentEventCount} nga ${subscription.eventLimit} event${subscription.eventLimit === 1 ? "" : "e"} të lejuara.`
                : `Keni ${subscription.currentEventCount} event${subscription.currentEventCount === 1 ? "" : "e"} — pa kufizim.`}
            </p>
          </div>
          {subscription.eventLimit != null && subscription.currentEventCount >= subscription.eventLimit && (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" /> Kufiri i arritur
            </div>
          )}
          {/* Cancel button — only show for paid plans */}
          {subscription.plan !== "basic" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                  Anulo abonimin
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anulo abonimin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pas anulimit do të ktheheni automatikisht në planin <strong>Basic</strong> (1 event). Të dhënat tuaja ruhen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Mbyllni</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={canceling}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {canceling ? "Duke anuluar..." : "Po, anulo"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      ) : null}

      {/* Pricing cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = subscription?.plan === plan.key;
          const isUpgradable = !isCurrent;
          return (
            <Card key={plan.key} className={cn("relative flex flex-col border-2 bg-card/60 backdrop-blur transition-all", plan.color, isCurrent && "ring-2 ring-primary ring-offset-2")}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold shadow">{plan.badge}</Badge>
                </div>
              )}
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">{plan.icon}</div>
                  <CardTitle className="font-serif text-xl">{plan.name}</CardTitle>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold font-serif text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>}
                </div>
                <CardDescription className="mt-1">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 gap-6">
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn("w-full gap-2", isCurrent ? "bg-muted text-muted-foreground cursor-default pointer-events-none" : plan.key === "pro" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "")}
                  variant={plan.key === "pro" ? "default" : "outline"}
                  disabled={isCurrent || (isUpgradable && (paddleLoading || !paddle))}
                  onClick={() => !isCurrent && handleUpgrade(plan.key)}
                >
                  {isCurrent ? "Plani aktual ✓" : paddleLoading && isUpgradable ? (
                    <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Duke ngarkuar...</span>
                  ) : (
                    <><CreditCard className="h-4 w-4" /> Kalo te {plan.name}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment history */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Historia e Pagesave</h2>
        </div>
        <PaymentHistory />
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-border/50 bg-muted/30 p-6 text-sm text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">Shënime të rëndësishme</p>
        <ul className="space-y-1.5 list-disc list-inside">
          <li>Ndryshimi i planit kërkon pagesën përmes Paddle (kartë krediti/debiti).</li>
          <li>Pas pagesës, plani i ri aktivizohet automatikisht brenda disa sekondave.</li>
          <li>Plani Custom është i negociueshëm — na kontaktoni për çmim dhe kushte.</li>
        </ul>
      </div>
    </div>
  );
}
