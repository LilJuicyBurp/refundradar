import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingBag,
  Bell,
  Clock,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { Alert, Purchase, Saving } from "@shared/schema";

interface DashboardData {
  totalSavings: number;
  activePurchases: number;
  pendingAlerts: number;
  upcomingDeadlines: number;
  recentAlerts: Alert[];
}

const alertTypeColors: Record<string, string> = {
  return_window: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  price_drop: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warranty: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  refund_opportunity: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const alertTypeLabels: Record<string, string> = {
  return_window: "Return",
  price_drop: "Price Drop",
  warranty: "Warranty",
  refund_opportunity: "Refund",
};

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const days = getDaysUntil(deadline);
  if (days === null) return null;
  if (days < 0) return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
  if (days <= 3) return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">{days}d left</Badge>;
  if (days <= 7) return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">{days}d left</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">{days}d left</Badge>;
}

export default function Dashboard() {
  const { data: dashboard, isLoading: dashLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const { data: purchasesAll, isLoading: purchLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });

  const { data: savingsAll } = useQuery<Saving[]>({
    queryKey: ["/api/savings"],
  });

  // Build monthly savings data for chart
  const monthlyData = (() => {
    if (!savingsAll) return [];
    const months: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    savingsAll.forEach((s) => {
      const d = new Date(s.savedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const label = monthNames[d.getMonth()];
      months[key] = (months[key] || 0) + s.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, amount]) => {
        const [, m] = key.split("-");
        return { month: monthNames[parseInt(m)], amount: Math.round(amount * 100) / 100 };
      });
  })();

  const recentPurchases = purchasesAll?.filter(p => p.status === "active").slice(0, 4) ?? [];

  if (dashLoading || purchLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3"><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
          <Card className="lg:col-span-2"><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Saved",
      value: `$${(dashboard?.totalSavings ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Active Purchases",
      value: dashboard?.activePurchases ?? 0,
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Pending Alerts",
      value: dashboard?.pendingAlerts ?? 0,
      icon: Bell,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      pulse: (dashboard?.pendingAlerts ?? 0) > 0,
    },
    {
      label: "Upcoming Deadlines",
      value: dashboard?.upcomingDeadlines ?? 0,
      icon: Clock,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {dashboard ? "Alex" : "..."}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} data-testid={`card-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{s.value}</span>
                {s.pulse && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Purchases overview */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Purchases</CardTitle>
                <Link href="/purchases">
                  <Button variant="ghost" size="sm" className="text-xs" data-testid="button-view-all-purchases">
                    View All <ArrowIcon />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPurchases.map((p) => {
                const items = JSON.parse(p.items);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                    data-testid={`card-purchase-${p.id}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {p.store[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.store}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {items.map((i: any) => i.name).join(", ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">${p.totalAmount.toFixed(2)}</p>
                      <DeadlineBadge deadline={p.returnDeadline} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Savings chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Monthly Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Saved"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="amount" fill="hsl(160 54% 38%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No savings data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent alerts */}
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Recent Alerts</CardTitle>
                <Link href="/alerts">
                  <Button variant="ghost" size="sm" className="text-xs" data-testid="button-view-all-alerts">
                    View All <ArrowIcon />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(dashboard?.recentAlerts ?? []).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/40"
                  data-testid={`card-alert-${alert.id}`}
                >
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 mt-0.5 border-0 ${alertTypeColors[alert.type] || ""}`}
                  >
                    {alertTypeLabels[alert.type] || alert.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.message}</p>
                  </div>
                  {!alert.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}
