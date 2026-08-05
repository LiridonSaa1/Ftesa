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
  Menu
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
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
          active ? "bg-muted text-primary font-medium" : "text-muted-foreground"
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

  const isAdmin = user?.publicMetadata?.role === "admin"; // Check clerk public metadata or custom API hook.
  
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
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex items-center rounded-lg bg-[#111] px-2 py-1">
            <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.png`} alt="NoaInvite" className="h-6 w-auto" />
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
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
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.fullName || user?.firstName}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground mt-2" 
          onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Dil
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] bg-background">
      <div className="hidden border-r bg-muted/40 md:block">
        <SidebarContent />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1 flex justify-center">
             <Link href="/">
               <span className="inline-flex items-center rounded-lg bg-[#111] px-2 py-1">
                 <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.png`} alt="NoaInvite" className="h-6 w-auto" />
               </span>
             </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
