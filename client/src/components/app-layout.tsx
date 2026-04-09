import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LogoWithText } from "./logo";
import { useTheme } from "./theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  ShoppingBag,
  Bell,
  PiggyBank,
  Settings,
  CreditCard,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import type { User } from "@shared/schema";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/purchases", label: "Purchases", icon: ShoppingBag },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/savings", label: "Savings", icon: PiggyBank },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/billing", label: "Billing", icon: CreditCard },
];

function NavContent({ unreadAlerts }: { unreadAlerts: number }) {
  const [location] = useLocation();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = location === item.path;
        const Icon = item.icon;
        return (
          <Link key={item.path} href={item.path}>
            <div
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
              {item.label === "Alerts" && unreadAlerts > 0 && (
                <Badge
                  data-testid="badge-unread-alerts"
                  variant={isActive ? "secondary" : "default"}
                  className="ml-auto h-5 min-w-5 px-1.5 text-xs"
                >
                  {unreadAlerts}
                </Badge>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

function UserSection({ user }: { user: User & { unreadAlerts: number } }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="px-3 pb-4">
      <Separator className="mb-4" />
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
          className="h-8 w-8 p-0"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {user.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" data-testid="text-user-name">{user.name}</p>
          <Badge
            data-testid="badge-user-plan"
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 uppercase font-bold"
          >
            {user.plan === "premium" ? "PRO" : "FREE"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: user } = useQuery<User & { unreadAlerts: number }>({
    queryKey: ["/api/me"],
  });

  const unreadAlerts = user?.unreadAlerts ?? 0;

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-sidebar border-r border-sidebar-border shrink-0">
        <div className="px-4 py-5">
          <LogoWithText size={28} />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <NavContent unreadAlerts={unreadAlerts} />
        </div>
        {user && <UserSection user={user} />}
      </aside>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-sidebar">
          <LogoWithText size={24} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 pt-6">
              <div className="px-4 pb-4">
                <LogoWithText size={28} />
              </div>
              <NavContent unreadAlerts={unreadAlerts} />
              {user && (
                <div className="mt-auto pt-4">
                  <UserSection user={user} />
                </div>
              )}
            </SheetContent>
          </Sheet>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
