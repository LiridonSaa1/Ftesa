import { useState } from "react";
import {
  useAdminGetStats,
  useAdminListUsers,
  useAdminUpdateUserSubscription,
} from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  CreditCard,
  Receipt,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

// ─── types (inline — no codegen needed for admin-only endpoints) ─────────────

interface AdminSubscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  paddleCustomerId: string | null;
  paddleSubscriptionId: string | null;
  startDate: string | null;
  nextBillingDate: string | null;
  createdAt: string;
  userEmail: string | null;
  userFirstName: string | null;
  userLastName: string | null;
}

interface AdminPayment {
  id: string;
  userId: string;
  paddleTransactionId: string;
  amount: number;
  amountFormatted: string;
  currency: string;
  status: string;
  createdAt: string;
  userEmail: string | null;
  userFirstName: string | null;
  userLastName: string | null;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = { basic: "Basic", pro: "Pro", custom: "Custom" };

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    basic:  "bg-blue-100 text-blue-700 border-blue-200",
    pro:    "bg-rose-100 text-rose-700 border-rose-200",
    custom: "bg-purple-100 text-purple-700 border-purple-200",
  };
  const icons: Record<string, React.ReactNode> = {
    basic:  <Crown className="h-3 w-3" />,
    pro:    <Gem   className="h-3 w-3" />,
    custom: <ShieldCheck className="h-3 w-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${colors[plan] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {icons[plan]}
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active:    { cls: "bg-green-100 text-green-700 border-green-200",  label: "Aktiv" },
    trialing:  { cls: "bg-blue-100 text-blue-700 border-blue-200",     label: "Trial" },
    past_due:  { cls: "bg-amber-100 text-amber-700 border-amber-200",  label: "Vonuar" },
    canceled:  { cls: "bg-gray-100 text-gray-600 border-gray-200",     label: "Anuluar" },
    paused:    { cls: "bg-slate-100 text-slate-600 border-slate-200",  label: "Pezulluar" },
  };
  const { cls, label } = map[status] ?? { cls: "bg-gray-100 text-gray-600 border-gray-200", label: status };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "completed") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 text-xs font-semibold">
      <CheckCircle2 className="h-3 w-3" /> E kryer
    </span>
  );
  if (status === "failed") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 text-xs font-semibold">
      <XCircle className="h-3 w-3" /> Dështuar
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 text-xs font-semibold">
      <RefreshCcw className="h-3 w-3" /> Rimbursuar
    </span>
  );
}

function fmt(name: { userFirstName?: string | null; userLastName?: string | null; userEmail?: string | null }) {
  const full = [name.userFirstName, name.userLastName].filter(Boolean).join(" ");
  return full || name.userEmail || "—";
}

// ─── Stats cards ─────────────────────────────────────────────────────────────

function StatsCards() {
  const { data: stats, isLoading } = useAdminGetStats();
  const { data: paymentsData } = useQuery<{ totalRevenue: number }>({
    queryKey: ["/api/admin/payments", "revenue"],
    queryFn: async () => {
      const res = await fetch("/api/admin/payments?limit=1", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60_000,
  });

  const realRevenue = paymentsData?.totalRevenue != null
    ? `€${(paymentsData.totalRevenue / 100).toFixed(2)}`
    : stats?.revenueEstimate != null ? `€${stats.revenueEstimate}` : undefined;

  const cards = [
    { title: "Përdorues",        value: stats?.totalUsers,  icon: <Users         className="h-5 w-5 text-rose-800" />, sub: "të regjistruar" },
    { title: "Evente",           value: stats?.totalEvents, icon: <CalendarDays  className="h-5 w-5 text-rose-800" />, sub: "totale" },
    { title: "Mysafirë",         value: stats?.totalGuests, icon: <UserCheck     className="h-5 w-5 text-rose-800" />, sub: "totale" },
    { title: "Të Ardhura Reale", value: realRevenue,        icon: <TrendingUp    className="h-5 w-5 text-rose-800" />, sub: "nga pagesat" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <Card key={i} className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{c.title}</CardTitle>
            <div className="rounded-lg bg-rose-50 p-2">{c.icon}</div>
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className="h-8 w-20 mb-1" />
              : <p className="text-3xl font-bold text-gray-900">{c.value ?? "—"}</p>}
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Plan distribution ────────────────────────────────────────────────────────

function PlanDistribution() {
  const { data: stats, isLoading } = useAdminGetStats();
  if (isLoading) return <Skeleton className="h-24 w-full rounded-xl" />;
  const byPlan = stats?.usersByPlan;
  const total = (byPlan?.basic ?? 0) + (byPlan?.pro ?? 0) + (byPlan?.custom ?? 0) || 1;
  const segments = [
    { key: "basic",  label: "Basic",  count: byPlan?.basic  ?? 0, bg: "bg-blue-400" },
    { key: "pro",    label: "Pro",    count: byPlan?.pro    ?? 0, bg: "bg-rose-700" },
    { key: "custom", label: "Custom", count: byPlan?.custom ?? 0, bg: "bg-purple-500" },
  ];
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700">Shpërndarja e Planeve</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 gap-0.5">
          {segments.map(s => (
            <div key={s.key} className={`${s.bg} transition-all`} style={{ width: `${(s.count / total) * 100}%` }} />
          ))}
        </div>
        <div className="flex gap-6">
          {segments.map(s => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${s.bg}`} />
              <span className="text-sm text-gray-500">{s.label} <span className="font-semibold text-gray-800">{s.count}</span></span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Users table ──────────────────────────────────────────────────────────────

function UsersTable() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const qc = useQueryClient();
  const { data, isLoading } = useAdminListUsers({ page, limit });
  const mutation = useAdminUpdateUserSubscription();
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  function handlePlanChange(userId: string, plan: string) {
    mutation.mutate(
      { userId, data: { plan: plan as import("@workspace/api-client-react").SubscriptionUpdatePlan } },
      { onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
        qc.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      }},
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700">Përdoruesit</CardTitle>
        {data && <span className="text-sm text-gray-400">{data.total} gjithsej</span>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
                <TableHead className="pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Emri</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Roli</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statusi</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Evente</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Regjistruar</TableHead>
                <TableHead className="pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ndrysho Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j} className={j === 0 ? "pl-6" : j === 7 ? "pr-6" : ""}>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
                : data?.users.map(u => (
                  <TableRow key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <TableCell className="pl-6 font-medium text-gray-800">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-rose-700">
                            {(u.firstName?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                          </span>
                        </div>
                        <span className="truncate max-w-[120px]">
                          {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm truncate max-w-[160px]">{u.email}</TableCell>
                    <TableCell>
                      {u.role === "admin"
                        ? <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100 text-xs">Admin</Badge>
                        : <span className="text-xs text-gray-400">User</span>}
                    </TableCell>
                    <TableCell>
                      <SubStatusBadge status={(u as any).status ?? "active"} />
                    </TableCell>
                    <TableCell><PlanBadge plan={u.subscriptionPlan} /></TableCell>
                    <TableCell className="text-center font-mono text-sm text-gray-600">{u.eventCount}</TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {u.createdAt ? format(new Date(u.createdAt), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell className="pr-6">
                      <Select defaultValue={u.subscriptionPlan} onValueChange={v => handlePlanChange(u.id, v)} disabled={mutation.isPending}>
                        <SelectTrigger className="h-8 w-28 text-xs bg-white border-gray-200">
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
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-400">Faqja {page} nga {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="border-gray-200 text-gray-600 hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="border-gray-200 text-gray-600 hover:bg-gray-50">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Subscriptions table ──────────────────────────────────────────────────────

function SubscriptionsTable() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const { data, isLoading } = useQuery<{ subscriptions: AdminSubscription[]; total: number; page: number; limit: number }>({
    queryKey: ["/api/admin/subscriptions", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/subscriptions?page=${page}&limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 30_000,
  });
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700">Abonimet Active</CardTitle>
        {data && <span className="text-sm text-gray-400">{data.total} gjithsej</span>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
                {["Përdoruesi", "Plan", "Statusi", "Paddle Customer ID", "Paddle Sub ID", "Fillimi", "Fatura tjetër"].map(h => (
                  <TableHead key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wider first:pl-6 last:pr-6">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j} className={j === 0 ? "pl-6" : j === 6 ? "pr-6" : ""}>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
                : data?.subscriptions.map(s => (
                  <TableRow key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <TableCell className="pl-6 text-sm font-medium text-gray-800">{fmt(s)}</TableCell>
                    <TableCell><PlanBadge plan={s.plan} /></TableCell>
                    <TableCell><SubStatusBadge status={s.status} /></TableCell>
                    <TableCell className="font-mono text-xs text-gray-500 max-w-[140px] truncate">{s.paddleCustomerId ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-500 max-w-[140px] truncate">{s.paddleSubscriptionId ?? "—"}</TableCell>
                    <TableCell className="text-sm text-gray-400">{s.startDate ? format(new Date(s.startDate), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell className="pr-6 text-sm text-gray-400">{s.nextBillingDate ? format(new Date(s.nextBillingDate), "dd MMM yyyy") : "—"}</TableCell>
                  </TableRow>
                ))}
              {!isLoading && data?.subscriptions.length === 0 && (
                <TableRow><TableCell colSpan={7} className="pl-6 py-8 text-center text-gray-400 text-sm">Nuk ka aboname akoma.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-400">Faqja {page} nga {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Payments table ───────────────────────────────────────────────────────────

function PaymentsTable() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const { data, isLoading } = useQuery<{ payments: AdminPayment[]; total: number; totalRevenue: number; page: number; limit: number }>({
    queryKey: ["/api/admin/payments", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/payments?page=${page}&limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 30_000,
  });
  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const failed = data?.payments.filter(p => p.status === "failed").length ?? 0;

  return (
    <div className="space-y-4">
      {/* Revenue summary */}
      {data && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Të ardhura totale</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">€{(data.totalRevenue / 100).toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Transaksione</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.total}</p>
            </CardContent>
          </Card>
          <Card className={`border shadow-sm ${failed > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
            <CardContent className="pt-4">
              <p className={`text-xs uppercase tracking-wider ${failed > 0 ? "text-red-500" : "text-gray-400"}`}>Pagesa dështuara</p>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-2xl font-bold ${failed > 0 ? "text-red-700" : "text-gray-900"}`}>{failed}</p>
                {failed > 0 && <AlertCircle className="h-5 w-5 text-red-500" />}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Transaksionet</CardTitle>
          {data && <span className="text-sm text-gray-400">{data.total} gjithsej</span>}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
                  {["Paddle Transaction ID", "Përdoruesi", "Shuma", "Valuta", "Statusi", "Data"].map(h => (
                    <TableHead key={h} className="text-xs font-semibold text-gray-500 uppercase tracking-wider first:pl-6 last:pr-6">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-gray-50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j} className={j === 0 ? "pl-6" : j === 5 ? "pr-6" : ""}>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                  : data?.payments.map(p => (
                    <TableRow key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${p.status === "failed" ? "bg-red-50/40" : ""}`}>
                      <TableCell className="pl-6 font-mono text-xs text-gray-500 max-w-[180px] truncate">{p.paddleTransactionId}</TableCell>
                      <TableCell className="text-sm text-gray-700">{fmt(p)}</TableCell>
                      <TableCell className="font-semibold text-gray-800">{p.amountFormatted}</TableCell>
                      <TableCell className="text-sm text-gray-500 uppercase">{p.currency}</TableCell>
                      <TableCell><PaymentStatusBadge status={p.status} /></TableCell>
                      <TableCell className="pr-6 text-sm text-gray-400">{format(new Date(p.createdAt), "dd MMM yyyy, HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                {!isLoading && data?.payments.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="pl-6 py-8 text-center text-gray-400 text-sm">Nuk ka transaksione akoma.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <span className="text-sm text-gray-400">Faqja {page} nga {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-50 -m-6 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <div className="rounded-lg bg-rose-800 p-2.5">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Menaxhimi i platformës NoaEvent</p>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Plan distribution */}
      <PlanDistribution />

      {/* Tabs: Users / Subscriptions / Payments */}
      <Tabs defaultValue="users">
        <TabsList className="bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="users" className="data-[state=active]:bg-rose-800 data-[state=active]:text-white text-gray-600 gap-1.5">
            <Users className="h-4 w-4" /> Përdoruesit
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-rose-800 data-[state=active]:text-white text-gray-600 gap-1.5">
            <CreditCard className="h-4 w-4" /> Abonimet
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-rose-800 data-[state=active]:text-white text-gray-600 gap-1.5">
            <Receipt className="h-4 w-4" /> Pagesat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <UsersTable />
        </TabsContent>
        <TabsContent value="subscriptions" className="mt-4">
          <SubscriptionsTable />
        </TabsContent>
        <TabsContent value="payments" className="mt-4">
          <PaymentsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
