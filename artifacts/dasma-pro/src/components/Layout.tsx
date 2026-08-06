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
import { cn } from "@/lib/utils";

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
          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-300",
          active 
            ? "text-primary font-medium bg-primary/10 relative after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-4 after:w-[2px] after:bg-primary after:rounded-r" 
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
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

  const isAdmin = user?.publicMetadata?.role === "admin"; 
  
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/events", label: "Eventet e mia", icon: <CalendarDays className="h-4 w-4" /> },
    { href: "/subscription", label: "Abonimi", icon: <CreditCard className="h-4 w-4" /> },
    { href: "/settings", label: "Kufizimet", icon: <SettingsIcon className="h-4 w-4" /> },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin", label: "Admin Panel", icon: <ShieldCheck className="h-4 w-4" /> });
  }

  const SidebarContent = () => (
    <div className="flex h-full max-h-screen flex-col gap-2 relative overflow-hidden bg-background border-r border-border">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="flex h-20 items-center px-6 relative z-10">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg" style={{ background: "linear-gradient(135deg, #C9A96E, #8B6914)" }}>N</div>
          <span className="font-serif font-bold text-lg" style={{ color: "#1a0808" }}>NoaEvent</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-6 relative z-10">
        <nav className="grid items-start px-4 text-sm font-medium space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={location.startsWith(item.href)}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-4 border-t border-border relative z-10 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-medium text-xs">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{user?.fullName || user?.firstName}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-md" 
          onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Dil nga llogaria
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[260px_1fr] bg-background">
      <div className="hidden md:block">
        <SidebarContent />
      </div>
      <div className="flex flex-col relative z-0">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 md:hidden sticky top-0 z-50">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 md:hidden hover:bg-white/5">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r border-border">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1 flex justify-center pr-10">
            <Link href="/">
              <img src="/NoaEvent_logo.png" alt="NoaEvent" className="h-9 w-auto object-contain" />
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col p-4 md:p-8 lg:p-12 overflow-y-auto relative">
          <div className="max-w-6xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
