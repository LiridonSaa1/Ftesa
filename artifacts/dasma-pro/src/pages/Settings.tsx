import { useState } from "react";
import { useGetMe, useUpdateProfile } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useClerk } from "@clerk/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, User, KeyRound, Camera, ShieldCheck, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";

export function Settings() {
  const qc = useQueryClient();
  const { data: me, isLoading } = useGetMe();
  const updateProfile = useUpdateProfile();
  const { openUserProfile } = useClerk();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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
          toast({ title: "Profili u përditësua me sukses!" });
        },
        onError: () => toast({ title: "Gabim përditësimi", variant: "destructive" }),
      }
    );
  };

  const PLAN_LABELS: Record<string, string> = {
    basic: "Basic · €10/muaj",
    pro: "Pro · €50/muaj",
    custom: "Custom Enterprise",
  };

  const initial = (firstName?.[0] || me?.email?.[0] || "U").toUpperCase();

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Profili & Cilësimet</h1>
        <p className="text-muted-foreground mt-1">Menaxhoni të dhënat tuaja personale, foton e profililt dhe fjalëkalimin.</p>
      </div>

      {/* Profile */}
      <Card className="border-white/10 glass rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Profili Im
          </CardTitle>
          <CardDescription>Përditësoni emrin, mbiemrin dhe foton e profililt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {/* Avatar section */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary/50" onError={() => setAvatarUrl("")} />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center font-serif text-2xl font-bold text-primary">
                      {initial}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full shadow-lg">
                    <Camera className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Foto Profililt (URL)</Label>
                  <Input
                    placeholder="https://... (URL e fotos juaj)"
                    className="rounded-xl border-white/10 bg-black/20 text-xs"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Emri</Label>
                  <Input className="rounded-xl border-white/10 bg-black/20" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Emri juaj" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Mbiemri</Label>
                  <Input className="rounded-xl border-white/10 bg-black/20" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mbiemri juaj" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input value={me?.email || ""} disabled className="rounded-xl border-white/10 bg-muted/20 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Email-i është i lidhur me llogarinë tuaj autentikuese.</p>
              </div>

              <Button onClick={handleSave} disabled={updateProfile.isPending} className="bg-primary hover:bg-primary/90 text-white rounded-xl uppercase tracking-widest text-xs px-6">
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ruaj Ndryshimet
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security & Password */}
      <Card className="border-white/10 glass rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2 text-xl">
            <KeyRound className="h-5 w-5 text-primary" />
            Siguria & Fjalëkalimi
          </CardTitle>
          <CardDescription>Ndryshoni fjalëkalimin tuaj përmes menaxherit të sigurisë.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fjalëkalimi dhe siguria e llogarisë tuaj mbrohen me enkriptim të nivelit të lartë. Mund të ndryshoni fjalëkalimin ose të aktivizoni autentikimin dy-faktorësh.
          </p>
          <Button onClick={() => openUserProfile?.()} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 text-xs uppercase tracking-widest">
            <ShieldCheck className="mr-2 h-4 w-4 text-primary" /> Ndrysho Fjalëkalimin
          </Button>
        </CardContent>
      </Card>

      {/* Subscription info */}
      <Card className="border-white/10 glass rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-primary" /> Abonimi Im
          </CardTitle>
          <CardDescription>Statusi i planit tuaj të abonimit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
              <div>
                <p className="font-medium text-foreground">{PLAN_LABELS[me?.subscriptionPlan || "basic"] || me?.subscriptionPlan}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{me?.subscriptionPlan} plan akti</p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl border-white/10 text-xs uppercase tracking-widest">
                <Link href="/subscription">Menaxho Planin</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
