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
  Copy, ExternalLink, MessageCircle, Eye, CalendarDays, MapPin, Sparkles, Wand2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

/* ─── icons & helpers ─────────────────────────────────── */

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.461h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c0-5.445 4.43-9.875 9.877-9.875 2.635 0 5.11 1.028 6.973 2.894a9.81 9.81 0 012.888 6.98c-.001 5.447-4.432 9.876-9.856 9.876M12.05 0C5.405 0 0 5.405 0 12.05c0 2.118.553 4.186 1.605 6.002L0 24l6.104-1.6c1.75.955 3.737 1.458 5.942 1.458 6.645 0 12.05-5.405 12.05-12.05C24.096 5.405 18.692 0 12.05 0z"/>
    </svg>
  );
}

function ViberIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.67 4.33C17.65 2.31 14.88 1.15 11.96 1.15c-5.83 0-10.58 4.75-10.58 10.58 0 2.12.63 4.14 1.83 5.86L1.5 22.85l5.52-1.68c1.64 1.05 3.56 1.61 5.52 1.61h.01c5.83 0 10.58-4.75 10.58-10.58 0-2.92-1.16-5.69-3.46-7.87zM11.97 20.9c-1.72 0-3.41-.47-4.88-1.35l-.35-.21-3.63 1.1.98-3.53-.23-.37C2.9 15.02 2.39 13.52 2.39 11.96c0-5.28 4.3-9.58 9.58-9.58 2.56 0 4.96 1 6.77 2.81 1.81 1.81 2.81 4.21 2.81 6.77 0 5.28-4.3 9.58-9.58 9.58zm5.25-7.17c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.91 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49-.17-.01-.36-.01-.55-.01-.19 0-.5.07-.76.36-.26.29-1 1-1 2.44 0 1.44 1.03 2.83 1.17 3.02.14.19 2.03 3.1 4.92 4.35.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.11.56-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34z"/>
    </svg>
  );
}

function sendViaWhatsApp(guest: any, eventName: string) {
  const rsvpUrl = `${window.location.origin}/rsvp/${guest.rsvpToken}`;
  const text = `Përshëndetje ${guest.firstName}! ✨\n\nJeni të ftuar me kënaqësi në eventin tonë: *${eventName}* 🎉\n\nJu lutem konfirmoni pjesëmarrjen tuaj (RSVP) përmes këtij linku:\n${rsvpUrl}\n\nJu mirëpresim!`;
  const cleanPhone = (guest.phone || "").replace(/[^0-9]/g, "");
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function sendViaViber(guest: any, eventName: string) {
  const rsvpUrl = `${window.location.origin}/rsvp/${guest.rsvpToken}`;
  const text = `Përshëndetje ${guest.firstName}! ✨\n\nJeni të ftuar me kënaqësi në eventin tonë: ${eventName} 🎉\n\nJu lutem konfirmoni pjesëmarrjen tuaj (RSVP) përmes këtij linku:\n${rsvpUrl}\n\nJu mirëpresim!`;
  const cleanPhone = (guest.phone || "").replace(/[^0-9]/g, "");

  navigator.clipboard.writeText(text);

  const viberUrl = cleanPhone
    ? `viber://chat?number=%2B${cleanPhone}`
    : `viber://forward?text=${encodeURIComponent(text)}`;

  window.location.href = viberUrl;
  toast({
    title: "U hap në Viber",
    description: "Teksti i ftesës dhe linku u kopjuan gjithashtu në clipboard.",
  });
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Në pritje",
  invited: "Ftuar",
  confirmed: "Konfirmoi",
  declined: "Refuzoi",
  checked_in: "Check-in",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold",
  invited: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold",
  confirmed: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold",
  declined: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold",
  checked_in: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-semibold",
};

const CATEGORY_LABELS: Record<string, string> = {
  family: "Familje",
  friends: "Shoqëri",
  colleagues: "Kolegë",
  other: "Tjetër",
};

const CHANNEL_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  whatsapp: { label: "WhatsApp", icon: "🟢", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  viber: { label: "Viber", icon: "🟣", color: "bg-purple-50 text-purple-700 border-purple-200" },
  sms: { label: "SMS", icon: "📱", color: "bg-blue-50 text-blue-700 border-blue-200" },
  email: { label: "Email", icon: "✉️", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

function getPreferredChannel(guest: any): "whatsapp" | "viber" | "sms" | "email" {
  if (guest.notes && guest.notes.includes("[channel:viber]")) return "viber";
  if (guest.notes && guest.notes.includes("[channel:sms]")) return "sms";
  if (guest.notes && guest.notes.includes("[channel:email]")) return "email";
  if (guest.notes && guest.notes.includes("[channel:whatsapp]")) return "whatsapp";
  if (guest.phone) return "whatsapp";
  if (guest.email) return "email";
  return "whatsapp";
}

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
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<any | null>(null);
  const [qrGuest, setQrGuest] = useState<any | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [bulkSendOpen, setBulkSendOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const { data: guests = [], isLoading } = useListGuests(eventId);
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();
  const importGuests = useImportGuests();
  const sendInvitations = useSendInvitations();

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    partySize: "1", category: "family", preferredChannel: "whatsapp", notes: "",
  });

  const resetForm = () => setForm({ firstName: "", lastName: "", phone: "", email: "", partySize: "1", category: "family", preferredChannel: "whatsapp", notes: "" });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListGuestsQueryKey(eventId) });
    qc.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey({ eventId }) });
    qc.refetchQueries({ queryKey: getListGuestsQueryKey(eventId) });
  };

  const handleAdd = () => {
    const notesWithChannel = `${form.notes || ""} [channel:${form.preferredChannel}]`.trim();
    createGuest.mutate(
      { eventId, data: { ...form, notes: notesWithChannel, partySize: Number(form.partySize), category: form.category as any } },
      {
        onSuccess: () => { invalidate(); setAddOpen(false); resetForm(); toast({ title: "Mysafiri u shtua!" }); },
        onError: () => toast({ title: "Gabim", variant: "destructive" }),
      }
    );
  };

  const handleEditSave = () => {
    if (!editGuest) return;
    const cleanNotes = (form.notes || "").replace(/\[channel:[^\]]+\]/g, "").trim();
    const notesWithChannel = `${cleanNotes} [channel:${form.preferredChannel}]`.trim();
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
          notes: notesWithChannel,
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
      preferredChannel: getPreferredChannel(g),
      notes: (g.notes || "").replace(/\[channel:[^\]]+\]/g, "").trim(),
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

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        "Emri": "Alban",
        "Mbiemri": "Berisha",
        "Telefoni": "+38344123456",
        "Email": "alban@example.com",
        "Kategoria": "Familje",
        "Numri i personave": 2
      },
      {
        "Emri": "Zana",
        "Mbiemri": "Gashi",
        "Telefoni": "+38349987654",
        "Email": "zana@example.com",
        "Kategoria": "Shoqëri",
        "Numri i personave": 1
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Model Mysafiret");
    XLSX.writeFile(workbook, "Model-Import-Mysafiret.xlsx");
    toast({ title: "Modeli i Excel u shkarkua me sukses!" });
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
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: "array" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const sheetData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        if (!sheetData || sheetData.length === 0) {
          toast({ title: "Skedari është i zbrazët", variant: "destructive" });
          return;
        }

        const firstRowStr = (sheetData[0] || []).join(" ").toLowerCase();
        const hasHeader = firstRowStr.includes("emri") || firstRowStr.includes("name") || firstRowStr.includes("mbiemri") || firstRowStr.includes("telefon") || firstRowStr.includes("phone");

        const rowsToProcess = hasHeader ? sheetData.slice(1) : sheetData;

        let colNameIdx = -1;
        let colLastNameIdx = -1;
        let colPhoneIdx = -1;
        let colEmailIdx = -1;
        let colCatIdx = -1;
        let colPartyIdx = -1;

        if (hasHeader && sheetData[0]) {
          sheetData[0].forEach((cellVal: any, idx: number) => {
            const str = String(cellVal || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            
            // Check mbiemri / lastname FIRST so "emri" inside "mbiemri" doesn't hijack colNameIdx
            if (str.includes("mbiemri") || str.includes("lastname") || str.includes("surname")) {
              colLastNameIdx = idx;
            } else if (str.includes("emri") || str.includes("name") || str.includes("fullname") || str.includes("emrimbiemri")) {
              colNameIdx = idx;
            } else if (str.includes("telefon") || str.includes("phone") || str.includes("mobile") || str.includes("tel") || str.includes("cel")) {
              colPhoneIdx = idx;
            } else if (str.includes("email") || str.includes("mail")) {
              colEmailIdx = idx;
            } else if (str.includes("kategori") || str.includes("category") || str.includes("lloji") || str.includes("grupi")) {
              colCatIdx = idx;
            } else if (str.includes("person") || str.includes("party") || str.includes("numri") || str.includes("sasia") || str.includes("nr")) {
              colPartyIdx = idx;
            }
          });
        }

        // Apply defaults for unmapped columns
        if (colNameIdx === -1) colNameIdx = 0;
        if (colLastNameIdx === -1) colLastNameIdx = colNameIdx === 0 ? 1 : -1;
        if (colPhoneIdx === -1) colPhoneIdx = 2;
        if (colEmailIdx === -1) colEmailIdx = 3;
        if (colCatIdx === -1) colCatIdx = 4;
        if (colPartyIdx === -1) colPartyIdx = 5;

        const mappedData = rowsToProcess
          .map((rowArray: any[]) => {
            if (!rowArray || rowArray.length === 0) return null;

            let firstName = String(rowArray[colNameIdx] || "").trim();
            let lastName = colLastNameIdx !== -1 ? String(rowArray[colLastNameIdx] || "").trim() : "";

            if (!firstName && !lastName) {
              const nonEmpties = rowArray.map(c => String(c || "").trim()).filter(Boolean);
              if (nonEmpties.length > 0) {
                firstName = nonEmpties[0];
                if (nonEmpties.length > 1 && !/^\+?\d[\d\s-]{4,}$/.test(nonEmpties[1])) {
                  lastName = nonEmpties[1];
                }
              }
            }

            if (firstName && !lastName && firstName.includes(" ")) {
              const parts = firstName.split(/\s+/);
              firstName = parts[0];
              lastName = parts.slice(1).join(" ");
            }

            if (firstName && firstName === lastName) {
              lastName = "";
            }

            const phone = String(rowArray[colPhoneIdx] || "").trim();
            const email = String(rowArray[colEmailIdx] || "").trim();
            const partySize = Number(rowArray[colPartyIdx]) || 1;
            const rawCategory = String(rowArray[colCatIdx] || "Familje").trim().toLowerCase();

            let category = "other";
            if (rawCategory.includes("fam") || rawCategory.includes("fis") || rawCategory.includes("afërm") || rawCategory.includes("aferm")) {
              category = "family";
            } else if (rawCategory.includes("shoq") || rawCategory.includes("shok") || rawCategory.includes("mik") || rawCategory.includes("miq")) {
              category = "friends";
            } else if (rawCategory.includes("kol") || rawCategory.includes("pun") || rawCategory.includes("work")) {
              category = "colleagues";
            }

            if (!firstName && !lastName) return null;

            return {
              firstName: firstName || "Mysafir",
              lastName: lastName || "",
              phone,
              email,
              partySize: partySize > 0 ? partySize : 1,
              category,
            };
          })
          .filter(Boolean);

        if (mappedData.length === 0) {
          toast({ title: "Skedari nuk përmban të dhëna mysafirësh", variant: "destructive" });
          return;
        }

        setPreviewData(mappedData as any[]);
        setImportOpen(true);
      } catch (err) {
        toast({ title: "Gabim gjatë leximit të skedarit", variant: "destructive" });
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmImport = () => {
    importGuests.mutate(
      { eventId, data: { guests: previewData as any } },
      {
        onSuccess: (res: any) => { 
          invalidate(); 
          setImportOpen(false); 
          setPreviewData([]);
          const count = typeof res?.imported === 'number' ? res.imported : previewData.length;
          if (res?.failed && res.failed > 0) {
            toast({ 
              title: `${count} mysafirë u importuan, ${res.failed} nuk u importuan.`,
              variant: count > 0 ? "default" : "destructive" 
            });
          } else {
            toast({ title: `${count} mysafirë u importuan me sukses!` }); 
          }
        },
        onError: (err: any) => {
          console.error("Import error:", err);
          toast({ title: "Gabim gjatë importimit të mysafirëve", variant: "destructive" });
        },
      }
    );
  };

  const filtered = guests.filter((g) => {
    const matchSearch =
      !search ||
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    const matchCategory = filterCategory === "all" || g.category === filterCategory;
    const matchChannel = filterChannel === "all" || getPreferredChannel(g) === filterChannel;
    return matchSearch && matchStatus && matchCategory && matchChannel;
  });

  return (
    <div className="space-y-4">
      {/* Top Action Header Bar */}
      <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Left Actions: Add Guest & Send All */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl shadow-sm transition-all font-serif text-xs font-semibold h-9 px-4">
                <Plus className="mr-1.5 h-4 w-4" /> Shto Mysafir
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
                    <Input className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]" type="number" min="1" value={form.partySize} onChange={e => setForm(f => ({ ...f, partySize: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Kategoria</Label>
                    <Input
                      className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]"
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      placeholder="p.sh. Familje, Shoqëri..."
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Kanali i Preferuar i Komunikimit</Label>
                  <Select value={form.preferredChannel} onValueChange={val => setForm(f => ({ ...f, preferredChannel: val }))}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-[#7B1F3A]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white">
                      <SelectItem value="whatsapp">🟢 WhatsApp</SelectItem>
                      <SelectItem value="viber">🟣 Viber</SelectItem>
                      <SelectItem value="sms">📱 SMS</SelectItem>
                      <SelectItem value="email">✉️ Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50" onClick={() => setAddOpen(false)}>Anulo</Button>
                <Button
                  onClick={handleAdd}
                  disabled={!form.firstName || !form.lastName || createGuest.isPending}
                  className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl shadow-sm font-semibold"
                >
                  {createGuest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Shto Mysafir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all font-serif text-xs font-semibold h-9 px-4 gap-1.5"
            onClick={() => setBulkSendOpen(true)}
            disabled={filtered.length === 0}
          >
            <Send className="h-4 w-4" /> Dërgoju të Gjithëve ({filtered.length})
          </Button>

          {/* Bulk Send Dialog */}
          <Dialog open={bulkSendOpen} onOpenChange={setBulkSendOpen}>
            <DialogContent className="border-slate-200 bg-white rounded-2xl max-w-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-[#2d1a1f] flex items-center gap-2">
                  <Send className="h-5 w-5 text-emerald-600" /> Dërgesa Masive e Ftesave ({filtered.length} Mysafirë)
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2 font-sans text-xs text-slate-700">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                  <p className="font-bold text-sm">Zgjidhni mënyrën e dërgimit masiv për {filtered.length} mysafirë:</p>
                  <p className="text-[11px] text-emerald-700">Mund t'u dërgoni ftesat personale me linkun e RSVP dhe QR Code me një klikim.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <Button
                    className="h-12 justify-between bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 text-xs font-semibold"
                    onClick={() => {
                      const ids = filtered.map(g => g.id);
                      sendInvitations.mutate(
                        { eventId, data: { guestIds: ids, channels: ["whatsapp"] } },
                        {
                          onSuccess: () => {
                            invalidate();
                            setBulkSendOpen(false);
                            toast({ title: `U markuan si "Ftuar" ${ids.length} mysafirë me sukses!` });
                          }
                        }
                      );
                    }}
                    disabled={sendInvitations.isPending}
                  >
                    <div className="flex items-center gap-2">
                      <WhatsAppIcon className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-bold text-xs">Shëno të Gjithë si "Ftuar"</p>
                        <p className="text-[10px] opacity-90">Përditëson statusin e {filtered.length} mysafirëve automatikisht</p>
                      </div>
                    </div>
                    {sendInvitations.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 justify-between border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-xl px-4 text-xs font-semibold"
                    onClick={() => {
                      const lines = filtered.map((g) => {
                        const rsvpUrl = `${window.location.origin}/rsvp/${g.rsvpToken}`;
                        return `${g.firstName} ${g.lastName} (${g.phone || 'Ska tel'}): ${rsvpUrl}`;
                      });
                      navigator.clipboard.writeText(lines.join("\n"));
                      toast({
                        title: "Të gjithë linket u kopjuan!",
                        description: `${lines.length} linke RSVP me emra u kopjuan në clipboard.`,
                      });
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Copy className="h-5 w-5 text-slate-600" />
                      <div className="text-left">
                        <p className="font-bold text-xs">Kopjo të Gjitha Linket RSVP</p>
                        <p className="text-[10px] text-slate-500">Kopjon emrat dhe linket për t'i dërguar ku të dëshironi</p>
                      </div>
                    </div>
                    <Copy className="h-4 w-4 text-slate-400" />
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 justify-between border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl px-4 text-xs font-semibold"
                    onClick={() => {
                      const text = `Përshëndetje! ✨ Ju jeni të ftuar me kënaqësi në eventin tonë: *${eventName}* 🎉\n\nJu lutem konfirmoni pjesëmarrjen tuaj përmes linkut tuaj të personalizuar.`;
                      navigator.clipboard.writeText(text);
                      toast({
                        title: "Teksti i ftesës u kopjua!",
                        description: "Mund ta ngjisni (paste) në grupet tuaja në WhatsApp apo Viber.",
                      });
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <ViberIcon className="h-5 w-5 text-purple-600" />
                      <div className="text-left">
                        <p className="font-bold text-xs">Kopjo Tekstin e Ftesës Masive</p>
                        <p className="text-[10px] text-purple-700">Për transmetim në Broadcast Group</p>
                      </div>
                    </div>
                    <Share2 className="h-4 w-4 text-purple-600" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl border-slate-200 text-xs" onClick={() => setBulkSendOpen(false)}>
                  Mbyll
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right Utilities: Excel Model, Import, Export */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
          <Button
            variant="outline"
            className="rounded-xl border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs h-9 px-3"
            onClick={downloadExcelTemplate}
            title="Shkarko modelin Excel për importimin e mysafirëve"
          >
            <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" /> Model Excel
          </Button>

          <Button variant="outline" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs h-9 px-3" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-1.5 h-4 w-4 text-slate-600" /> Importo
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
          
          <Button variant="outline" className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs h-9 px-3" onClick={exportExcel} disabled={filtered.length === 0}>
            <Download className="mr-1.5 h-4 w-4 text-slate-600" /> Eksporto
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Kërko mysafir sipas emrit..."
            className="pl-9 h-9 rounded-xl border-slate-200 bg-white text-xs focus-visible:ring-[#7B1F3A]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-36 text-xs rounded-xl border-slate-200 bg-white focus:ring-[#7B1F3A]">
            <SelectValue placeholder="Statusi" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 bg-white">
            <SelectItem value="all">Të gjitha statuset</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-9 w-40 text-xs rounded-xl border-slate-200 bg-white focus:ring-[#7B1F3A]">
            <SelectValue placeholder="Kategoria" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 bg-white">
            <SelectItem value="all">Të gjitha kategoritë</SelectItem>
            {Array.from(new Set([...Object.keys(CATEGORY_LABELS), ...guests.map((g: any) => g.category).filter(Boolean)])).map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABELS[c] || c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterChannel} onValueChange={setFilterChannel}>
          <SelectTrigger className="h-9 w-36 text-xs rounded-xl border-slate-200 bg-white focus:ring-[#7B1F3A]">
            <SelectValue placeholder="Kanali" />
          </SelectTrigger>
          <SelectContent className="border-slate-200 bg-white">
            <SelectItem value="all">Të gjithë kanalët</SelectItem>
            <SelectItem value="whatsapp">🟢 WhatsApp</SelectItem>
            <SelectItem value="viber">🟣 Viber</SelectItem>
            <SelectItem value="sms">📱 SMS</SelectItem>
            <SelectItem value="email">✉️ Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Edit Guest Dialog */}
      <Dialog open={!!editGuest} onOpenChange={open => !open && setEditGuest(null)}>
        <DialogContent className="border-slate-200 bg-white rounded-2xl shadow-xl">
          <DialogHeader><DialogTitle className="font-serif text-xl text-[#2d1a1f]">Ndrysho Mysafirin</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-medium">Emri *</Label><Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]" /></div>
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-medium">Mbiemri *</Label><Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-medium">Telefon</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]" /></div>
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-medium">Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-medium">Nr. personave</Label><Input type="number" min="1" value={form.partySize} onChange={e => setForm(f => ({ ...f, partySize: e.target.value }))} className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]" /></div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-muted-foreground font-medium">Kategoria</Label>
                <Input
                  className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="p.sh. Familje, Shoqëri..."
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-muted-foreground font-medium">Kanali i Preferuar i Komunikimit</Label>
              <Select value={form.preferredChannel} onValueChange={val => setForm(f => ({ ...f, preferredChannel: val }))}>
                <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-[#7B1F3A]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white">
                  <SelectItem value="whatsapp">🟢 WhatsApp</SelectItem>
                  <SelectItem value="viber">🟣 Viber</SelectItem>
                  <SelectItem value="sms">📱 SMS</SelectItem>
                  <SelectItem value="email">✉️ Email</SelectItem>
                </SelectContent>
              </Select>
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
        <DialogContent className="border-slate-200 bg-white rounded-2xl text-center max-w-sm shadow-xl">
          <DialogHeader><DialogTitle className="font-serif text-xl text-center text-[#2d1a1f]">QR Code & Ftesa</DialogTitle></DialogHeader>
          {qrGuest && (
            <div className="space-y-4 py-4 flex flex-col items-center">
              <p className="font-semibold text-lg font-serif text-slate-900">{qrGuest.firstName} {qrGuest.lastName}</p>
              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/rsvp/${qrGuest.rsvpToken}`)}`}
                  alt="QR Code"
                  className="w-44 h-44"
                />
              </div>
              <p className="text-xs text-slate-500">Përdoreni këtë QR Code gjatë hyrjes në event për check-in të shpejtë.</p>
              <div className="flex flex-col gap-2 w-full pt-2">
                <div className="flex gap-2 w-full">
                  <Button
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium h-9"
                    onClick={() => sendViaWhatsApp(qrGuest, eventName)}
                  >
                    <WhatsAppIcon className="h-4 w-4 mr-1.5" /> WhatsApp
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium h-9"
                    onClick={() => sendViaViber(qrGuest, eventName)}
                  >
                    <ViberIcon className="h-4 w-4 mr-1.5" /> Viber
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 text-xs h-9"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/rsvp/${qrGuest.rsvpToken}`);
                    toast({ title: "Linku i RSVP u kopjua!" });
                  }}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Kopjo Linkun RSVP
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Preview Confirmation Dialog */}
      <Dialog open={importOpen} onOpenChange={open => !open && setImportOpen(false)}>
        <DialogContent className="border-slate-200 bg-white rounded-2xl max-w-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#2d1a1f] flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" /> Konfirmo Importimin e Mysafirëve
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 font-serif text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{previewData.length} mysafirë u gjetën në skedar</p>
                <p className="text-[11px] text-emerald-700 font-light">Rishikoni të dhënat më poshtë përpara se t'i shtoni te lista e eventit.</p>
              </div>
              <Button size="sm" variant="ghost" className="text-emerald-800 hover:bg-emerald-100 text-xs rounded-lg" onClick={downloadExcelTemplate}>
                <Download className="h-3.5 w-3.5 mr-1" /> Model Excel
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-2.5 font-bold text-slate-600">Emri</th>
                    <th className="text-left p-2.5 font-bold text-slate-600">Mbiemri</th>
                    <th className="text-left p-2.5 font-bold text-slate-600">Telefon</th>
                    <th className="text-left p-2.5 font-bold text-slate-600">Email</th>
                    <th className="text-center p-2.5 font-bold text-slate-600">Personat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-900">{row.firstName}</td>
                      <td className="p-2.5 text-slate-700">{row.lastName || "—"}</td>
                      <td className="p-2.5 text-slate-600">{row.phone || "—"}</td>
                      <td className="p-2.5 text-slate-600 truncate max-w-[120px]">{row.email || "—"}</td>
                      <td className="p-2.5 text-center font-bold text-slate-800">{row.partySize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 15 && (
                <div className="p-2 bg-slate-50 text-center text-slate-500 text-[11px] border-t border-slate-100">
                  + edhe {previewData.length - 15} mysafirë të tjerë...
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setImportOpen(false)} className="rounded-xl border-slate-200 text-xs">Anulo</Button>
            <Button onClick={confirmImport} disabled={importGuests.isPending || previewData.length === 0} className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl text-xs uppercase tracking-wider font-semibold px-6">
              {importGuests.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Duke ruajtur...</> : `Importo ${previewData.length} Mysafirë`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-3 pt-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl glass" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-slate-200 rounded-2xl bg-white shadow-sm mt-8">
          <div className="rounded-full bg-slate-100 p-6 mb-6">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-light text-lg">Nuk u gjet asnjë mysafir.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 overflow-hidden mt-8 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-slate-500">Emri</th>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-slate-500 hidden md:table-cell">Telefon</th>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-slate-500 hidden sm:table-cell">Kategoria</th>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-slate-500 hidden md:table-cell">Kanali</th>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-slate-500 hidden sm:table-cell">Personat</th>
                <th className="text-left px-6 py-4 font-medium text-xs uppercase tracking-widest text-slate-500">Statusi</th>
                <th className="px-6 py-4 text-right">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((guest) => (
                <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-serif text-base text-slate-900 font-medium">
                    {guest.firstName} {guest.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-light hidden md:table-cell">{guest.phone || "—"}</td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                      {CATEGORY_LABELS[guest.category] || guest.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {(() => {
                      const ch = getPreferredChannel(guest);
                      const info = CHANNEL_LABELS[ch] || CHANNEL_LABELS.whatsapp;
                      return (
                        <span className={cn("text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border font-semibold inline-flex items-center gap-1", info.color)}>
                          <span>{info.icon}</span> {info.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-slate-600 font-medium">{guest.partySize}</td>
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
                      <SelectContent className="rounded-xl border-slate-200 bg-white">
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
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        title="QR Code" onClick={() => setQrGuest(guest)}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                        title="Dërgo me WhatsApp" onClick={() => sendViaWhatsApp(guest, eventName)}
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg"
                        title="Dërgo me Viber" onClick={() => sendViaViber(guest, eventName)}
                      >
                        <ViberIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        title="Ndrysho" onClick={() => openEdit(guest)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
  const { data: guests = [] } = useListGuests(eventId);
  const createTable = useCreateTable();
  const deleteTable = useDeleteTable();

  const handleAdd = () => {
    createTable.mutate(
      { eventId, data: { ...form, shape: form.shape as any, capacity: Number(form.capacity) } },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListTablesQueryKey(eventId) });
          setAddOpen(false);
          setForm({ name: "", shape: "round", capacity: "8" });
          toast({ title: "Tavolina u shtua!" });
        },
      }
    );
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListTablesQueryKey(eventId) });
  };

  const SHAPE_LABELS: Record<string, string> = {
    round: "Rrethore", square: "Katror", rectangle: "Drejtkëndore", oval: "Oval",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl font-serif text-xs font-semibold h-9 px-4 shadow-sm">
              <Plus className="mr-1.5 h-4 w-4" /> Shto Tavolinë
            </Button>
          </DialogTrigger>
          <DialogContent className="border-slate-200 bg-white rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-[#2d1a1f]">Shto Tavolinë</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 font-serif text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Emri *</Label>
                <Input className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tavolina 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Forma</Label>
                  <Select value={form.shape} onValueChange={v => setForm(f => ({ ...f, shape: v }))}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white focus:ring-[#7B1F3A]"><SelectValue /></SelectTrigger>
                    <SelectContent className="border-slate-200 bg-white">
                      {Object.entries(SHAPE_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">Kapaciteti (Vendet)</Label>
                  <Input className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#7B1F3A]" type="number" min="1" max="50" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50" onClick={() => setAddOpen(false)}>Anulo</Button>
              <Button onClick={handleAdd} disabled={!form.name || createTable.isPending} className="bg-[#7B1F3A] hover:bg-[#5e1729] text-white rounded-xl shadow-sm">
                {createTable.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Shto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-2xl bg-slate-100" />)}
        </div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-slate-200 rounded-2xl bg-white shadow-sm mt-8">
          <div className="rounded-full bg-slate-100 p-6 mb-6">
            <LayoutGrid className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-light text-lg">Nuk ka tavolina. Shtoni tavolinën e parë.</p>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tables.map((table) => {
            const tableGuests = (guests as any[]).filter(g => g.tableId === table.id || g.assignedTableId === table.id);
            const totalSeated = table.currentCount || tableGuests.reduce((acc, g) => acc + (g.partySize || 1), 0);
            const confirmedCount = tableGuests.filter(g => g.status === "confirmed").reduce((acc, g) => acc + (g.partySize || 1), 0);

            const isFull = totalSeated >= table.capacity;
            const hasConfirmed = confirmedCount > 0;
            const fillPercent = Math.min(100, Math.round((totalSeated / table.capacity) * 100));
            const confirmedPercent = Math.min(100, Math.round((confirmedCount / table.capacity) * 100));

            const badgeInfo = isFull
              ? { label: "PLOT", color: "bg-rose-50 text-rose-700 border-rose-200" }
              : totalSeated > 0
              ? { label: "PJESËRISHT", color: "bg-amber-50 text-amber-700 border-amber-200" }
              : { label: "BOSH", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };

            return (
              <Card key={table.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#7B1F3A]/40 hover:shadow-md relative overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg font-bold text-[#2d1a1f]">{table.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      onClick={() => deleteTable.mutate({ eventId, tableId: table.id }, { onSuccess: invalidate })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3.5 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-serif">{SHAPE_LABELS[table.shape] || table.shape}</span>
                    <span className={cn("text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md font-semibold border", badgeInfo.color)}>
                      {badgeInfo.label}
                    </span>
                  </div>

                  {/* Green Progress Bar for Confirmed / Seated Guests */}
                  <div className="w-full bg-slate-200/80 border border-slate-200 rounded-full h-2.5 overflow-hidden relative">
                    {/* Background fill if seated */}
                    {fillPercent > 0 && (
                      <div
                        className="bg-emerald-200/80 h-full absolute left-0 top-0 transition-all duration-500"
                        style={{ width: `${fillPercent}%` }}
                      />
                    )}
                    {/* Vibrant Green Bar for Confirmed Guests */}
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-full relative z-10 transition-all duration-500 shadow-sm"
                      style={{ width: `${hasConfirmed ? confirmedPercent : fillPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-serif font-medium">
                    <span className="text-emerald-700 font-semibold">
                      {hasConfirmed ? `${confirmedCount} Konfirmuar` : ""}
                    </span>
                    <span className="text-slate-500 uppercase tracking-wider">
                      {totalSeated} / {table.capacity} VENDE
                    </span>
                  </div>
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

const AI_INVITATION_PRESETS = [
  {
    title: "🌹 Elegante & Romantike",
    text: "Me kënaqësi të veçantë dhe zemër të mbushur me dashuri, ju ftojmë të bëheni pjesë e ditës sonë më të rëndësishme kur kurorëzojmë dashurinë tonë në martesë."
  },
  {
    title: "👑 Tradicionale & Familjare",
    text: "Nderi dhe kënaqësia është e jona t'ju ftojmë në dasmën e fëmijëve tanë. Prania juaj do të zbukurojë festën tonë familjare dhe do të jetë nder i madh për ne."
  },
  {
    title: "✨ Moderne & Minimale",
    text: "Po festojmë dashurinë! Eja dhe festo me ne ditën më të bukur të jetës sonë. Presim me padurim të kërcejmë e të gëzohemi së bashku."
  },
  {
    title: "🥂 Festive & Me Humori",
    text: "Muzikë, valle, ushqim i mirë dhe momente të paharrueshme! Ju ftojmë të festojmë bashkimin tonë në një natë fantastike."
  },
  {
    title: "📜 Poetike & Fisnike",
    text: "Nisën hapat e parë drejt një udhëtimi të përbashkët jetësor. Me respekt e gëzim të madh ju presim në festën tonë më të bukur."
  }
];

const TEMPLATE_PREVIEWS: Record<string, {
  bg: string;
  headerBg: string;
  headerOverlay: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  btnBg: string;
  font: string;
  badge: string;
}> = {
  classic: {
    bg: "bg-[#FDF8F3]",
    headerBg: "bg-[#7B1F3A]",
    headerOverlay: "from-[#7B1F3A] via-[#7B1F3A]/70 to-transparent",
    cardBg: "bg-white border-amber-900/10 text-slate-900 shadow-sm",
    textPrimary: "text-[#7B1F3A]",
    textSecondary: "text-slate-700",
    btnBg: "bg-[#7B1F3A] hover:bg-[#60182d] text-white",
    font: "font-serif",
    badge: "Klasike Elegant"
  },
  modern: {
    bg: "bg-slate-50",
    headerBg: "bg-blue-600",
    headerOverlay: "from-blue-700 via-blue-600/80 to-transparent",
    cardBg: "bg-white border-blue-200 text-slate-900 shadow-sm",
    textPrimary: "text-blue-600 font-semibold",
    textSecondary: "text-slate-600",
    btnBg: "bg-blue-600 hover:bg-blue-700 text-white font-sans",
    font: "font-sans",
    badge: "Moderne Minimale"
  },
  floral: {
    bg: "bg-rose-50/80",
    headerBg: "bg-rose-800",
    headerOverlay: "from-rose-900/90 via-rose-800/70 to-transparent",
    cardBg: "bg-white/90 border-rose-200 text-rose-950 shadow-sm",
    textPrimary: "text-rose-700 font-semibold",
    textSecondary: "text-rose-900",
    btnBg: "bg-rose-700 hover:bg-rose-800 text-white",
    font: "font-serif",
    badge: "Florale Romantike"
  },
  minimal: {
    bg: "bg-zinc-950",
    headerBg: "bg-zinc-900",
    headerOverlay: "from-zinc-950 via-zinc-900/90 to-transparent",
    cardBg: "bg-zinc-900 border-yellow-500/30 text-zinc-100 shadow-md",
    textPrimary: "text-yellow-400 font-semibold",
    textSecondary: "text-zinc-300",
    btnBg: "bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-bold",
    font: "font-sans",
    badge: "Minimale Dark"
  },
  luxury: {
    bg: "bg-[#0A1326]",
    headerBg: "bg-[#111E38]",
    headerOverlay: "from-[#0A1326] via-[#111E38]/90 to-transparent",
    cardBg: "bg-[#111E38] border-amber-400/40 text-amber-100 shadow-lg",
    textPrimary: "text-amber-400 font-semibold",
    textSecondary: "text-amber-100/90",
    btnBg: "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold",
    font: "font-serif",
    badge: "Luks Mbretëror"
  }
};

function InvitationTab({ eventId, event }: { eventId: number; event: any }) {
  const qc = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { data: invitation } = useGetInvitation(eventId);
  const { data: guests = [] } = useListGuests(eventId);
  const saveInvitation = useSaveInvitation();
  const sendInvitations = useSendInvitations();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);

  const [form, setForm] = useState({
    coupleName: invitation?.coupleName || event?.name || "",
    message: invitation?.message || "Me kënaqësi ju ftojmë të ndani gëzimin me ne!",
    template: invitation?.template || "classic",
    couplePhoto: (invitation as any)?.couplePhoto || "",
    showCountdown: true,
    showMap: true,
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Ju lutem zgjidhni një skedar imazhi (JPG, PNG...)", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setForm(f => ({ ...f, couplePhoto: dataUrl }));
        toast({ title: "Fotoja e çiftit u ngarkua me sukses!" });
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const activeTheme = TEMPLATE_PREVIEWS[form.template] || TEMPLATE_PREVIEWS.classic;

  const demoUrl = `/rsvp/demo?coupleName=${encodeURIComponent(form.coupleName)}&message=${encodeURIComponent(form.message)}&couplePhoto=${encodeURIComponent(form.couplePhoto)}&date=${encodeURIComponent(event?.date || '')}&venue=${encodeURIComponent(event?.venue || '')}&showCountdown=${form.showCountdown}&template=${encodeURIComponent(form.template)}`;

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

  const applyAiPreset = (preset: typeof AI_INVITATION_PRESETS[0]) => {
    setForm(f => ({ ...f, message: preset.text }));
    setShowAiMenu(false);
    toast({
      title: "✨ Teksti u gjenerua me AI!",
      description: preset.title,
    });
  };

  const generateRandomAi = () => {
    const randomPreset = AI_INVITATION_PRESETS[Math.floor(Math.random() * AI_INVITATION_PRESETS.length)];
    applyAiPreset(randomPreset);
  };

  const TEMPLATES = [
    { value: "classic", label: "Klasike Elegant" },
    { value: "modern", label: "Moderne Minimale" },
    { value: "floral", label: "Florale Romantike" },
    { value: "minimal", label: "Minimale Dark" },
    { value: "luxury", label: "Luks Mbretëror" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top action header for Preview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-serif font-bold text-lg text-[#2d1a1f]">Ftesa Digjitale & Live Preview</h3>
          <p className="text-xs text-slate-500 font-serif">Krijoni, ndryshoni dhe shikoni në kohë reale se si do të duket ftesa për mysafirët tuaj.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPreviewOpen(true)}
            className="bg-[#7B1F3A] hover:bg-[#60182d] text-white rounded-xl text-xs font-serif gap-2 px-4 shadow-sm"
          >
            <Eye className="h-4 w-4" /> Shiko Preview me Dritare të Plotë
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(demoUrl, "_blank")}
            className="rounded-xl border-slate-200 text-xs font-serif gap-2"
          >
            <ExternalLink className="h-4 w-4" /> Hap te Tab i Ri
          </Button>
        </div>
      </div>

      {/* Grid: Left Config Form + Right Live Device Frame Preview */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
              <CardTitle className="font-serif text-lg font-bold text-[#2d1a1f]">Konfiguro Ftesën Digjitale</CardTitle>
              <CardDescription className="text-xs text-slate-500 font-serif">Personalizoni pamjen dhe mesazhin e ftesës.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-500 font-medium">Emri i Çiftit / Titulli</Label>
                <Input
                  className="rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-[#7B1F3A]"
                  value={form.coupleName}
                  onChange={e => setForm(f => ({ ...f, coupleName: e.target.value }))}
                  placeholder="Alban & Zana"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-500 font-medium">Foto e Çiftit</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {form.couplePhoto ? (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0 group">
                      <img src={form.couplePhoto} alt="Couple Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, couplePhoto: "" }))}
                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold"
                        title="Fshi Foton"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex gap-2 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => photoInputRef.current?.click()}
                        className="rounded-xl border-slate-200 text-xs font-serif gap-2 bg-slate-50/50 hover:bg-slate-100 text-slate-700 flex-1 sm:flex-none"
                      >
                        <Upload className="h-4 w-4 text-[#7B1F3A]" /> {form.couplePhoto ? "Ndrysho Foton" : "Zgjidh / Ngarko Foton"}
                      </Button>
                      <input
                        type="file"
                        ref={photoInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                      {form.couplePhoto && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setForm(f => ({ ...f, couplePhoto: "" }))}
                          className="rounded-xl text-xs font-serif text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Fshi
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs uppercase tracking-widest text-slate-500 font-medium">Mesazhi i Ftesës</Label>
                  <div className="relative">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowAiMenu(!showAiMenu)}
                      className="h-7 text-[11px] font-serif bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg gap-1 px-2.5 shadow-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Gjenero me AI
                    </Button>
                    {showAiMenu && (
                      <div className="absolute right-0 top-8 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-purple-100 p-3 space-y-2 font-serif text-xs animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-bold text-purple-900 flex items-center gap-1.5">
                            <Wand2 className="h-3.5 w-3.5 text-purple-600" /> Stilet e AI
                          </span>
                          <Button size="sm" variant="ghost" className="h-6 text-[10px] text-purple-700" onClick={generateRandomAi}>
                            Rastësishme
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-56 overflow-y-auto">
                          {AI_INVITATION_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => applyAiPreset(preset)}
                              className="w-full text-left p-2 rounded-xl hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200"
                            >
                              <p className="font-bold text-slate-900 text-xs">{preset.title}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 font-light">{preset.text}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7B1F3A] resize-none min-h-[120px] font-light leading-relaxed text-slate-900"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Mesazhi i ftesës..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-slate-500 font-medium">Zgjidh Template</Label>
                <Select value={form.template} onValueChange={v => setForm(f => ({ ...f, template: v as any }))}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {TEMPLATES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={form.showCountdown}
                    onChange={e => setForm(f => ({ ...f, showCountdown: e.target.checked }))}
                    className="rounded bg-slate-100 border-slate-300 accent-[#7B1F3A]"
                  />
                  Countdown Timer
                </label>
                <label className="flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={form.showMap}
                    onChange={e => setForm(f => ({ ...f, showMap: e.target.checked }))}
                    className="rounded bg-slate-100 border-slate-300 accent-[#7B1F3A]"
                  />
                  Google Maps
                </label>
              </div>

              <Button onClick={handleSave} disabled={saveInvitation.isPending} className="w-full bg-[#7B1F3A] hover:bg-[#60182d] text-white rounded-xl uppercase tracking-widest text-xs h-11 mt-4 shadow-sm font-semibold">
                {saveInvitation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ruaj Ftesën
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Device Frame Preview Column */}
        <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-4">
          <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-3 bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif text-base font-bold text-[#2d1a1f]">Pamja në Kohë Reale (Mobile Preview)</CardTitle>
                <CardDescription className="text-xs text-slate-500 font-serif">Kështu do të shfaqet ftesa në telefonat e mysafirëve.</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-serif text-[#7B1F3A] border-[#7B1F3A]/30">
                {activeTheme.badge}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 flex justify-center bg-slate-100/70">
              {/* Phone Mockup Frame */}
              <div className="w-[320px] h-[580px] bg-black rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col">
                {/* Phone Speaker Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 shrink-0 z-20" />
                
                {/* Phone Display Content dynamically styled by selected Template */}
                <div className={cn("flex-1 rounded-[28px] overflow-y-auto relative scrollbar-none transition-all duration-300", activeTheme.bg, activeTheme.font)}>
                  {/* Hero Header */}
                  <div className={cn("relative h-44 w-full flex items-end p-4 overflow-hidden", activeTheme.headerBg)}>
                    {form.couplePhoto ? (
                      <img src={form.couplePhoto} alt="Couple" className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}
                    <div className={cn("absolute inset-0 bg-gradient-to-t", activeTheme.headerOverlay)} />
                    <div className="relative z-10 text-white space-y-1">
                      <p className="text-[9px] uppercase tracking-widest text-white/70">Ftesë Personale</p>
                      <h4 className="font-bold text-xl leading-tight text-white">{form.coupleName || "Alban & Zana"}</h4>
                      <p className="text-[10px] text-white/80">{event?.date || "15 Gusht 2026"}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-4 text-center">
                    <div>
                      <p className={cn("text-[10px] uppercase tracking-widest font-bold", activeTheme.textPrimary)}>Ftesë Speciale</p>
                      <h5 className="font-bold text-base mt-1">Të nderuar Mysafirë</h5>
                      <p className={cn("text-xs font-light mt-2 leading-relaxed italic", activeTheme.textSecondary)}>
                        "{form.message || "Me kënaqësi ju ftojmë të ndani gëzimin me ne!"}"
                      </p>
                    </div>

                    {/* Details Box */}
                    <div className={cn("p-3 rounded-xl border text-left space-y-2 text-xs", activeTheme.cardBg)}>
                      <div className="flex items-center gap-2">
                        <CalendarDays className={cn("h-3.5 w-3.5", activeTheme.textPrimary)} />
                        <span className="font-medium text-[11px]">{event?.date || "Shtunë, 15 Gusht 2026"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={cn("h-3.5 w-3.5", activeTheme.textPrimary)} />
                        <span className="text-[11px]">Ora: {event?.time || "19:00"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className={cn("h-3.5 w-3.5", activeTheme.textPrimary)} />
                        <span className="text-[11px] truncate">{event?.venue || "Salla e Dasmave"}</span>
                      </div>
                    </div>

                    {/* RSVP Buttons Demo */}
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">RSVP - Konfirmimi</p>
                      <button className={cn("w-full py-2.5 font-bold text-xs rounded-xl shadow-sm transition-all", activeTheme.btnBg)}>
                        Po, do të vij →
                      </button>
                      <button className="w-full py-2 bg-slate-100 text-slate-600 text-xs rounded-xl border border-slate-200">
                        Jo, nuk vij
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WhatsApp & Viber Section */}
      <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
          <CardTitle className="font-serif text-lg font-bold text-[#2d1a1f] flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#7B1F3A]" /> Dërgo Ftesat në WhatsApp & Viber
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 font-serif">
            Dërgoni ftesat personale tek secili mysafir me 1-klikim përmes WhatsApp ose Viber.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-serif text-slate-600 font-medium">{guests.length} mysafirë në këtë event</span>
            <Button
              size="sm" variant="outline"
              className="text-xs font-serif rounded-xl border-slate-200 hover:bg-slate-100"
              onClick={() => {
                const text = `Ftesat për ${event?.name || 'event'}:\n` + guests.map((g: any) => `${g.firstName} ${g.lastName}: ${window.location.origin}/rsvp/${g.rsvpToken}`).join("\n");
                navigator.clipboard.writeText(text);
                toast({ title: "Të gjithë linkat e RSVP u kopjuan!" });
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Kopjo Të Gjitha Ftesat
            </Button>
          </div>

          {guests.length === 0 ? (
            <p className="text-xs text-slate-400 font-serif italic py-4 text-center">Nuk ka ende mysafirë në këtë event. Shtoni mysafirë te tab-i "Mysafirët".</p>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {guests.map((g: any) => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-xs font-serif font-bold text-slate-900">{g.firstName} {g.lastName}</p>
                    <p className="text-[11px] text-slate-400 font-serif">{g.phone || "Pa telefon"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-8 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1 px-3 shadow-sm"
                      onClick={() => sendViaWhatsApp(g, event?.name || "")}
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-1 px-3 shadow-sm"
                      onClick={() => sendViaViber(g, event?.name || "")}
                    >
                      <ViberIcon className="h-3.5 w-3.5" /> Viber
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
          <CardTitle className="font-serif text-xl font-bold text-[#2d1a1f]">Dërgo Ftesat masive (Email)</CardTitle>
          <CardDescription className="text-xs text-slate-500 font-serif">Dërgo ftesën me link unik RSVP tek të gjithë mysafirët në pritje me email.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            onClick={handleSend}
            disabled={sendInvitations.isPending}
            className="w-full rounded-xl uppercase tracking-widest text-xs h-11 border-[#7B1F3A] text-[#7B1F3A] hover:bg-[#7B1F3A]/5 font-medium"
            variant="outline"
          >
            {sendInvitations.isPending
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Duke dërguar...</>
              : <><Send className="mr-2 h-4 w-4" /> Dërgo Ftesat me Email</>
            }
          </Button>
        </CardContent>
      </Card>

      {/* Full Screen Live Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 border-slate-200 bg-white rounded-2xl overflow-hidden flex flex-col">
          <DialogHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between shrink-0 bg-slate-50">
            <div>
              <DialogTitle className="font-serif text-lg font-bold text-[#2d1a1f]">Preview e Plotë e Ftesës Digjitale</DialogTitle>
              <p className="text-xs text-slate-500 font-serif">Kështu e shohin ftesën mysafirët tuaj kur hapin linkun RSVP.</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5" onClick={() => window.open(demoUrl, "_blank")}>
              <ExternalLink className="h-3.5 w-3.5" /> Dritare e Re
            </Button>
          </DialogHeader>
          <div className="flex-1 w-full h-full bg-slate-100 overflow-hidden">
            <iframe
              src={demoUrl}
              className="w-full h-full border-0"
              title="Invitation Live Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
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
