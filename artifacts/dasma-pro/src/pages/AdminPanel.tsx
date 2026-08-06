import { useState } from "react";
import {
  useAdminGetStats,
  useAdminListUsers,
  useAdminUpdateUserSubscription,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users, CalendarDays, UserCheck, TrendingUp, ChevronLeft, ChevronRight,
  ShieldCheck, Crown, Gem, CreditCard, Receipt, CheckCircle2, XCircle,
  RefreshCcw, AlertCircle, Trash2, UserX, UserCheck2, CalendarRange,
  DollarSign, Activity,
} from "lucide-react";
import { format } from "date-fns";

// ─── types ───────────────────────────────────────────────────────────────────

interface AdminSubscription {
  id: string; userId: string; plan: string; status: string;
  paddleCustomerId: string | null; paddleSubscriptionId: string | null;
  startDate: string | null; nextBillingDate: string | null; createdAt: string;
  userEmail: string | null; userFirstName: string | null; userLastName: string | null;
}

interface AdminPayment {
  id: string; userId: string; paddleTransactionId: string; amount: number;
  amountFormatted: string; currency: string; status: string; createdAt: string;
  userEmail: string | null; userFirstName: string | null; userLastName: string | null;
}

interface AdminEvent {
  id: number; name: string; date: string | null; venue: string | null;
  status: string; createdAt: string | null; userId: string; guestCount: number;
  userEmail: string | null; userFirstName: string | null; userLastName: string | null;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(r: { userFirstName?: string | null; userLastName?: string | null; userEmail?: string | null }) {
  return [r.userFirstName, r.userLastName].filter(Boolean).join(" ") || r.userEmail || "—";
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    basic:  { cls: "bg-blue-100 text-blue-700 border-blue-200",   icon: <Crown className="h-3 w-3" /> },
    pro:    { cls: "bg-rose-100 text-rose-700 border-rose-200",   icon: <Gem   className="h-3 w-3" /> },
    custom: { cls: "bg-purple-100 text-purple-700 border-purple-200", icon: <ShieldCheck className="h-3 w-3" /> },
  };
  const { cls, icon } = map[plan] ?? { cls: "bg-gray-100 text-gray-600 border-gray-200", icon: null };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>{icon}{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>;
}

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active:    { cls: "bg-green-100 text-green-700 border-green-200", label: "Aktiv" },
    trialing:  { cls: "bg-blue-100 text-blue-700 border-blue-200",    label: "Trial" },
    past_due:  { cls: "bg-amber-100 text-amber-700 border-amber-200", label: "Vonuar" },
    canceled:  { cls: "bg-gray-100 text-gray-600 border-gray-200",    label: "Anuluar" },
    paused:    { cls: "bg-slate-100 text-slate-600 border-slate-200", label: "Pezulluar" },
    pending_payment: { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Në pritje" },
  };
  const { cls, label } = map[status] ?? { cls: "bg-gray-100 text-gray-600 border-gray-200", label: status };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

function UserStatusBadge({ status }: { status: string }) {
  return status === "active"
    ? <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 text-xs font-semibold"><CheckCircle2 className="h-3 w-3" />Aktiv</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 text-xs font-semibold"><AlertCircle className="h-3 w-3" />Në pritje</span>;
}

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "completed") return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 text-xs font-semibold"><CheckCircle2 className="h-3 w-3" />E kryer</span>;
  if (status === "failed")    return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 text-xs font-semibold"><XCircle className="h-3 w-3" />Dështuar</span>;
  return                             <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 text-xs font-semibold"><RefreshCcw className="h-3 w-3" />Rimbursuar</span>;
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
      <span className="text-sm text-gray-400">Faqja {page} nga {totalPages}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className="border-gray-200 text-gray-600 hover:bg-gray-50"><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="border-gray-200 text-gray-600 hover:bg-gray-50"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ─── Stats cards ─────────────────────────────────────────────────────────────

function StatsCards() {
  const { data: stats, isLoading } = useAdminGetStats();
  const s = stats as any;

  const cards = [
    { title: "Përdorues Total", value: s?.totalUsers,           sub: `${s?.activeUsers ?? 0} aktiv`, icon: <Users        className="h-5 w-5 text-rose-800" /> },
    { title: "Evente",          value: s?.totalEvents,           sub: "totale në sistem",             icon: <CalendarDays className="h-5 w-5 text-rose-800" /> },
    { title: "Abonime Active",  value: s?.activeSubscriptions,   sub: "Paddle abonime",               icon: <Activity     className="h-5 w-5 text-rose-800" /> },
    { title: "Të Ardhura/Muaj", value: s?.monthlyRevenue != null ? `€${(s.monthlyRevenue / 100).toFixed(2)}` : undefined, sub: `Total: €${((s?.totalRevenue ?? 0) / 100).toFixed(2)}`, icon: <DollarSign className="h-5 w-5 text-rose-800" /> },
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
            {isLoading ? <Skeleton className="h-8 w-20 mb-1" /> : <p className="text-3xl font-bold text-gray-900">{c.value ?? "—"}</p>}
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Plan distribution + Recent payments ─────────────────────────────────────

function PlanDistribution() {
  const { data: stats, isLoading } = useAdminGetStats();
  if (isLoading) return <Skeleton className="h-24 w-full rounded-xl" />;
  const byPlan = stats?.usersByPlan;
  const total = (byPlan?.basic ?? 0) + (byPlan?.pro ?? 0) + (byPlan?.custom ?? 0) || 1;
  const segments = [
    { key: "basic", label: "Basic", count: byPlan?.basic ?? 0, bg: "bg-blue-400" },
    { key: "pro",   label: "Pro",   count: byPlan?.pro   ?? 0, bg: "bg-rose-700" },
    { key: "custom",label: "Custom",count: byPlan?.custom ?? 0, bg: "bg-purple-500" },
  ];
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-gray-700">Shpërndarja e Planeve</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 gap-0.5">
          {segments.map(s => <div key={s.key} className={`${s.bg} transition-all`} style={{ width: `${(s.count / total) * 100}%` }} />)}
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

function RecentPayments() {
  const { data: stats } = useAdminGetStats();
  const recent = (stats as any)?.recentPayments as Array<{ id: string; amountFormatted: string; status: string; createdAt: string; userEmail: string | null }> | undefined;
  if (!recent?.length) return null;
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-100"><CardTitle className="text-sm font-semibold text-gray-700">Pagesat e Fundit</CardTitle></CardHeader>
      <CardContent className="p-0">
        <table className="w-full">
          <tbody>
            {recent.map(p => (
              <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 text-sm text-gray-600 truncate max-w-[200px]">{p.userEmail ?? "—"}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{p.amountFormatted}</td>
                <td className="px-4 py-3"><PaymentStatusBadge status={p.status} /></td>
                <td className="px-6 py-3 text-xs text-gray-400 text-right">{format(new Date(p.createdAt), "dd MMM, HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ─── Users table ──────────────────────────────────────────────────────────────

function UsersTable() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const qc = useQueryClient();
  const { data, isLoading, refetch } = useAdminListUsers({ page, limit });
  const mutation = useAdminUpdateUserSubscription();
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  async function toggleStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "pending_payment" : "active";
    await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
    refetch();
  }

  async function deleteUser(userId: string) {
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE", credentials: "include" });
    qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    refetch();
  }

  function handlePlanChange(userId: string, plan: string) {
    mutation.mutate(
      { userId, data: { plan: plan as import("@workspace/api-client-react").SubscriptionUpdatePlan } },
      { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); qc.invalidateQueries({ queryKey: ["/api/admin/stats"] }); } },
    );
  }

  const th = "text-xs font-semibold text-gray-500 uppercase tracking-wider";

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
                <TableHead className={`pl-6 ${th}`}>Emri</TableHead>
                <TableHead className={th}>Email</TableHead>
                <TableHead className={th}>Roli</TableHead>
                <TableHead className={th}>Statusi</TableHead>
                <TableHead className={th}>Plan</TableHead>
                <TableHead className={`${th} text-center`}>Evente</TableHead>
                <TableHead className={th}>Regjistruar</TableHead>
                <TableHead className={th}>Plan</TableHead>
                <TableHead className={`pr-6 ${th}`}>Veprime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j} className={j === 0 ? "pl-6" : j === 8 ? "pr-6" : ""}><Skeleton className="h-4 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
                : (data?.users ?? []).map(u => {
                  const userStatus = (u as any).status ?? "active";
                  return (
                    <TableRow key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <TableCell className="pl-6 font-medium text-gray-800">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-rose-700">{(u.firstName?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}</span>
                          </div>
                          <span className="truncate max-w-[120px]">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm truncate max-w-[160px]">{u.email}</TableCell>
                      <TableCell>
                        {u.role === "admin"
                          ? <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100 text-xs">Admin</Badge>
                          : <span className="text-xs text-gray-400">User</span>}
                      </TableCell>
                      <TableCell><UserStatusBadge status={userStatus} /></TableCell>
                      <TableCell><PlanBadge plan={u.subscriptionPlan} /></TableCell>
                      <TableCell className="text-center font-mono text-sm text-gray-600">{u.eventCount}</TableCell>
                      <TableCell className="text-sm text-gray-400">{u.createdAt ? format(new Date(u.createdAt), "dd MMM yyyy") : "—"}</TableCell>
                      <TableCell>
                        <Select defaultValue={u.subscriptionPlan} onValueChange={v => handlePlanChange(u.id, v)} disabled={mutation.isPending}>
                          <SelectTrigger className="h-8 w-24 text-xs bg-white border-gray-200"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center gap-1">
                          {/* Activate / Deactivate */}
                          <Button
                            variant="ghost" size="sm"
                            className={`h-8 w-8 p-0 ${userStatus === "active" ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}`}
                            title={userStatus === "active" ? "Çaktivizo" : "Aktivizo"}
                            onClick={() => toggleStatus(u.id, userStatus)}
                          >
                            {userStatus === "active" ? <UserX className="h-4 w-4" /> : <UserCheck2 className="h-4 w-4" />}
                          </Button>
                          {/* Delete */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" title="Fshi">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Fshi përdoruesin?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Kjo do të fshijë <strong>{u.email}</strong> dhe të gjitha të dhënat e tij (evente, mysafirë). Nuk mund të kthehet.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anulo</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteUser(u.id)} className="bg-red-600 hover:bg-red-700">Po, fshi</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </CardContent>
    </Card>
  );
}

// ─── Events table ─────────────────────────────────────────────────────────────

function EventsTable() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const { data, isLoading } = useQuery<{ events: AdminEvent[]; total: number; page: number; limit: number }>({
    queryKey: ["/api/admin/events", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/events?page=${page}&limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 30_000,
  });
  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const statusColor: Record<string, string> = {
    active:    "bg-green-100 text-green-700 border-green-200",
    draft:     "bg-gray-100 text-gray-600 border-gray-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-red-100 text-red-600 border-red-200",
  };
  const th = "text-xs font-semibold text-gray-500 uppercase tracking-wider";

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700">Të gjitha Eventet</CardTitle>
        {data && <span className="text-sm text-gray-400">{data.total} gjithsej</span>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
                <TableHead className={`pl-6 ${th}`}>Emri</TableHead>
                <TableHead className={th}>Organizuesi</TableHead>
                <TableHead className={th}>Data</TableHead>
                <TableHead className={th}>Vendi</TableHead>
                <TableHead className={`${th} text-center`}>Mysafirë</TableHead>
                <TableHead className={th}>Statusi</TableHead>
                <TableHead className={`pr-6 ${th}`}>Krijuar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => <TableCell key={j} className={j === 0 ? "pl-6" : j === 6 ? "pr-6" : ""}><Skeleton className="h-4 w-24" /></TableCell>)}
                  </TableRow>
                ))
                : data?.events.map(ev => (
                  <TableRow key={ev.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <TableCell className="pl-6 font-medium text-gray-800 max-w-[180px] truncate">{ev.name}</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-[160px] truncate">{fmt(ev)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{ev.date ? format(new Date(ev.date), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-[140px] truncate">{ev.venue ?? "—"}</TableCell>
                    <TableCell className="text-center font-mono text-sm text-gray-600">{ev.guestCount}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColor[ev.status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-sm text-gray-400">{ev.createdAt ? format(new Date(ev.createdAt), "dd MMM yyyy") : "—"}</TableCell>
                  </TableRow>
                ))}
              {!isLoading && !data?.events.length && (
                <TableRow><TableCell colSpan={7} className="pl-6 py-8 text-center text-gray-400 text-sm">Nuk ka evente akoma.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </CardContent>
    </Card>
  );
}

// ─── Subscriptions table ──────────────────────────────────────────────────────

function SubscriptionsTable() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const { data, isLoading } = useQuery<{ subscriptions: AdminSubscription[]; total: number }>({
    queryKey: ["/api/admin/subscriptions", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/subscriptions?page=${page}&limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 30_000,
  });
  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const th = "text-xs font-semibold text-gray-500 uppercase tracking-wider";

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700">Abonimet</CardTitle>
        {data && <span className="text-sm text-gray-400">{data.total} gjithsej</span>}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-100">
                {["Përdoruesi", "Plan", "Statusi", "Paddle Customer ID", "Paddle Sub ID", "Fillimi", "Fatura tjetër"].map(h => (
                  <TableHead key={h} className={`${th} first:pl-6 last:pr-6`}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((_, j) => <TableCell key={j} className={j === 0 ? "pl-6" : j === 6 ? "pr-6" : ""}><Skeleton className="h-4 w-24" /></TableCell>)}
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
              {!isLoading && !data?.subscriptions.length && (
                <TableRow><TableCell colSpan={7} className="pl-6 py-8 text-center text-gray-400 text-sm">Nuk ka aboname akoma.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </CardContent>
    </Card>
  );
}

// ─── Payments table ───────────────────────────────────────────────────────────

function PaymentsTable() {
  const [page, setPage] = useState(1);
  const limit = 15;
  const { data, isLoading } = useQuery<{ payments: AdminPayment[]; total: number; totalRevenue: number }>({
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
  const th = "text-xs font-semibold text-gray-500 uppercase tracking-wider";

  return (
    <div className="space-y-4">
      {data && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm"><CardContent className="pt-4"><p className="text-xs text-gray-400 uppercase tracking-wider">Të ardhura totale</p><p className="text-2xl font-bold text-gray-900 mt-1">€{(data.totalRevenue / 100).toFixed(2)}</p></CardContent></Card>
          <Card className="bg-white border border-gray-200 shadow-sm"><CardContent className="pt-4"><p className="text-xs text-gray-400 uppercase tracking-wider">Transaksione</p><p className="text-2xl font-bold text-gray-900 mt-1">{data.total}</p></CardContent></Card>
          <Card className={`border shadow-sm ${failed > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}><CardContent className="pt-4"><p className={`text-xs uppercase tracking-wider ${failed > 0 ? "text-red-500" : "text-gray-400"}`}>Pagesa dështuara</p><div className="flex items-center gap-2 mt-1"><p className={`text-2xl font-bold ${failed > 0 ? "text-red-700" : "text-gray-900"}`}>{failed}</p>{failed > 0 && <AlertCircle className="h-5 w-5 text-red-500" />}</div></CardContent></Card>
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
                    <TableHead key={h} className={`${th} first:pl-6 last:pr-6`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-gray-50">
                      {Array.from({ length: 6 }).map((_, j) => <TableCell key={j} className={j === 0 ? "pl-6" : j === 5 ? "pr-6" : ""}><Skeleton className="h-4 w-24" /></TableCell>)}
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
                {!isLoading && !data?.payments.length && (
                  <TableRow><TableCell colSpan={6} className="pl-6 py-8 text-center text-gray-400 text-sm">Nuk ka transaksione akoma.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><PlanDistribution /></div>
        <div><RecentPayments /></div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="users"         className="data-[state=active]:bg-rose-800 data-[state=active]:text-white text-gray-600 gap-1.5"><Users         className="h-4 w-4" /> Përdoruesit</TabsTrigger>
          <TabsTrigger value="events"        className="data-[state=active]:bg-rose-800 data-[state=active]:text-white text-gray-600 gap-1.5"><CalendarRange  className="h-4 w-4" /> Eventet</TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-rose-800 data-[state=active]:text-white text-gray-600 gap-1.5"><CreditCard     className="h-4 w-4" /> Abonimet</TabsTrigger>
          <TabsTrigger value="payments"      className="data-[state=active]:bg-rose-800 data-[state=active]:text-white text-gray-600 gap-1.5"><Receipt        className="h-4 w-4" /> Pagesat</TabsTrigger>
        </TabsList>
        <TabsContent value="users"         className="mt-4"><UsersTable /></TabsContent>
        <TabsContent value="events"        className="mt-4"><EventsTable /></TabsContent>
        <TabsContent value="subscriptions" className="mt-4"><SubscriptionsTable /></TabsContent>
        <TabsContent value="payments"      className="mt-4"><PaymentsTable /></TabsContent>
      </Tabs>
    </div>
  );
}
