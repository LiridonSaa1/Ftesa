import { useState } from "react";
import { useGetMe, useUpdateProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function Settings() {
  const qc = useQueryClient();
  const { data: me, isLoading } = useGetMe();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (me && !initialized) {
    setFirstName(me.firstName || "");
    setLastName(me.lastName || "");
    setInitialized(true);
  }

  const handleSave = () => {
    updateProfile.mutate(
      { data: { firstName, lastName } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "Profili u përditësua!" });
        },
        onError: () => toast({ title: "Gabim", variant: "destructive" }),
      }
    );
  };

  const PLAN_LABELS: Record<string, string> = {
    basic: "Basic · €10/muaj",
    pro: "Pro · €50/muaj",
    custom: "Custom",
  };

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Cilësimet</h1>
        <p className="text-muted-foreground mt-1">Menaxhoni profilin dhe llogarinë tuaj.</p>
      </div>

      {/* Profile */}
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profili Im
          </CardTitle>
          <CardDescription>Përditësoni emrin dhe të dhënat tuaja.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Emri</Label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Emri juaj" />
                </div>
                <div className="space-y-1">
                  <Label>Mbiemri</Label>
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mbiemri juaj" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={me?.email || ""} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Email-i menaxhohet nga sistemi i autentikimit.</p>
              </div>
              <Button onClick={handleSave} disabled={updateProfile.isPending} className="bg-primary hover:bg-primary/90 text-white">
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ruaj Ndryshimet
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscription info */}
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <CardTitle className="font-serif">Abonimi</CardTitle>
          <CardDescription>Plani juaj aktual i abonimit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{PLAN_LABELS[me?.subscriptionPlan || "basic"] || me?.subscriptionPlan}</p>
                <p className="text-sm text-muted-foreground capitalize">{me?.subscriptionPlan} plan</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/subscription">Ndrysho Planin</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
