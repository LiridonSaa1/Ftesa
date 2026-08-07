import { useState, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { HallDesigner } from "@/components/HallDesigner";
import {
  useGetEvent,
  useUpdateEvent,
  useDeleteEvent,
  useGetDashboardStats,
  useListGuests,
  useCreateGuest,
  useUpdateGuest,
  useDeleteGuest,
  useListTables,
  useCreateTable,
  useDeleteTable,
  useGetInvitation,
  useSaveInvitation,
  useSendInvitations,
  useLookupGuest,
  useImportGuests,
  getListGuestsQueryKey,
  getListTablesQueryKey,
  getGetDashboardStatsQueryKey,
  getGetInvitationQueryKey,
  getGetEventQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Users, LayoutGrid, Mail, QrCode, BarChart3,
  Plus, Trash2, Pencil, Search, Loader2, CheckCircle2,
  X, CircleDot, UserCheck, UserX, Clock, Send, Map,
  Download, Upload, Share2, Printer, FileSpreadsheet, FileText,
  Copy, ExternalLink, MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

/* ─── helpers ─────────────────────────────────────────── */

const STATUS_LABELS: Record<string, string> = {
  pending: "Në pritje",
  invited: "Ftuar",
  confirmed: "Konfirmoi",
  declined: "Refuzoi",
  checked_in: "Check-in",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-secondary/20 text-secondary border border-secondary/30",
  invited: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  confirmed: "bg-green-500/20 text-green-400 border border-green-500/30",
  declined: "bg-red-500/20 text-red-400 border border-red-500/30",
  checked_in: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  family: "Familje",
  friends: "Shoqëri",
  colleagues: "Kolegë",
  other: "Tjetër",
};

/* ─── Overview tab ─────────────────────────────────────── */

function OverviewTab({ eventId }: { eventId: number }) {
  const { data: stats, isLoading } = useGetDashboardStats({ eventId });

  const items = stats
    ? [
        { label: "Mysafirë Totale", value: stats.totalGuests, icon: <Users className="h-4 w-4" /> },
        { label: "Ftesa Dërguar", value: stats.invitationsSent, icon: <Mail className="h-4 w-4" /> },
        { label: "Konfirmuar", value: stats.confirmed, icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
        { label: "Refuzuar", value: stats.declined, icon: <X className="h-4 w-4 text-red-500" /> },
        { label: "Në Pritje", value: stats.pending, icon: <Clock className="h-4 w-4 text-amber-500" /> },
        { label: "Check-in", value: stats.checkedIn, icon: <UserCheck className="h-4 w-4 text-purple-600" /> },
        { label: "Tavolina", value: stats.totalTables, icon: <LayoutGrid className="h-4 w-4" /> },
        { label: "Kapaciteti Total", value: stats.totalCapacity, icon: <CircleDot className="h-4 w-4" /> },
      ]
    : [];

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl glass" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.label} className="glass border-white/5 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(217,56,94,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[30px] rounded-full pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 relative z-10">
                <CardTitle className="text-xs uppercase tracking-widest font-medium text-muted-foreground">{item.label}</CardTitle>
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-primary/70">{item.icon}</span>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-3xl font-serif text-foreground">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Guests tab ────────────────────────────────────────── */

function GuestsTab({ eventId, eventName }: { eventId: number; eventName: string }) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<any | null>(null);
  const [qrGuest, setQrGuest] = useState<any | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const { data: guests = [], isLoading } = useListGuests(eventId);
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();
  const importGuests = useImportGuests();

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    partySize: "1", category: "family", notes: "",
  });

  const resetForm = () => setForm({ firstName: "", lastName: "", phone: "", email: "", partySize: "1", category: "family", notes: "" });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListGuestsQueryKey(eventId) });
    qc.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey({ eventId }) });
  };

  const handleAdd = () => {
    createGuest.mutate(
      { eventId, data: { ...form, partySize: Number(form.partySize), category: form.category as any } },
      {
        onSuccess: () => { invalidate(); setAddOpen(false); resetForm(); toast({ title: "Mysafiri u shtua!" }); },
        onError: () => toast({ title: "Gabim", variant: "destructive" }),
      }
    );
  };

  const handleEditSave = () => {
    if (!editGuest) return;
    updateGuest.mutate(
      {
        eventId,
        guestId: editGuest.id,
        data: {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          partySize: Number(form.partySize),
          category: form.category as any,
          notes: form.notes,
        },
      },
      {
        onSuccess: () => { invalidate(); setEditGuest(null); resetForm(); toast({ title: "Mysafiri u përditësua!" }); },
        onError: () => toast({ title: "Gabim", variant: "destructive" }),
      }
    );
  };

  const openEdit = (g: any) => {
    setEditGuest(g);
    setForm({
      firstName: g.firstName,
      lastName: g.lastName,
      phone: g.phone || "",
      email: g.email || "",
      partySize: String(g.partySize || 1),
      category: g.category || "family",
      notes: g.notes || "",
    });
  };

  const handleStatusChange = (guestId: number, status: string) => {
    updateGuest.mutate(
      { eventId, guestId, data: { status: status as any } },
      { onSuccess: invalidate }
    );
  };

  const handleDelete = (guestId: number) => {
    deleteGuest.mutate(
      { eventId, guestId },
      {
        onSuccess: () => { invalidate(); toast({ title: "Mysafiri u fshi" }); },
        onError: () => toast({ title: "Gabim", variant: "destructive" }),
      }
    );
  };

  const openWhatsApp = (g: any) => {
    const rsvpUrl = `${window.location.origin}/rsvp/${g.rsvpToken}`;
    const text = `Përshëndetje ${g.firstName}, Ju jeni të ftuar në ${eventName}. Ju lutem konfirmoni pjesëmarrjen tuaj përmes këtij linku: ${rsvpUrl}`;
    const cleanPhone = (g.phone || "").replace(/[^0-9]/g, "");
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const exportExcel = () => {
    const dataToExport = filtered.map((g, index) => ({
      "Nr": index + 1,
      "Emri": g.firstName,
      "Mbiemri": g.lastName,
      "Telefoni": g.phone || "",
      "Email": g.email || "",
      "Kategoria": CATEGORY_LABELS[g.category] || g.category,
      "Numri i personave": g.partySize,
      "Statusi": STATUS_LABELS[g.status] || g.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mysafiret");
    XLSX.writeFile(workbook, `mysafiret-${eventName || 'event'}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const mappedData = data.map((row: any) => {
          return {
            firstName: row.Emri || row.Name || row.firstName || row.Emri_1 || "I panjohur",
            lastName: row.Mbiemri || row.LastName || row.lastName || row.Mbiemri_1 || "",
            phone: row.Telefoni || row.Phone || row.phone || row.Telefon || "",
            email: row.Email || row.email || "",
            partySize: Number(row['Numri i personave'] || row.PartySize || row.partySize || row.Personat) || 1,
            category: (row.Kategoria || row.Category || row.category || 'family').toLowerCase()
          };
        });

        setPreviewData(mappedData);
        setImportOpen(true);
      } catch (err) {
        toast({ title: "Gabim gjatë leximit të skedarit", variant: "destructive" });
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = () => {
    importGuests.mutate(
      { eventId, data: { guests: previewData as any } },
      {
        onSuccess: (res) => { 
          invalidate(); 
          setImportOpen(false); 
          setPreviewData([]);
          toast({ title: `${res.imported} mysafirë u importuan me sukses!` }); 
        },
        onError: () => toast({ title: "Gabim gjatë importimit", variant: "destructive" }),
      }
    );
  };

  const filtered = guests.filter((g) => {
    const matchSearch =
      !search ||
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    const matchCategory = filterCategory === "all" || g.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Kërko mysafir..."
              className="pl-9 rounded-xl border-white/10 bg-black/20 focus-visible:ring-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-36 rounded-xl border-white/10 bg-black/20 focus:ring-primary/50">
              <SelectValue placeholder="Statusi" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-background/95 backdrop-blur-xl">
              <SelectItem value="all">Të gjitha statuset</SelectItem>
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-36 rounded-xl border-white/10 bg-black/20 focus:ring-primary/50">
              <SelectValue placeholder="Kategoria" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-background/95 backdrop-blur-xl">
              <SelectItem value="all">Të gjitha kategoritë</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all flex-1 md:flex-none" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Importo
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
          
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all flex-1 md:flex-none" onClick={exportExcel} disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Eksporto
          </Button>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_15px_rgba(217,56,94,0.3)] transition-all hover:shadow-[0_0_25px_rgba(217,56,94,0.5)] flex-1 md:flex-none">
                <Plus className="mr-2 h-4 w-4" /> Shto Mysafir
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-background/90 backdrop-blur-2xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Shto Mysafir</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Emri *</Label>
                    <Input className="rounded-xl border-white/10 bg-black/20 focus-visible:ring-primary/50" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Alban" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Mbiemri *</Label>
                    <Input className="rounded-xl border-white/10 bg-black/20 focus-visible:ring-primary/50" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Berisha" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Telefon</Label>
                    <Input className="rounded-xl border-white/10 bg-black/20 focus-visible:ring-primary/50" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+383..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                    <Input className="rounded-xl border-white/10 bg-black/20 focus-visible:ring-primary/50" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@..." type="email" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nr. personave</Label>
                    <Input className="rounded-xl border-white/10 bg-black/20 focus-visible:ring-primary/50" type="number" min="1" value={form.partySize} onChange={e => setForm(f => ({ ...f, partySize: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Kategoria</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger className="rounded-xl border-white/10 bg-black/20 focus:ring-primary/50"><SelectValue /></SelectTrigger>
                      <SelectContent className="border-white/10 bg-background/95 backdrop-blur-xl">
                        {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5" onClick={() => setAddOpen(false)}>Anulo</Button>
                <Button
                  onClick={handleAdd}
                  disabled={!form.firstName || !form.lastName || createGuest.isPending}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_15px_rgba(217,56,94,0.3)]"
                >
                  {createGuest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Shto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Guest Dialog */}
      <Dialog open={!!editGuest} onOpenChange={open => !open && setEditGuest(null)}>
        <DialogContent className="border-white/10 bg-background/90 backdrop-blur-2xl rounded-2xl">
          <DialogHeader><DialogTitle className="font-serif text-xl">Ndrysho Mysafirin</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground">Emri *</Label><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="rounded-xl border-white/10 bg-black/20" /></div>
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground">Mbiemri *</Label><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="rounded-xl border-white/10 bg-black/20" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground">Telefon</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="rounded-xl border-white/10 bg-black/20" /></div>
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground">Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl border-white/10 bg-black/20" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground">Nr. personave</Label><Input type="number" min="1" value={form.partySize} onChange={e => setForm(f => ({ ...f, partySize: e.target.value }))} className="rounded-xl border-white/10 bg-black/20" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-muted-foreground">Kategoria</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="rounded-xl border-white/10 bg-black/20"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(CATEGORY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGuest(null)} className="rounded-xl border-white/10">Anulo</Button>
            <Button onClick={handleEditSave} disabled={updateGuest.isPending} className="bg-primary hover:bg-primary/90 text-white rounded-xl">Ruaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!qrGuest} onOpenChange={open => !open && setQrGuest(null)}>
        <DialogContent className="border-white/10 bg-background/95 backdrop-blur-2xl rounded-2xl text-center max-w-sm">
          <DialogHeader><DialogTitle className="font-serif text-xl text-center">QR Code & Ftesa</DialogTitle></DialogHeader>
          {qrGuest && (
            <div className="space-y-4 py-4 flex flex-col items-center">
              <p className="font-semibold text-lg font-serif">{qrGuest.firstName} {qrGuest.lastName}</p>
              <div className="p-4 bg-white rounded-2xl shadow-xl border border-white/20">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/rsvp/${qrGuest.rsvpToken}`)}`}
                  alt="QR Code"
                  className="w-44 h-44"
                />
              </div>
              <p className="text-xs text-muted-foreground">Përdoreni këtë QR Code gjatë hyrjes në event për check-in të shpejtë.</p>
              <div className="flex gap-2 w-full pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-white/10 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/rsvp/${qrGuest.rsvpToken}`);
                    toast({ title: "Linku i RSVP u kopjua!" });
                  }}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Kopjo Linkun
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs"
                  onClick={() => openWhatsApp(qrGuest)}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-3 pt-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl glass" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-2xl glass shadow-xl mt-8">
          <div className="rounded-full bg-white/5 p-6 mb-6 border border-white/10">
            <Users className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-light text-lg">Nuk u gjet asnjë mysafir.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 overflow-hidden mt-8 glass shadow-xl">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-muted-foreground">Emri</th>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-muted-foreground hidden md:table-cell">Telefon</th>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Kategoria</th>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-muted-foreground hidden sm:table-cell">Personat</th>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-muted-foreground">Statusi</th>
                <th className="px-6 py-4 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((guest) => (
                <tr key={guest.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-serif text-base text-foreground">
                    {guest.firstName} {guest.lastName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-light hidden md:table-cell">{guest.phone || "—"}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-[10px] uppercase tracking-wider bg-white/5 text-muted-foreground px-2.5 py-1 rounded-md border border-white/5">
                      {CATEGORY_LABELS[guest.category] || guest.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-muted-foreground font-light">{guest.partySize}</td>
                  <td className="px-6 py-4">
                    <Select
                      value={guest.status}
                      onValueChange={(val) => handleStatusChange(guest.id, val)}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs border-0 bg-transparent p-0 focus:ring-0">
                        <span className={cn("text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-medium", STATUS_COLORS[guest.status])}>
                          {STATUS_LABELS[guest.status] || guest.status}
                        </span>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v} className="text-[10px] uppercase tracking-wider">{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg"
                        title="QR Code" onClick={() => setQrGuest(guest)}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg"
                        title="WhatsApp" onClick={() => openWhatsApp(guest)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg"
                        title="Ndrysho" onClick={() => openEdit(guest)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-destructive/80 rounded-lg transition-colors"
                        title="Fshi" onClick={() => handleDelete(guest.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-4">{filtered.length} mysafirë</p>
    </div>
  );
}

/* ─── RSVP Tab ────────────────────────────────────────────── */

function RsvpTab({ eventId }: { eventId: number }) {
  const { data: guests = [], isLoading } = useListGuests(eventId);
  const updateGuest = useUpdateGuest();
  const qc = useQueryClient();

  const handleStatusChange = (guestId: number, status: string) => {
    updateGuest.mutate(
      { eventId, guestId, data: { status: status as any } },
      { onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListGuestsQueryKey(eventId) });
        qc.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey({ eventId }) });
      }}
    );
  };

  const confirmed = guests.filter(g => g.status === "confirmed" || g.status === "checked_in");
  const declined = guests.filter(g => g.status === "declined");
  const pending = guests.filter(g => g.status === "pending" || g.status === "invited");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass border-green-500/20 bg-green-500/5 p-4 rounded-2xl">
          <p className="text-xs uppercase font-medium text-green-400">Pranuar / Konfirmuar</p>
          <p className="text-3xl font-serif font-bold text-foreground mt-1">{confirmed.length}</p>
        </Card>
        <Card className="glass border-red-500/20 bg-red-500/5 p-4 rounded-2xl">
          <p className="text-xs uppercase font-medium text-red-400">Refuzuar</p>
          <p className="text-3xl font-serif font-bold text-foreground mt-1">{declined.length}</p>
        </Card>
        <Card className="glass border-amber-500/20 bg-amber-500/5 p-4 rounded-2xl">
          <p className="text-xs uppercase font-medium text-amber-400">Në Pritje</p>
          <p className="text-3xl font-serif font-bold text-foreground mt-1">{pending.length}</p>
        </Card>
      </div>

      <Tabs defaultValue="confirmed" className="space-y-4">
        <TabsList className="bg-black/30">
          <TabsTrigger value="confirmed" className="text-xs">Konfirmuar ({confirmed.length})</TabsTrigger>
          <TabsTrigger value="declined" className="text-xs">Refuzuar ({declined.length})</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">Në Pritje ({pending.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed">
          <GuestSubList guests={confirmed} onStatusChange={handleStatusChange} />
        </TabsContent>
        <TabsContent value="declined">
          <GuestSubList guests={declined} onStatusChange={handleStatusChange} />
        </TabsContent>
        <TabsContent value="pending">
          <GuestSubList guests={pending} onStatusChange={handleStatusChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GuestSubList({ guests, onStatusChange }: { guests: any[]; onStatusChange: (id: number, status: string) => void }) {
  if (guests.length === 0) {
    return <div className="p-8 text-center text-sm text-muted-foreground glass rounded-2xl">Nuk ka mysafirë në këtë kategori.</div>;
  }

  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden glass">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02] border-b border-white/5">
          <tr>
            <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-widest text-muted-foreground">Emri</th>
            <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-widest text-muted-foreground">Telefon</th>
            <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-widest text-muted-foreground">Personat</th>
            <th className="text-left px-6 py-3 font-medium text-xs uppercase tracking-widest text-muted-foreground">Statusi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {guests.map((g) => (
            <tr key={g.id} className="hover:bg-white/[0.02]">
              <td className="px-6 py-3 font-serif text-base">{g.firstName} {g.lastName}</td>
              <td className="px-6 py-3 text-muted-foreground text-xs">{g.phone || "—"}</td>
              <td className="px-6 py-3 text-muted-foreground text-xs">{g.partySize}</td>
              <td className="px-6 py-3">
                <Select value={g.status} onValueChange={(val) => onStatusChange(g.id, val)}>
                  <SelectTrigger className="h-8 w-32 text-xs border-0 bg-transparent p-0">
                    <span className={cn("text-[10px] uppercase px-2.5 py-1 rounded-md font-medium", STATUS_COLORS[g.status])}>
                      {STATUS_LABELS[g.status]}
                    </span>
                  </SelectTrigger>
                  <SelectContent>{Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Reports Tab ─────────────────────────────────────────── */

function ReportsTab({ eventId, event }: { eventId: number; event: any }) {
  const { data: guests = [] } = useListGuests(eventId);

  const handlePrint = () => {
    window.print();
  };

  const exportExcel = () => {
    const dataToExport = guests.map((g, index) => ({
      "Nr": index + 1,
      "Emri": g.firstName,
      "Mbiemri": g.lastName,
      "Telefoni": g.phone || "",
      "Email": g.email || "",
      "Kategoria": CATEGORY_LABELS[g.category] || g.category,
      "Numri i personave": g.partySize,
      "Statusi": STATUS_LABELS[g.status] || g.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mysafiret");
    XLSX.writeFile(workbook, `raport-mysafiret-${event?.name || 'event'}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="glass border-white/5 rounded-2xl">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Raportet & Eksportimi
          </CardTitle>
          <CardDescription>Generoni raporte PDF, Excel ose printoni listën e mysafirëve dhe planin e sallës.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={exportExcel} variant="outline" className="h-20 flex-col gap-2 rounded-2xl border-white/10 hover:bg-white/5">
              <FileSpreadsheet className="h-6 w-6 text-green-500" />
              <span className="text-xs uppercase font-medium">Eksporto Excel</span>
            </Button>
            <Button onClick={handlePrint} variant="outline" className="h-20 flex-col gap-2 rounded-2xl border-white/10 hover:bg-white/5">
              <Printer className="h-6 w-6 text-blue-400" />
              <span className="text-xs uppercase font-medium">Printo / Eksporto PDF</span>
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Informata mbi printimin:</p>
            <p>Klikimi i butonit "Printo / Eksporto PDF" do të hapë dritaren e printimit të shfletuesit tuaj, ku mund të zgjidhni "Save as PDF" për të ruajtur dokumentin si PDF.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Tables tab ────────────────────────────────────────── */

function TablesTab({ eventId }: { eventId: number }) {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", shape: "round", capacity: "8" });

  const { data: tables = [], isLoading } = useListTables(eventId);
  const createTable = useCreateTable();
  const deleteTable = useDeleteTable();

  const invalidate = () => qc.invalidateQueries({ queryKey: getListTablesQueryKey(eventId) });

  const handleAdd = () => {
    createTable.mutate(
      { eventId, data: { name: form.name, shape: form.shape as any, capacity: Number(form.capacity) } },
      {
        onSuccess: () => { invalidate(); setAddOpen(false); setForm({ name: "", shape: "round", capacity: "8" }); toast({ title: "Tavolina u shtua!" }); },
        onError: () => toast({ title: "Gabim", variant: "destructive" }),
      }
    );
  };

  const SHAPE_LABELS: Record<string, string> = {
    round: "Rrethore", square: "Katror", rectangle: "Drejtkëndore", oval: "Oval",
  };

  const getStatus = (t: any) => {
    if (t.currentGuests >= t.capacity) return { label: "Plot", color: "bg-red-100 text-red-700" };
    if (t.currentGuests > 0) return { label: "Pjesërisht", color: "bg-amber-100 text-amber-700" };
    return { label: "Bosh", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl uppercase tracking-widest text-xs h-11 px-6 shadow-[0_0_20px_rgba(217,56,94,0.3)] transition-all hover:shadow-[0_0_30px_rgba(217,56,94,0.5)]">
              <Plus className="mr-2 h-4 w-4" /> Shto Tavolinë
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-background/90 backdrop-blur-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Shto Tavolinë</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Emri *</Label>
                <Input className="rounded-xl border-white/10 bg-black/20 focus-visible:ring-primary/50" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tavolina 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Forma</Label>
                  <Select value={form.shape} onValueChange={v => setForm(f => ({ ...f, shape: v }))}>
                    <SelectTrigger className="rounded-xl border-white/10 bg-black/20 focus:ring-primary/50"><SelectValue /></SelectTrigger>
                    <SelectContent className="border-white/10 bg-background/95 backdrop-blur-xl">
                      {Object.entries(SHAPE_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Kapaciteti (Vendet)</Label>
                  <Input className="rounded-xl border-white/10 bg-black/20 focus-visible:ring-primary/50" type="number" min="1" max="50" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5" onClick={() => setAddOpen(false)}>Anulo</Button>
              <Button onClick={handleAdd} disabled={!form.name || createTable.isPending} className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_15px_rgba(217,56,94,0.3)]">
                {createTable.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Shto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl glass" />)}
        </div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-2xl glass shadow-xl mt-8">
          <div className="rounded-full bg-white/5 p-6 mb-6 border border-white/10">
            <LayoutGrid className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-muted-foreground font-light text-lg">Nuk ka tavolina. Shtoni tavolinën e parë.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => {
            const s = getStatus(table);
            return (
              <Card key={table.id} className="glass border-white/5 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full pointer-events-none" />
                <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02] relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-xl text-foreground">{table.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-destructive/80 rounded-lg transition-colors"
                      onClick={() => deleteTable.mutate({ eventId, tableId: table.id }, { onSuccess: invalidate })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6 relative z-10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-light">{SHAPE_LABELS[table.shape]}</span>
                    <span className={cn("text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-medium border border-white/5", s.color)}>{s.label}</span>
                  </div>
                  <div className="w-full bg-black/40 border border-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary/60 to-primary h-full transition-all shadow-[0_0_10px_rgba(217,56,94,0.5)]"
                      style={{ width: `${Math.min(100, (table.currentCount / table.capacity) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-right mt-2">
                    {table.currentCount} / {table.capacity} vende
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Invitation tab ────────────────────────────────────── */

function InvitationTab({ eventId, event }: { eventId: number; event: any }) {
  const qc = useQueryClient();
  const { data: invitation } = useGetInvitation(eventId);
  const saveInvitation = useSaveInvitation();
  const sendInvitations = useSendInvitations();

  const [form, setForm] = useState({
    coupleName: invitation?.coupleName || event?.name || "",
    message: invitation?.message || "Me kënaqësi ju ftojmë të ndani gëzimin me ne!",
    template: invitation?.template || "classic",
    couplePhoto: (invitation as any)?.couplePhoto || "",
    showCountdown: true,
    showMap: true,
  });

  const handleSave = () => {
    saveInvitation.mutate(
      { eventId, data: form as any },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetInvitationQueryKey(eventId) });
          toast({ title: "Ftesa u ruajt!" });
        },
        onError: () => toast({ title: "Gabim", variant: "destructive" }),
      }
    );
  };

  const handleSend = () => {
    sendInvitations.mutate(
      { eventId, data: {} as any },
      {
        onSuccess: (result: any) => {
          qc.invalidateQueries({ queryKey: getListGuestsQueryKey(eventId) });
          toast({ title: `${result.sent || 0} ftesa u dërguan përmes email!` });
        },
        onError: () => toast({ title: "Gabim gjatë dërgimit", variant: "destructive" }),
      }
    );
  };

  const TEMPLATES = [
    { value: "classic", label: "Klasike Elegant" },
    { value: "modern", label: "Moderne Minimale" },
    { value: "floral", label: "Florale Romantike" },
    { value: "minimal", label: "Minimale Dark" },
    { value: "luxury", label: "Luks Mbretëror" },
  ];

  return (
    <div className="space-y-8 max-w-xl">
      <Card className="border-border/50 bg-card/40 rounded-none shadow-none">
        <CardHeader className="border-b border-border/30 pb-4">
          <CardTitle className="font-serif text-xl">Konfiguro Ftesën Digjitale</CardTitle>
          <CardDescription className="font-light mt-1">Personalizoni pamjen dhe mesazhin e ftesës.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Emri i Çiftit / Titulli</Label>
            <Input
              className="rounded-none border-border bg-muted/10"
              value={form.coupleName}
              onChange={e => setForm(f => ({ ...f, coupleName: e.target.value }))}
              placeholder="Alban & Zana"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Foto e Çiftit (URL)</Label>
            <Input
              className="rounded-none border-border bg-muted/10"
              value={form.couplePhoto}
              onChange={e => setForm(f => ({ ...f, couplePhoto: e.target.value }))}
              placeholder="https://... (link i fotos)"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Mesazhi i Ftesës</Label>
            <textarea
              className="w-full rounded-none border border-border bg-muted/10 px-3 py-3 text-sm focus-visible:outline-none focus-visible:border-primary resize-none min-h-[120px] font-light leading-relaxed text-foreground"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Mesazhi i ftesës..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Zgjidh Template</Label>
            <Select value={form.template} onValueChange={v => setForm(f => ({ ...f, template: v as any }))}>
              <SelectTrigger className="rounded-none border-border bg-muted/10"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-none border-border">
                {TEMPLATES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer text-muted-foreground">
              <input
                type="checkbox"
                checked={form.showCountdown}
                onChange={e => setForm(f => ({ ...f, showCountdown: e.target.checked }))}
                className="rounded-none bg-muted/10 border-border accent-primary"
              />
              Countdown Timer
            </label>
            <label className="flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer text-muted-foreground">
              <input
                type="checkbox"
                checked={form.showMap}
                onChange={e => setForm(f => ({ ...f, showMap: e.target.checked }))}
                className="rounded-none bg-muted/10 border-border accent-primary"
              />
              Google Maps
            </label>
          </div>

          <Button onClick={handleSave} disabled={saveInvitation.isPending} className="w-full bg-primary hover:bg-primary/90 text-white rounded-none uppercase tracking-widest text-xs h-12 mt-4">
            {saveInvitation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ruaj Ftesën
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/40 rounded-none shadow-none">
        <CardHeader className="border-b border-border/30 pb-4">
          <CardTitle className="font-serif text-xl">Dërgo Ftesat masive (Email)</CardTitle>
          <CardDescription className="font-light mt-1">Dërgo ftesën me link unik RSVP tek të gjithë mysafirët në pritje.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            onClick={handleSend}
            disabled={sendInvitations.isPending}
            className="w-full rounded-none uppercase tracking-widest text-xs h-12 border-primary text-primary hover:bg-primary/10"
            variant="outline"
          >
            {sendInvitations.isPending
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Duke dërguar...</>
              : <><Send className="mr-2 h-4 w-4" /> Dërgo Ftesat me Email</>
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Check-in tab ──────────────────────────────────────── */

function CheckInTab({ eventId }: { eventId: number }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: guests, isLoading, refetch } = useLookupGuest(eventId, { name: query }, {
    query: { enabled: false } as any
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearched(true);
    refetch();
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card className="border-border/50 bg-card/40 rounded-none shadow-none">
        <CardHeader className="border-b border-border/30 pb-4">
          <CardTitle className="font-serif text-xl flex items-center gap-3">
            <QrCode className="h-5 w-5 text-primary/70" />
            Check-in i Mysafirëve
          </CardTitle>
          <CardDescription className="font-light mt-1">Kërkoni mysafirin me emër ose mbiemër gjatë hyrjes.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Emri ose Mbiemri..."
              className="flex-1 rounded-none border-border bg-muted/10 h-12"
            />
            <Button type="submit" disabled={isLoading || query.trim().length < 2} className="bg-primary hover:bg-primary/90 text-white rounded-none h-12 px-6">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && !isLoading && (
        <div className="space-y-4">
          {(!guests || (guests as any[]).length === 0) ? (
            <div className="text-center py-12 text-muted-foreground border border-border/50 rounded-none bg-card/20">
              <UserX className="h-8 w-8 mx-auto mb-4 text-primary/40" />
              <p className="font-light italic font-serif">Nuk u gjet asnjë mysafir.</p>
            </div>
          ) : (
            (guests as any[]).map((g: any) => (
              <Card key={g.id} className="border-border/50 bg-card/40 rounded-none shadow-none hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg font-serif text-foreground">{g.firstName} {g.lastName}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                        Personat: {g.partySize}
                      </p>
                      {g.tableName && (
                        <p className="text-sm text-primary font-medium mt-3 flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4" /> {g.tableName}
                        </p>
                      )}
                    </div>
                    <span className={cn("text-[10px] uppercase tracking-wider px-2 py-1 rounded-none font-medium", STATUS_COLORS[g.status])}>
                      {STATUS_LABELS[g.status]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main EventWorkspace ───────────────────────────────── */

export function EventWorkspace() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const eventId = parseInt(params.id, 10);
  const qc = useQueryClient();

  const { data: event, isLoading: eventLoading } = useGetEvent(eventId);
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", date: "", time: "", venue: "", address: "", description: "", dressCode: "", phoneContact: "", status: "active"
  });

  const openEditDialog = () => {
    if (!event) return;
    setEditForm({
      name: event.name || "",
      date: event.date || "",
      time: event.time || "",
      venue: event.venue || "",
      address: event.address || "",
      description: event.description || "",
      dressCode: event.dressCode || "",
      phoneContact: event.phoneContact || "",
      status: event.status || "active",
    });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    updateEvent.mutate(
      { id: eventId, data: editForm as any },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetEventQueryKey(eventId) });
          setEditOpen(false);
          toast({ title: "Eventi u përditësua!" });
        },
        onError: () => toast({ title: "Gabim gjatë përditësimit", variant: "destructive" }),
      }
    );
  };

  const handleDeleteEvent = () => {
    deleteEvent.mutate(
      { id: eventId },
      {
        onSuccess: () => {
          toast({ title: "Eventi u fshi!" });
          setLocation("/events");
        },
        onError: () => toast({ title: "Gabim gjatë fshirjes", variant: "destructive" }),
      }
    );
  };

  if (eventLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground mb-4">Eventi nuk u gjet.</p>
        <Button asChild variant="outline"><Link href="/events">Kthehu</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/events"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-serif font-bold tracking-tight">{event.name}</h1>
              <Badge variant={event.status === "active" ? "default" : "secondary"} className="capitalize">
                {event.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {format(new Date(event.date), "dd MMMM yyyy")}
              {event.time && ` · ${event.time}`}
              {event.venue && ` · ${event.venue}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <Button variant="outline" size="sm" onClick={openEditDialog} className="rounded-xl border-white/10 text-xs">
            <Pencil className="h-3.5 w-3.5 mr-1" /> Ndrysho Eventin
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Fshi Eventin
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-white/10 bg-background/90 backdrop-blur-2xl rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Fshi eventin "{event.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  Kjo procedurë është e pakthyeshme. Do të fshihen të gjithë mysafirët, tavolinat dhe ftesat lidhur me këtë event.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl border-white/10">Anulo</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700 rounded-xl">Po, fshi</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-white/10 bg-background/90 backdrop-blur-2xl rounded-2xl max-w-lg">
          <DialogHeader><DialogTitle className="font-serif text-xl">Ndrysho Detajet e Eventit</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1"><Label>Emri i Eventit *</Label><Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl border-white/10 bg-black/20" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Data *</Label><Input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} className="rounded-xl border-white/10 bg-black/20" /></div>
              <div className="space-y-1"><Label>Ora</Label><Input value={editForm.time} onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))} placeholder="19:00" className="rounded-xl border-white/10 bg-black/20" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Vendi (Venue)</Label><Input value={editForm.venue} onChange={e => setEditForm(f => ({ ...f, venue: e.target.value }))} className="rounded-xl border-white/10 bg-black/20" /></div>
              <div className="space-y-1"><Label>Adresa</Label><Input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} className="rounded-xl border-white/10 bg-black/20" /></div>
            </div>
            <div className="space-y-1"><Label>Statusi</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="rounded-xl border-white/10 bg-black/20"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl border-white/10">Anulo</Button>
            <Button onClick={handleEditSave} disabled={updateEvent.isPending} className="bg-primary hover:bg-primary/90 text-white rounded-xl">Ruaj Ndryshimet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/60 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-1.5"><BarChart3 className="h-4 w-4" /> Pasqyra</TabsTrigger>
          <TabsTrigger value="guests" className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Mysafirët</TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-1.5"><LayoutGrid className="h-4 w-4" /> Tavolinat</TabsTrigger>
          <TabsTrigger value="invitation" className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> Ftesa</TabsTrigger>
          <TabsTrigger value="hall" className="flex items-center gap-1.5"><Map className="h-4 w-4" /> Hall Designer</TabsTrigger>
          <TabsTrigger value="rsvp" className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> RSVP</TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5"><Printer className="h-4 w-4" /> Raportet</TabsTrigger>
          <TabsTrigger value="checkin" className="flex items-center gap-1.5"><QrCode className="h-4 w-4" /> Check-in</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab eventId={eventId} /></TabsContent>
        <TabsContent value="guests"><GuestsTab eventId={eventId} eventName={event?.name ?? ""} /></TabsContent>
        <TabsContent value="tables"><TablesTab eventId={eventId} /></TabsContent>
        <TabsContent value="invitation"><InvitationTab eventId={eventId} event={event} /></TabsContent>
        <TabsContent value="hall" className="h-[75vh] min-h-[600px]"><HallDesigner eventId={eventId} /></TabsContent>
        <TabsContent value="rsvp"><RsvpTab eventId={eventId} /></TabsContent>
        <TabsContent value="reports"><ReportsTab eventId={eventId} event={event} /></TabsContent>
        <TabsContent value="checkin"><CheckInTab eventId={eventId} /></TabsContent>
      </Tabs>
    </div>
  );
}
