import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PiggyBank, Plus, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import type { Saving } from "@shared/schema";

const typeColors: Record<string, string> = {
  refund: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  price_adjustment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warranty_claim: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const typeLabels: Record<string, string> = {
  refund: "Refund",
  price_adjustment: "Price Adjustment",
  warranty_claim: "Warranty Claim",
};

const PIE_COLORS = ["hsl(200, 70%, 45%)", "hsl(160, 54%, 38%)", "hsl(270, 50%, 50%)"];

export default function SavingsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: savingsList, isLoading } = useQuery<Saving[]>({
    queryKey: ["/api/savings"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/savings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDialogOpen(false);
      toast({ title: "Saving logged" });
    },
  });

  const totalSaved = savingsList?.reduce((sum, s) => sum + s.amount, 0) ?? 0;
  const claimCount = savingsList?.length ?? 0;

  // Monthly chart data
  const monthlyData = (() => {
    if (!savingsList) return [];
    const months: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    savingsList.forEach((s) => {
      const d = new Date(s.savedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + s.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, amount]) => {
        const [, m] = key.split("-");
        return { month: monthNames[parseInt(m)], amount: Math.round(amount * 100) / 100 };
      });
  })();

  // Pie chart data
  const breakdownData = (() => {
    if (!savingsList) return [];
    const byType: Record<string, number> = {};
    savingsList.forEach((s) => {
      byType[s.type] = (byType[s.type] || 0) + s.amount;
    });
    return Object.entries(byType).map(([type, value]) => ({
      name: typeLabels[type] || type,
      value: Math.round(value * 100) / 100,
    }));
  })();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold" data-testid="text-savings-title">Savings</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" data-testid="button-log-saving">
              <Plus className="h-4 w-4" /> Log Saving
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log a Saving</DialogTitle>
            </DialogHeader>
            <LogSavingForm
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Total savings hero */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <PiggyBank className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-4xl font-bold text-primary" data-testid="text-total-saved">
            ${totalSaved.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Across {claimCount} successful claim{claimCount !== 1 ? "s" : ""} this year
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
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
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Savings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {breakdownData.length > 0 ? (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {breakdownData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`$${value.toFixed(2)}`]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
            )}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {breakdownData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{entry.name}: ${entry.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent savings table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Savings</CardTitle>
        </CardHeader>
        <CardContent>
          {(savingsList ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No savings recorded yet</p>
          ) : (
            <div className="space-y-3">
              {(savingsList ?? []).map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40" data-testid={`card-saving-${s.id}`}>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {s.store[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{s.store}</span>
                      <Badge className={`${typeColors[s.type] || ""} border-0 text-[10px]`}>
                        {typeLabels[s.type] || s.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      +${s.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LogSavingForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    store: "",
    type: "price_adjustment",
    amount: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      store: form.store,
      type: form.type,
      amount: parseFloat(form.amount),
      description: form.description,
      savedAt: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="s-store">Store *</Label>
        <Input id="s-store" value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} required data-testid="input-saving-store" />
      </div>
      <div>
        <Label htmlFor="s-type">Type *</Label>
        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
          <SelectTrigger data-testid="select-saving-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="refund">Refund</SelectItem>
            <SelectItem value="price_adjustment">Price Adjustment</SelectItem>
            <SelectItem value="warranty_claim">Warranty Claim</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="s-amount">Amount *</Label>
        <Input id="s-amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required data-testid="input-saving-amount" />
      </div>
      <div>
        <Label htmlFor="s-desc">Description *</Label>
        <Input id="s-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required data-testid="input-saving-description" />
      </div>
      <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-saving">
        {isPending ? "Saving..." : "Log Saving"}
      </Button>
    </form>
  );
}
