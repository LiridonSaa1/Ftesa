import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  CreditCard, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  LogOut,
  Menu,
  Sparkles
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useLanguage, LanguageSelector } from "@/lib/i18n";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <span
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 border",
          active 
            ? "text-white font-medium bg-primary/10 border-primary/30 shadow-[inset_0_0_15px_rgba(217,56,94,0.15)] relative after:absolute after:right-3 after:top-1/2 after:-translate-y-1/2 after:h-1.5 after:w-1.5 after:bg-primary after:rounded-full" 
            : "text-muted-foreground border-transparent hover:bg-white/5 hover:text-foreground hover:border-white/10"
        )}
      >
        {icon}
        {label}
      </span>
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const { data: me } = useQuery({
    queryKey: ["user-status"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json() as Promise<{ role: string }>;
    },
    staleTime: 30_000,
  });

  const isAdmin = user?.publicMetadata?.role === "admin" || me?.role === "admin";

  const navItems = [
    { href: "/dashboard", label: t("nav.dashboard", "Dashboard"), icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/events", label: t("nav.events", "Eventet e mia"), icon: <CalendarDays className="h-4 w-4" /> },
    { href: "/subscription", label: t("nav.subscription", "Abonimi"), icon: <CreditCard className="h-4 w-4" /> },
    { href: "/settings", label: t("nav.settings", "Profil & Cilësime"), icon: <SettingsIcon className="h-4 w-4" /> },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin", label: t("nav.admin", "Admin Panel"), icon: <ShieldCheck className="h-4 w-4" /> });
  }

  const SidebarContent = () => (
    <div className="flex h-full max-h-screen flex-col gap-2 relative overflow-hidden bg-white border-r border-slate-200 text-slate-900 transition-colors">
      <div className="flex h-20 items-center justify-between px-6 relative z-10 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm" style={{ background: "linear-gradient(135deg, #7B1F3A, #a82e50)" }}>N</div>
          <span className="font-serif font-bold text-xl tracking-wide text-[#2d1a1f]">NoaEvent</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-6 relative z-10">
        <nav className="grid items-start px-4 text-sm font-medium space-y-2">
          {navItems.map((item) => {
            const active = location.startsWith(item.href) && (item.href !== "/events" || location === "/events" || location.startsWith("/events/"));
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 border",
                    active
                      ? "text-white font-medium bg-[#7B1F3A] border-[#7B1F3A] shadow-sm relative after:absolute after:right-3 after:top-1/2 after:-translate-y-1/2 after:h-1.5 after:w-1.5 after:bg-white after:rounded-full"
                      : "text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-slate-200 relative z-10 bg-slate-50 space-y-3">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 shadow-sm">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <div className="w-8 h-8 rounded-full bg-[#7B1F3A]/10 border border-[#7B1F3A]/30 flex items-center justify-center text-[#7B1F3A] font-medium text-xs shrink-0">
              {user?.firstName?.charAt(0) || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold truncate text-slate-900">{user?.fullName || user?.firstName}</span>
              <span className="text-[10px] truncate text-slate-500">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
          </div>
          <LanguageSelector isDark={false} />
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start transition-colors rounded-xl h-10 text-slate-600 hover:text-rose-700 hover:bg-rose-50"
          onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("nav.logout", "Dil nga llogaria")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid h-[100dvh] w-full md:grid-cols-[280px_1fr] overflow-hidden bg-white text-slate-900 light">
      <aside className="hidden md:block h-full overflow-hidden border-r border-slate-200 sticky top-0">
        <SidebarContent />
      </aside>
      <div className="flex flex-col h-full overflow-hidden relative z-0 bg-white">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white text-slate-900 px-4 md:hidden shrink-0 z-50">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden hover:bg-slate-100 text-slate-900">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r border-slate-200 bg-white text-slate-900 light">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm" style={{ background: "linear-gradient(135deg, #7B1F3A, #a82e50)" }}>N</div>
              <span className="font-serif font-bold text-lg tracking-wide text-slate-900">NoaEvent</span>
            </Link>
          </div>
          <LanguageSelector isDark={false} />
        </header>
        <main className="flex-1 overflow-y-auto relative bg-slate-50/50 p-4 md:p-8 lg:p-10">
          <div className="w-full max-w-8xl max-w-[1440px] mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

