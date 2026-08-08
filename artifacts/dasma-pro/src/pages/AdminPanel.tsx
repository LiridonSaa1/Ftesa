import { useState } from "react";
import {
  useAdminGetStats,
  useAdminListUsers,
  useAdminUpdateUserSubscription,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users, CalendarDays, UserCheck, TrendingUp, ChevronLeft, ChevronRight,
  ShieldCheck, Crown, Gem, CreditCard, Receipt, CheckCircle2, XCircle,
  RefreshCcw, AlertCircle, Trash2, UserX, UserCheck2, CalendarRange,
  DollarSign, Activity, Search, Plus, Mail, Settings as SettingsIcon,
  Tag, FileText, Send, Check, Eye, HelpCircle, Layers, BarChart3,
  MapPin, Phone, ExternalLink, Globe, Smartphone, Lock
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useLanguage, LanguageSelector } from "@/lib/i18n";

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface CustomRequest {
  id: string; userName: string; userEmail: string; phone: string;
  eventCount: string; guestEstimate: string; notes: string;
  status: "pending" | "approved" | "rejected"; createdAt: string;
}

interface TemplateItem {
  id: string; name: string; code: string; description: string;
  enabled: boolean; category: string;
}

interface CategoryItem {
  id: string; type: "event" | "guest"; name: string; code: string;
}

interface PlatformSettingsData {
  platformName: string; logoUrl: string; paddleEnvironment: string;
  paddleClientToken: string; googleMapsApiKey: string; emailSmtpHost: string;
  emailSmtpPort: string; emailFrom: string; whatsappEnabled: boolean;
  whatsappSenderNumber: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtUser(r: { userFirstName?: string | null; userLastName?: string | null; userEmail?: string | null }) {
  return [r.userFirstName, r.userLastName].filter(Boolean).join(" ") || r.userEmail || "—";
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    basic:  { cls: "bg-blue-50 text-blue-800 border-blue-200",   icon: <Crown className="h-3 w-3" /> },
    pro:    { cls: "bg-rose-50 text-[#7B1F3A] border-rose-200 font-semibold", icon: <Gem   className="h-3 w-3" /> },
    custom: { cls: "bg-purple-50 text-purple-800 border-purple-200", icon: <ShieldCheck className="h-3 w-3" /> },
  };
  const { cls, icon } = map[plan] ?? { cls: "bg-slate-100 text-slate-700 border-slate-200", icon: null };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-serif ${cls}`}>{icon}{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>;
}

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active:    { cls: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Aktiv" },
    trialing:  { cls: "bg-blue-50 text-blue-800 border-blue-200",    label: "Trial" },
    past_due:  { cls: "bg-amber-50 text-amber-800 border-amber-200", label: "Vonuar" },
    canceled:  { cls: "bg-slate-100 text-slate-600 border-slate-200", label: "Anuluar" },
    paused:    { cls: "bg-slate-100 text-slate-600 border-slate-200", label: "Pezulluar" },
    pending_payment: { cls: "bg-amber-50 text-amber-800 border-amber-200", label: "Në pritje" },
  };
  const { cls, label } = map[status] ?? { cls: "bg-slate-100 text-slate-600 border-slate-200", label: status };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function UserStatusBadge({ status }: { status: string }) {
  return status === "active"
    ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium"><CheckCircle2 className="h-3 w-3 text-emerald-600" />Aktiv</span>
    : <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-medium"><AlertCircle className="h-3 w-3 text-amber-600" />Në pritje</span>;
}

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "completed") return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium"><CheckCircle2 className="h-3 w-3 text-emerald-600" />E kryer</span>;
  if (status === "failed")    return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 text-xs font-medium"><XCircle className="h-3 w-3 text-rose-600" />Dështuar</span>;
  return                             <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-xs font-medium"><RefreshCcw className="h-3 w-3 text-blue-600" />Rimbursuar</span>;
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white">
      <span className="text-xs text-slate-500 font-serif">Faqja {page} nga {totalPages}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1} className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

// ─── Stats Cards ─────────────────────────────────────────────────────────────

function StatsCards() {
  const { data: stats, isLoading } = useAdminGetStats();
  const s = stats as any;

  const cards = [
    { title: "Përdorues Total", value: s?.totalUsers, sub: `${s?.activeUsers ?? 0} përdorues aktivë`, icon: <Users className="h-5 w-5 text-[#7B1F3A]" /> },
    { title: "Evente Totale", value: s?.totalEvents, sub: `${s?.totalGuests ?? 0} mysafirë në sistem`, icon: <CalendarDays className="h-5 w-5 text-[#7B1F3A]" /> },
    { title: "Abonime Aktive", value: s?.activeSubscriptions, sub: "Planet e aktivizuara", icon: <Activity className="h-5 w-5 text-[#7B1F3A]" /> },
    { title: "Të Ardhura / Muaj", value: s?.monthlyRevenue != null ? `€${(s.monthlyRevenue / 100).toFixed(2)}` : undefined, sub: `Totali: €${((s?.totalRevenue ?? 0) / 100).toFixed(2)}`, icon: <DollarSign className="h-5 w-5 text-[#7B1F3A]" /> },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <Card key={i} className="bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-slate-50/40 border-b border-slate-100/60">
            <CardTitle className="text-xs font-serif font-bold uppercase tracking-wider text-slate-600">{c.title}</CardTitle>
            <div className="rounded-xl bg-rose-50/80 p-2.5 border border-rose-100">{c.icon}</div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? <Skeleton className="h-8 w-20 mb-1" /> : <p className="text-3xl font-serif font-bold text-[#2d1a1f]">{c.value ?? "—"}</p>}
            <p className="text-xs text-slate-500 mt-1 font-serif">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Users Table ─────────────────────────────────────────────────────────────

function UsersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
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
      { userId, data: { plan: plan as any } },
      { onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); qc.invalidateQueries({ queryKey: ["/api/admin/stats"] }); } },
    );
  }

  const filteredUsers = (data?.users ?? []).filter(u => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "all" || u.subscriptionPlan === filterPlan;
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchPlan && matchRole;
  });

  const th = "text-xs font-serif font-bold text-slate-600 uppercase tracking-wider";

  return (
    <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/40">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <CardTitle className="text-lg font-serif font-bold text-[#2d1a1f]">Menaxhimi i Përdoruesve</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-serif">Shikoni, kërkoni dhe menaxhoni të gjithë përdoruesit e platformës NoaEvent.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Kërko me email ose emër..." className="pl-9 h-9 text-xs border-slate-200 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="h-9 text-xs w-28 border-slate-200 rounded-xl"><SelectValue placeholder="Plani" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Të gjitha planet</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="h-9 text-xs w-28 border-slate-200 rounded-xl"><SelectValue placeholder="Roli" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Të gjitha rolet</SelectItem>
                <SelectItem value="organizer">User (Organizer)</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-100">
                <TableHead className={`pl-6 ${th}`}>Përdoruesi</TableHead>
                <TableHead className={th}>Email</TableHead>
                <TableHead className={th}>Roli</TableHead>
                <TableHead className={th}>Statusi</TableHead>
                <TableHead className={th}>Plani</TableHead>
                <TableHead className={`${th} text-center`}>Eventet</TableHead>
                <TableHead className={th}>Regjistruar</TableHead>
                <TableHead className={th}>Ndrysho Planin</TableHead>
                <TableHead className={`pr-6 ${th}`}>Veprime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-50">
                    {Array.from({ length: 9 }).map((_, j) => <TableCell key={j} className={j === 0 ? "pl-6" : j === 8 ? "pr-6" : ""}><Skeleton className="h-4 w-20" /></TableCell>)}
                  </TableRow>
                ))
                : filteredUsers.map(u => {
                  const userStatus = (u as any).status ?? "active";
                  return (
                    <TableRow key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-6 font-serif font-semibold text-[#2d1a1f]">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-serif font-bold text-[#7B1F3A]">{(u.firstName?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}</span>
                          </div>
                          <span className="truncate max-w-[130px]">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs font-mono truncate max-w-[160px]">{u.email}</TableCell>
                      <TableCell>
                        {u.role === "admin"
                          ? <Badge className="bg-[#7B1F3A] text-white hover:bg-[#5e1729] text-[10px] font-serif uppercase tracking-wider px-2 py-0.5">Admin</Badge>
                          : <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200 font-serif uppercase tracking-wider">User</Badge>}
                      </TableCell>
                      <TableCell><UserStatusBadge status={userStatus} /></TableCell>
                      <TableCell><PlanBadge plan={u.subscriptionPlan} /></TableCell>
                      <TableCell className="text-center font-serif font-bold text-sm text-slate-800">{u.eventCount}</TableCell>
                      <TableCell className="text-xs text-slate-400 font-serif">{u.createdAt ? format(new Date(u.createdAt), "dd MMM yyyy") : "—"}</TableCell>
                      <TableCell>
                        <Select defaultValue={u.subscriptionPlan} onValueChange={v => handlePlanChange(u.id, v)} disabled={mutation.isPending}>
                          <SelectTrigger className="h-8 w-24 text-xs bg-white border-slate-200 rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost" size="sm"
                            className={`h-8 w-8 p-0 rounded-lg ${userStatus === "active" ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                            title={userStatus === "active" ? "Çaktivizo" : "Aktivizo"}
                            onClick={() => toggleStatus(u.id, userStatus)}
                          >
                            {userStatus === "active" ? <UserX className="h-4 w-4" /> : <UserCheck2 className="h-4 w-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:bg-rose-50" title="Fshi">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-2xl border-slate-200 bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-serif text-lg font-bold">Fshi përdoruesin?</AlertDialogTitle>
                                <AlertDialogDescription className="text-xs text-slate-500 font-serif">
                                  Kjo procedurë do të fshijë <strong>{u.email}</strong> dhe të gjitha eventet lidhur me këtë llogari.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl">Anulo</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteUser(u.id)} className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl">Po, fshi</AlertDialogAction>
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

// ─── Events Table ─────────────────────────────────────────────────────────────

function EventsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const limit = 15;
  const { data, isLoading } = useQuery<{ events: AdminEvent[]; total: number }>({
    queryKey: ["/api/admin/events", page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/events?page=${page}&limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 30_000,
  });
  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  const filteredEvents = (data?.events ?? []).filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || (e.userEmail && e.userEmail.toLowerCase().includes(search.toLowerCase()))
  );

  const statusColor: Record<string, string> = {
    active:    "bg-emerald-50 text-emerald-800 border-emerald-200",
    draft:     "bg-slate-100 text-slate-600 border-slate-200",
    completed: "bg-blue-50 text-blue-800 border-blue-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const th = "text-xs font-serif font-bold text-slate-600 uppercase tracking-wider";

  return (
    <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/40">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <CardTitle className="text-lg font-serif font-bold text-[#2d1a1f]">Eventet në Platformë</CardTitle>
            <CardDescription className="text-xs text-slate-500 font-serif">Monitoroni të gjitha eventet e krijuara nga organizatorët.</CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Kërko me emër eventi..." className="pl-9 h-9 text-xs border-slate-200 rounded-xl" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-100">
                <TableHead className={`pl-6 ${th}`}>Emri i Eventit</TableHead>
                <TableHead className={th}>Organizuesi</TableHead>
                <TableHead className={th}>Data</TableHead>
                <TableHead className={th}>Vendi</TableHead>
                <TableHead className={`${th} text-center`}>Mysafirë</TableHead>
                <TableHead className={th}>Statusi</TableHead>
                <TableHead className={`pr-6 ${th}`}>Detaje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-50">
                    {Array.from({ length: 7 }).map((_, j) => <TableCell key={j} className={j === 0 ? "pl-6" : j === 6 ? "pr-6" : ""}><Skeleton className="h-4 w-24" /></TableCell>)}
                  </TableRow>
                ))
                : filteredEvents.map(ev => (
                  <TableRow key={ev.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 font-serif font-semibold text-[#2d1a1f] max-w-[180px] truncate">{ev.name}</TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-[160px] truncate">{fmtUser(ev)}</TableCell>
                    <TableCell className="text-xs text-slate-500 font-serif">{ev.date ? format(new Date(ev.date), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-[140px] truncate">{ev.venue ?? "—"}</TableCell>
                    <TableCell className="text-center font-serif font-bold text-sm text-slate-800">{ev.guestCount}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-serif ${statusColor[ev.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(ev)} className="h-8 text-xs font-serif text-[#7B1F3A] hover:bg-rose-50 rounded-lg">
                        <Eye className="h-3.5 w-3.5 mr-1" /> Shiko
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />

        {/* Event Details Dialog */}
        <Dialog open={!!selectedEvent} onOpenChange={open => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-bold text-[#2d1a1f]">{selectedEvent?.name}</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4 py-2 text-xs text-slate-600 font-serif">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Organizatori</p>
                    <p className="font-semibold text-[#2d1a1f] text-sm mt-0.5">{fmtUser(selectedEvent)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statusi</p>
                    <p className="font-semibold text-[#2d1a1f] text-sm capitalize mt-0.5">{selectedEvent.status}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <p className="flex items-center gap-2 text-slate-700"><CalendarDays className="h-4 w-4 text-[#7B1F3A]" /> {selectedEvent.date ? format(new Date(selectedEvent.date), "dd MMMM yyyy") : "Me datë të pa caktuar"}</p>
                  <p className="flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4 text-[#7B1F3A]" /> {selectedEvent.venue || "Lokacioni i pa specifikuar"}</p>
                  <p className="flex items-center gap-2 text-slate-700"><Users className="h-4 w-4 text-[#7B1F3A]" /> {selectedEvent.guestCount} mysafirë të ftuar</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setSelectedEvent(null)} className="w-full bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl text-xs font-serif uppercase tracking-wider h-10">Mbyll</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ─── Subscriptions Table ──────────────────────────────────────────────────────

function SubscriptionsTable() {
  const [page, setPage] = useState(1);
  const [filterPlan, setFilterPlan] = useState("all");
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

  const filteredSubs = (data?.subscriptions ?? []).filter(s => filterPlan === "all" || s.plan === filterPlan);

  const th = "text-xs font-serif font-bold text-slate-600 uppercase tracking-wider";

  return (
    <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between bg-slate-50/40">
        <div>
          <CardTitle className="text-lg font-serif font-bold text-[#2d1a1f]">Menaxhimi i Abonimeve</CardTitle>
          <CardDescription className="text-xs text-slate-500 font-serif">Pasqyra e abonimeve aktive dhe historikut të tyre.</CardDescription>
        </div>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="h-9 text-xs w-32 border-slate-200 rounded-xl"><SelectValue placeholder="Filtro Planin" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-100">
                {["Përdoruesi", "Plan", "Statusi", "Paddle Customer ID", "Paddle Sub ID", "Fillimi", "Fatura tjetër"].map(h => (
                  <TableHead key={h} className={`${th} first:pl-6 last:pr-6`}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-50">
                    {Array.from({ length: 7 }).map((_, j) => <TableCell key={j} className={j === 0 ? "pl-6" : j === 6 ? "pr-6" : ""}><Skeleton className="h-4 w-24" /></TableCell>)}
                  </TableRow>
                ))
                : filteredSubs.map(s => (
                  <TableRow key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 text-sm font-serif font-semibold text-[#2d1a1f]">{fmtUser(s)}</TableCell>
                    <TableCell><PlanBadge plan={s.plan} /></TableCell>
                    <TableCell><SubStatusBadge status={s.status} /></TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 max-w-[140px] truncate">{s.paddleCustomerId ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 max-w-[140px] truncate">{s.paddleSubscriptionId ?? "—"}</TableCell>
                    <TableCell className="text-xs text-slate-400 font-serif">{s.startDate ? format(new Date(s.startDate), "dd MMM yyyy") : "—"}</TableCell>
                    <TableCell className="pr-6 text-xs text-slate-400 font-serif">{s.nextBillingDate ? format(new Date(s.nextBillingDate), "dd MMM yyyy") : "—"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </CardContent>
    </Card>
  );
}

// ─── Payments Table ───────────────────────────────────────────────────────────

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
  const th = "text-xs font-serif font-bold text-slate-600 uppercase tracking-wider";

  return (
    <div className="space-y-4">
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl"><CardContent className="pt-4"><p className="text-xs text-slate-500 font-serif uppercase tracking-wider">Të ardhura totale</p><p className="text-3xl font-serif font-bold text-[#2d1a1f] mt-1">€{(data.totalRevenue / 100).toFixed(2)}</p></CardContent></Card>
          <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl"><CardContent className="pt-4"><p className="text-xs text-slate-500 font-serif uppercase tracking-wider">Transaksione</p><p className="text-3xl font-serif font-bold text-[#2d1a1f] mt-1">{data.total}</p></CardContent></Card>
          <Card className={`border shadow-sm rounded-2xl ${failed > 0 ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200/80"}`}><CardContent className="pt-4"><p className={`text-xs uppercase font-serif tracking-wider ${failed > 0 ? "text-rose-700" : "text-slate-500"}`}>Pagesa dështuara</p><div className="flex items-center gap-2 mt-1"><p className={`text-3xl font-serif font-bold ${failed > 0 ? "text-rose-800" : "text-[#2d1a1f]"}`}>{failed}</p>{failed > 0 && <AlertCircle className="h-5 w-5 text-rose-600" />}</div></CardContent></Card>
        </div>
      )}
      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/40">
          <CardTitle className="text-lg font-serif font-bold text-[#2d1a1f]">Historia e Transaksioneve Paddle</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-100">
                  {["Paddle Transaction ID", "Përdoruesi", "Shuma", "Valuta", "Statusi", "Data"].map(h => (
                    <TableHead key={h} className={`${th} first:pl-6 last:pr-6`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-slate-50">
                      {Array.from({ length: 6 }).map((_, j) => <TableCell key={j} className={j === 0 ? "pl-6" : j === 5 ? "pr-6" : ""}><Skeleton className="h-4 w-24" /></TableCell>)}
                    </TableRow>
                  ))
                  : data?.payments.map(p => (
                    <TableRow key={p.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${p.status === "failed" ? "bg-rose-50/30" : ""}`}>
                      <TableCell className="pl-6 font-mono text-xs text-slate-500 max-w-[180px] truncate">{p.paddleTransactionId}</TableCell>
                      <TableCell className="text-sm font-serif font-semibold text-[#2d1a1f]">{fmtUser(p)}</TableCell>
                      <TableCell className="font-serif font-bold text-slate-900">{p.amountFormatted}</TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono uppercase">{p.currency}</TableCell>
                      <TableCell><PaymentStatusBadge status={p.status} /></TableCell>
                      <TableCell className="pr-6 text-xs text-slate-400 font-serif">{format(new Date(p.createdAt), "dd MMM yyyy, HH:mm")}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────

function TemplatesTab() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "", category: "Dasmë" });

  const { data: templates = [], isLoading } = useQuery<TemplateItem[]>({
    queryKey: ["/api/admin/templates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/templates", { credentials: "include" });
      return res.json();
    },
  });

  const toggleTemplate = async (id: string, enabled: boolean) => {
    await fetch(`/api/admin/templates/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    qc.invalidateQueries({ queryKey: ["/api/admin/templates"] });
    toast({ title: "Template u përditësua!" });
  };

  const handleCreate = async () => {
    await fetch("/api/admin/templates", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    qc.invalidateQueries({ queryKey: ["/api/admin/templates"] });
    setCreateOpen(false);
    setForm({ name: "", code: "", description: "", category: "Dasmë" });
    toast({ title: "Template u krijua me sukses!" });
  };

  return (
    <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between bg-slate-50/40">
        <div>
          <CardTitle className="text-lg font-serif font-bold text-[#2d1a1f]">Template-et e Ftesave Digjitale</CardTitle>
          <CardDescription className="text-xs text-slate-500 font-serif">Menaxhoni dizajnet e ftesave të disponueshme për përdoruesit.</CardDescription>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white text-xs font-serif uppercase tracking-wider rounded-xl"><Plus className="h-4 w-4 mr-1" /> Krijoni Template</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl bg-white border-slate-200">
            <DialogHeader><DialogTitle className="font-serif font-bold text-lg">Template i ri</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2 text-xs font-serif">
              <div className="space-y-1"><Label>Emri</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dizajn Elegance" className="rounded-xl border-slate-200" /></div>
              <div className="space-y-1"><Label>Kodi identifikues</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="elegance_gold" className="rounded-xl border-slate-200" /></div>
              <div className="space-y-1"><Label>Kategoria</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Dasmë" className="rounded-xl border-slate-200" /></div>
              <div className="space-y-1"><Label>Përshkrimi</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Përshkrim i shkurtër..." className="rounded-xl border-slate-200" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">Anulo</Button>
              <Button onClick={handleCreate} disabled={!form.name} className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl">Shto Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? <Skeleton className="h-40 w-full" /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map(t => (
              <div key={t.id} className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between bg-white hover:border-[#7B1F3A]/30 shadow-sm transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif font-bold text-[#2d1a1f] text-base">{t.name}</h3>
                    <Badge variant={t.enabled ? "default" : "secondary"} className={t.enabled ? "bg-emerald-100 text-emerald-800 font-serif hover:bg-emerald-100" : ""}>{t.enabled ? "Aktiv" : "Jo aktiv"}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-serif mb-3 leading-relaxed">{t.description}</p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">Kategoria: {t.category} · Code: {t.code}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => toggleTemplate(t.id, t.enabled)} className="text-xs font-serif h-8 rounded-xl border-slate-200">
                    {t.enabled ? "Çaktivizo" : "Aktivizo"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<"event" | "guest">("event");

  const { data: categories = [], isLoading } = useQuery<CategoryItem[]>({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories", { credentials: "include" });
      return res.json();
    },
  });

  const handleAdd = async () => {
    if (!name.trim()) return;
    await fetch("/api/admin/categories", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, name, code: name.toLowerCase().replace(/\s+/g, "_") }),
    });
    qc.invalidateQueries({ queryKey: ["/api/admin/categories"] });
    setName("");
    toast({ title: "Kategoria u shtua!" });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE", credentials: "include" });
    qc.invalidateQueries({ queryKey: ["/api/admin/categories"] });
    toast({ title: "Kategoria u fshi!" });
  };

  const eventCats = categories.filter(c => c.type === "event");
  const guestCats = categories.filter(c => c.type === "guest");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Event categories */}
      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/40">
          <CardTitle className="text-base font-serif font-bold text-[#2d1a1f]">Kategoritë e Eventeve</CardTitle>
          <CardDescription className="text-xs text-slate-500 font-serif">Llojet e eventeve (Dasmë, Ditëlindje, Fejesë, Konferencë)</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Kategori e re eventash..." className="h-9 text-xs border-slate-200 rounded-xl" value={type === "event" ? name : ""} onChange={e => { setType("event"); setName(e.target.value); }} />
            <Button onClick={handleAdd} size="sm" className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white h-9 text-xs font-serif uppercase tracking-wider rounded-xl"><Plus className="h-4 w-4 mr-1" /> Shto</Button>
          </div>
          <div className="divide-y divide-slate-100">
            {eventCats.map(c => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <span className="text-sm font-serif font-semibold text-[#2d1a1f]">{c.name}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guest categories */}
      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/40">
          <CardTitle className="text-base font-serif font-bold text-[#2d1a1f]">Kategoritë e Mysafirëve</CardTitle>
          <CardDescription className="text-xs text-slate-500 font-serif">Grupet e mysafirëve (Familje, Shoqëri, Kolegë, Tjetër)</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Kategori e re mysafirësh..." className="h-9 text-xs border-slate-200 rounded-xl" value={type === "guest" ? name : ""} onChange={e => { setType("guest"); setName(e.target.value); }} />
            <Button onClick={handleAdd} size="sm" className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white h-9 text-xs font-serif uppercase tracking-wider rounded-xl"><Plus className="h-4 w-4 mr-1" /> Shto</Button>
          </div>
          <div className="divide-y divide-slate-100">
            {guestCats.map(c => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <span className="text-sm font-serif font-semibold text-[#2d1a1f]">{c.name}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Custom Requests Tab ──────────────────────────────────────────────────────

function CustomRequestsTab() {
  const qc = useQueryClient();
  const { data: requests = [], isLoading } = useQuery<CustomRequest[]>({
    queryKey: ["/api/admin/custom-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/custom-requests", { credentials: "include" });
      return res.json();
    },
  });

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    await fetch(`/api/admin/custom-requests/${id}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    qc.invalidateQueries({ queryKey: ["/api/admin/custom-requests"] });
    toast({ title: status === "approved" ? "Kërkesa u aprova!" : "Kërkesa u refuzua!" });
  };

  return (
    <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/40">
        <CardTitle className="text-lg font-serif font-bold text-[#2d1a1f]">Kërkesat për Plan Custom (Enterprise)</CardTitle>
        <CardDescription className="text-xs text-slate-500 font-serif">Shikoni dhe menaxhoni kërkesat e personalizuara nga klientët.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-100">
                <TableHead className="pl-6 text-xs font-serif font-bold text-slate-600 uppercase">Klienti</TableHead>
                <TableHead className="text-xs font-serif font-bold text-slate-600 uppercase">Kontakt</TableHead>
                <TableHead className="text-xs font-serif font-bold text-slate-600 uppercase">Vëllimi</TableHead>
                <TableHead className="text-xs font-serif font-bold text-slate-600 uppercase">Shënime</TableHead>
                <TableHead className="text-xs font-serif font-bold text-slate-600 uppercase">Statusi</TableHead>
                <TableHead className="pr-6 text-xs font-serif font-bold text-slate-600 uppercase">Veprime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? <TableRow><TableCell colSpan={6} className="text-center py-6"><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                : requests.map(r => (
                  <TableRow key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-serif font-semibold text-[#2d1a1f]">{r.userName}</TableCell>
                    <TableCell className="text-xs font-serif text-slate-600"><div>{r.userEmail}</div><div className="text-slate-400">{r.phone}</div></TableCell>
                    <TableCell className="text-xs font-serif text-slate-700"><div>{r.eventCount}</div><div className="text-slate-400">{r.guestEstimate} mysafirë</div></TableCell>
                    <TableCell className="text-xs font-serif text-slate-500 max-w-xs truncate">{r.notes}</TableCell>
                    <TableCell>
                      <Badge className={r.status === "approved" ? "bg-emerald-100 text-emerald-800 font-serif" : r.status === "rejected" ? "bg-rose-100 text-rose-800 font-serif" : "bg-amber-100 text-amber-800 font-serif"}>
                        {r.status === "approved" ? "Aprovar" : r.status === "rejected" ? "Refuzuar" : "Në pritje"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6">
                      {r.status === "pending" ? (
                        <div className="flex gap-1.5">
                          <Button size="sm" onClick={() => handleAction(r.id, "approved")} className="h-7 text-xs font-serif bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg">Aprovo</Button>
                          <Button size="sm" variant="outline" onClick={() => handleAction(r.id, "rejected")} className="h-7 text-xs font-serif text-rose-700 border-rose-200 rounded-lg">Refuzo</Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-serif">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject || !message) return;
    setSending(true);
    await fetch("/api/admin/notifications/send", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, targetRole }),
    });
    setSending(false);
    setSubject(""); setMessage("");
    toast({ title: "Njoftimi u dërgua me sukses tek të gjithë përdoruesit!" });
  };

  return (
    <Card className="bg-white border border-slate-200/80 shadow-sm max-w-xl rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/40">
        <CardTitle className="text-lg font-serif font-bold text-[#2d1a1f]">Dërgo Njoftime System / Email</CardTitle>
        <CardDescription className="text-xs text-slate-500 font-serif">Dërgoni mesazhe dhe email masiv tek përdoruesit e platformës.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4 text-xs font-serif">
        <div className="space-y-1.5">
          <Label className="text-slate-700 font-semibold">Marrësit</Label>
          <Select value={targetRole} onValueChange={setTargetRole}>
            <SelectTrigger className="border-slate-200 text-xs rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjithë përdoruesit</SelectItem>
              <SelectItem value="organizer">Vetem Organizuesit</SelectItem>
              <SelectItem value="pro">Përdoruesit me Plan Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-700 font-semibold">Subjekti i Email-it</Label>
          <Input placeholder="Njoftim i rëndësishëm nga NoaEvent" className="border-slate-200 text-xs rounded-xl" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-700 font-semibold">Përmbajtja e mesazhit</Label>
          <textarea
            className="w-full rounded-xl border border-slate-200 p-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7B1F3A] min-h-[120px] font-serif"
            placeholder="Shkruani mesazhin këtu..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>
        <Button onClick={handleSend} disabled={!subject || !message || sending} className="w-full bg-[#7B1F3A] hover:bg-[#5e1729] text-white text-xs font-serif uppercase tracking-wider h-11 rounded-xl">
          <Send className="h-4 w-4 mr-2" /> {sending ? "Duke dërguar..." : "Dërgo Njoftimin"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  const { data: stats } = useAdminGetStats();
  const s = stats as any;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-white border border-slate-200/80 shadow-sm p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-serif font-semibold uppercase">Rritja e Përdoruesve</p>
          <p className="text-3xl font-serif font-bold text-[#2d1a1f] mt-1">+{s?.activeUsers ?? 0}</p>
          <p className="text-xs text-emerald-700 font-serif font-medium mt-1">↑ 12% nga muaji i kaluar</p>
        </Card>
        <Card className="bg-white border border-slate-200/80 shadow-sm p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-serif font-semibold uppercase">Statistikat e Eventeve</p>
          <p className="text-3xl font-serif font-bold text-[#2d1a1f] mt-1">{s?.totalEvents ?? 0}</p>
          <p className="text-xs text-slate-500 font-serif font-medium mt-1">Mesatarja: 120 mysafirë / event</p>
        </Card>
        <Card className="bg-white border border-slate-200/80 shadow-sm p-5 rounded-2xl">
          <p className="text-xs text-slate-500 font-serif font-semibold uppercase">Përqindja e Konvertimit</p>
          <p className="text-3xl font-serif font-bold text-[#2d1a1f] mt-1">28.5%</p>
          <p className="text-xs text-emerald-700 font-serif font-medium mt-1">Nga Basic në Pro</p>
        </Card>
      </div>

      <Card className="bg-white border border-slate-200/80 shadow-sm p-6 rounded-2xl">
        <h3 className="font-serif font-bold text-[#2d1a1f] text-base mb-4">Shpërndarja e Të Ardhurave Sipas Planeve</h3>
        <div className="space-y-4 font-serif">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1"><span>Plan Pro (€50/muaj)</span><span>75% e të ardhurave</span></div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#7B1F3A] w-[75%]" /></div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1"><span>Plan Basic (€10/muaj)</span><span>25% e të ardhurave</span></div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 w-[25%]" /></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function PlatformSettingsTab() {
  const qc = useQueryClient();
  const { data: settings } = useQuery<PlatformSettingsData>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      return res.json();
    },
  });

  const [form, setForm] = useState<Partial<PlatformSettingsData>>({});

  const handleSave = async () => {
    await fetch("/api/admin/settings", {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    qc.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    toast({ title: "Cilësimet e platformës u ruajtën!" });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/40">
          <CardTitle className="text-lg font-serif font-bold text-[#2d1a1f]">Cilësimet e Platformës & Integrimet</CardTitle>
          <CardDescription className="text-xs text-slate-500 font-serif">Konfiguroni Paddle, Google Maps API, Email SMTP dhe WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 text-xs font-serif">
          {/* Branding */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#7B1F3A]">Branding</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Emri i Platformës</Label><Input defaultValue={settings?.platformName || "NoaEvent"} onChange={e => setForm(f => ({ ...f, platformName: e.target.value }))} className="border-slate-200 text-xs rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Logo URL</Label><Input defaultValue={settings?.logoUrl || ""} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} className="border-slate-200 text-xs rounded-xl" /></div>
            </div>
          </div>

          {/* Paddle */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#7B1F3A]">Paddle Billing</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Mjedisi (Environment)</Label><Input defaultValue={settings?.paddleEnvironment || "sandbox"} onChange={e => setForm(f => ({ ...f, paddleEnvironment: e.target.value }))} className="border-slate-200 text-xs rounded-xl" /></div>
              <div className="space-y-1.5"><Label>Client Token</Label><Input defaultValue={settings?.paddleClientToken || ""} onChange={e => setForm(f => ({ ...f, paddleClientToken: e.target.value }))} className="border-slate-200 text-xs rounded-xl" /></div>
            </div>
          </div>

          {/* Google Maps & WhatsApp */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#7B1F3A]">API & WhatsApp</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Google Maps API Key</Label><Input defaultValue={settings?.googleMapsApiKey || ""} onChange={e => setForm(f => ({ ...f, googleMapsApiKey: e.target.value }))} className="border-slate-200 text-xs rounded-xl" /></div>
              <div className="space-y-1.5"><Label>WhatsApp Dërguesi (Phone)</Label><Input defaultValue={settings?.whatsappSenderNumber || ""} onChange={e => setForm(f => ({ ...f, whatsappSenderNumber: e.target.value }))} className="border-slate-200 text-xs rounded-xl" /></div>
            </div>
          </div>

          {/* Language & Locality Settings */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#7B1F3A]">Gjuha e Platformës (Language)</h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <p className="font-bold text-xs text-slate-900">Ndrysho Gjuhën e Ndërfaqes</p>
                <p className="text-[11px] text-slate-500 font-light">Zgjidhni gjuhën primare të panelit (Shqip, English, Deutsch, etj.)</p>
              </div>
              <LanguageSelector isDark={false} />
            </div>
          </div>

          <Button onClick={handleSave} className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white text-xs font-serif uppercase tracking-wider h-11 px-8 rounded-xl w-full sm:w-auto">
            Ruaj Cilësimet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main AdminPanel ─────────────────────────────────────────────────────────

export function AdminPanel() {
  const { t } = useLanguage();

  return (
    <div className="bg-white min-h-full space-y-6 sm:space-y-8 font-serif text-slate-900 pb-12 max-w-8xl max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="rounded-2xl bg-[#7B1F3A] p-3 sm:p-3.5 shadow-md shadow-rose-950/10 shrink-0">
            <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d1a1f] tracking-tight">{t("admin.title", "Admin Panel")}</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-light mt-0.5">{t("admin.subtitle", "Platforma e menaxhimit të plotë me sfond të bardhë dhe tipografi editoriale")}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 self-end sm:self-center">
          <Badge className="bg-rose-50 text-[#7B1F3A] border-rose-200 px-3.5 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-xl">
            Admin Mode
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="bg-slate-50 border border-slate-200 p-1.5 rounded-2xl inline-flex min-w-full sm:w-full flex-nowrap sm:flex-wrap h-auto gap-1">
            <TabsTrigger value="users"         className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><Users className="h-4 w-4 shrink-0" /> {t("admin.tabs.users", "Përdoruesit")}</TabsTrigger>
            <TabsTrigger value="events"        className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><CalendarRange className="h-4 w-4 shrink-0" /> {t("admin.tabs.events", "Eventet")}</TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><CreditCard className="h-4 w-4 shrink-0" /> {t("nav.subscription", "Abonimet")}</TabsTrigger>
            <TabsTrigger value="payments"      className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><Receipt className="h-4 w-4 shrink-0" /> {t("admin.tabs.payments", "Pagesat")}</TabsTrigger>
            <TabsTrigger value="templates"     className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><FileText className="h-4 w-4 shrink-0" /> {t("admin.tabs.templates", "Template-et")}</TabsTrigger>
            <TabsTrigger value="categories"    className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><Tag className="h-4 w-4 shrink-0" /> Kategoritë</TabsTrigger>
            <TabsTrigger value="custom_req"    className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><HelpCircle className="h-4 w-4 shrink-0" /> {t("admin.tabs.custom", "Custom Kërkesa")}</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><Mail className="h-4 w-4 shrink-0" /> Njoftime</TabsTrigger>
            <TabsTrigger value="analytics"     className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><BarChart3 className="h-4 w-4 shrink-0" /> Raporte</TabsTrigger>
            <TabsTrigger value="settings"      className="data-[state=active]:bg-[#7B1F3A] data-[state=active]:text-white text-slate-700 gap-1.5 text-xs font-serif font-bold rounded-xl px-3.5 py-2 whitespace-nowrap transition-all"><SettingsIcon className="h-4 w-4 shrink-0" /> {t("admin.tabs.settings", "Cilësimet")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users"><UsersTable /></TabsContent>
        <TabsContent value="events"><EventsTable /></TabsContent>
        <TabsContent value="subscriptions"><SubscriptionsTable /></TabsContent>
        <TabsContent value="payments"><PaymentsTable /></TabsContent>
        <TabsContent value="templates"><TemplatesTab /></TabsContent>
        <TabsContent value="categories"><CategoriesTab /></TabsContent>
        <TabsContent value="custom_req"><CustomRequestsTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
        <TabsContent value="settings"><PlatformSettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
