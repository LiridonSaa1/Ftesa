import { useState } from "react";
import {
  useAdminGetStats,
  useAdminListUsers,
  useAdminUpdateUserSubscription,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  CalendarDays,
  UserCheck,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Crown,
  Gem,
} from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

// ─── helpers ────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  custom: "Custom",
};

const PLAN_COLORS: Record<string, string> = {
  basic: "bg-blue-100 text-blue-700 border-blue-200",
  pro:   "bg-primary/10 text-primary border-primary/20",
  custom:"bg-purple-100 text-purple-700 border-purple-200",
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  basic:  <Crown className="h-3 w-3" />,
  pro:    <Gem   className="h-3 w-3" />,
  custom: <ShieldCheck className="h-3 w-3" />,
};

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${PLAN_COLORS[plan] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {PLAN_ICONS[plan]}
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

// ─── Stats section ───────────────────────────────────────────────────────────

function StatsCards() {
  const { data: stats, isLoading } = useAdminGetStats();

  const cards = [
    {
      title: "Përdorues",
      value: stats?.totalUsers,
      icon: <Users className="h-5 w-5 text-primary" />,
      sub: "të regjistruar",
    },
    {
      title: "Evente",
      value: stats?.totalEvents,
      icon: <CalendarDays className="h-5 w-5 text-primary" />,
      sub: "totale në sistem",
    },
    {
      title: "Mysafirë",
      value: stats?.totalGuests,
      icon: <UserCheck className="h-5 w-5 text-primary" />,
      sub: "totale",
    },
    {
      title: "Të Ardhura (est.)",
      value: stats?.revenueEstimate != null ? `€${stats.revenueEstimate}` : undefined,
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      sub: "në muaj",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.title} className="border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
            <div className="rounded-xl bg-primary/10 p-2">{c.icon}</div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-serif text-foreground">
              {c.value ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Plan distribution bar ───────────────────────────────────────────────────

function PlanDistribution() {
  const { data: stats, isLoading } = useAdminGetStats();

  if (isLoading) return <Skeleton className="h-24 w-full rounded-2xl" />;

  const byPlan = stats?.usersByPlan;
  const total = (byPlan?.basic ?? 0) + (byPlan?.pro ?? 0) + (byPlan?.custom ?? 0) || 1;

  const segments = [
    { key: "basic",  label: "Basic",  count: byPlan?.basic  ?? 0, color: "bg-blue-400" },
    { key: "pro",    label: "Pro",    count: byPlan?.pro    ?? 0, color: "bg-primary"  },
    { key: "custom", label: "Custom", count: byPlan?.custom ?? 0, color: "bg-purple-500" },
  ];

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-base">Shpërndarja e Abonimeve</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* stacked bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {segments.map((s) => (
            <div
              key={s.key}
              className={`${s.color} transition-all`}
              style={{ width: `${(s.count / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex gap-6">
          {segments.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
              <span className="text-sm text-muted-foreground">
                {s.label} <span className="font-semibold text-foreground">{s.count}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Users table ─────────────────────────────────────────────────────────────

function UsersTable() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const qc = useQueryClient();

  const { data, isLoading } = useAdminListUsers({ page, limit });
  const mutation = useAdminUpdateUserSubscription();

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  function handlePlanChange(userId: string, plan: string) {
    mutation.mutate(
      { userId, data: { plan } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
          qc.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        },
      }
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif text-base">Përdoruesit</CardTitle>
        {data && (
          <span className="text-sm text-muted-foreground">
            {data.total} gjithsej
          </span>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="pl-6 font-medium">Emri</TableHead>
                <TableHead className="font-medium">Email</TableHead>
                <TableHead className="font-medium">Roli</TableHead>
                <TableHead className="font-medium">Abonimi</TableHead>
                <TableHead className="font-medium text-center">Evente</TableHead>
                <TableHead className="font-medium">Regjistruar</TableHead>
                <TableHead className="pr-6 font-medium">Ndrysho Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell className="pl-6"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="pr-6"><Skeleton className="h-8 w-28 rounded-lg" /></TableCell>
                    </TableRow>
                  ))
                : data?.users.map((u) => (
                    <TableRow key={u.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {(u.firstName?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                            </span>
                          </div>
                          <span className="truncate max-w-[140px]">
                            {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm truncate max-w-[180px]">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        {u.role === "admin" ? (
                          <Badge variant="destructive" className="text-xs">Admin</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">User</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <PlanBadge plan={u.subscriptionPlan} />
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {u.eventCount}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.createdAt ? format(new Date(u.createdAt), "dd MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell className="pr-6">
                        <Select
                          defaultValue={u.subscriptionPlan}
                          onValueChange={(val) => handlePlanChange(u.id, val)}
                          disabled={mutation.isPending}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
            <span className="text-sm text-muted-foreground">
              Faqja {page} nga {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AdminPanel() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Statistikat dhe menaxhimi i platformës Dasma Pro.
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Plan distribution */}
      <PlanDistribution />

      {/* Users table */}
      <UsersTable />
    </div>
  );
}
