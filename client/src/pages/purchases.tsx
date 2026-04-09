import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, RotateCcw, ClipboardList } from "lucide-react";
import type { Purchase } from "@shared/schema";

function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DeadlinePill({ deadline, status }: { deadline: string | null; status: string }) {
  if (status === "expired" || status === "returned" || status === "claimed") {
    return null;
  }
  const days = getDaysUntil(deadline);
  if (days === null) return <span className="text-xs text-muted-foreground">No deadline</span>;
  if (days < 0) return <Badge variant="outline" className="text-muted-foreground text-xs">Expired</Badge>;
  if (days <= 3) return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-xs">{days}d left</Badge>;
  if (days <= 7) return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-xs">{days}d left</Badge>;
  return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-xs">{days}d left</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    returned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    claimed: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    expired: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <Badge className={`${styles[status] || styles.active} border-0 text-xs capitalize`}>
      {status}
    </Badge>
  );
}

export default function PurchasesPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: purchases, isLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/purchases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Purchase deleted" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/purchases/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Purchase updated" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/purchases", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDialogOpen(false);
      toast({ title: "Purchase added" });
    },
  });

  const filtered = (purchases ?? []).filter((p) => {
    if (filter === "active") return p.status === "active";
    if (filter === "expiring") {
      const days = getDaysUntil(p.returnDeadline);
      return p.status === "active" && days !== null && days >= 0 && days <= 7;
    }
    if (filter === "closed") return p.status === "returned" || p.status === "claimed" || p.status === "expired";
    return true;
  }).filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.store.toLowerCase().includes(q) || p.items.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold" data-testid="text-purchases-title">Purchases</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" data-testid="button-add-purchase">
              <Plus className="h-4 w-4" /> Add Purchase
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Purchase</DialogTitle>
            </DialogHeader>
            <AddPurchaseForm
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active">Active</TabsTrigger>
            <TabsTrigger value="expiring" data-testid="tab-expiring">Expiring Soon</TabsTrigger>
            <TabsTrigger value="closed" data-testid="tab-closed">Returned/Claimed</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search purchases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-purchases"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingBagIcon />
            <p className="text-muted-foreground mt-2">No purchases found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            let items: any[] = [];
            try { items = JSON.parse(p.items); } catch {}
            return (
              <Card key={p.id} data-testid={`card-purchase-${p.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                      {p.store[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{p.store}</span>
                        <StatusBadge status={p.status} />
                        {p.orderNumber && (
                          <span className="text-xs text-muted-foreground">#{p.orderNumber}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        {items.map((i) => i.name).join(", ")}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>Purchased {new Date(p.purchaseDate).toLocaleDateString()}</span>
                        {p.returnDeadline && (
                          <span className="flex items-center gap-1">
                            Return by {new Date(p.returnDeadline).toLocaleDateString()}
                            <DeadlinePill deadline={p.returnDeadline} status={p.status} />
                          </span>
                        )}
                        {p.warrantyEnd && (
                          <span>Warranty until {new Date(p.warrantyEnd).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">${p.totalAmount.toFixed(2)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {p.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => updateStatusMutation.mutate({ id: p.id, status: "returned" })}
                            data-testid={`button-return-${p.id}`}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" /> Return
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(p.id)}
                          data-testid={`button-delete-${p.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
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

function AddPurchaseForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    store: "",
    totalAmount: "",
    purchaseDate: "",
    returnDeadline: "",
    warrantyEnd: "",
    orderNumber: "",
    itemName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      store: form.store,
      items: JSON.stringify([{ name: form.itemName || "Item", quantity: 1, price: parseFloat(form.totalAmount) }]),
      totalAmount: parseFloat(form.totalAmount),
      purchaseDate: form.purchaseDate,
      returnDeadline: form.returnDeadline || undefined,
      warrantyEnd: form.warrantyEnd || undefined,
      orderNumber: form.orderNumber || undefined,
      status: "active",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="store">Store *</Label>
          <Input id="store" value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} required data-testid="input-store" />
        </div>
        <div>
          <Label htmlFor="totalAmount">Amount *</Label>
          <Input id="totalAmount" type="number" step="0.01" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} required data-testid="input-amount" />
        </div>
      </div>
      <div>
        <Label htmlFor="itemName">Item Name</Label>
        <Input id="itemName" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} data-testid="input-item-name" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchaseDate">Purchase Date *</Label>
          <Input id="purchaseDate" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} required data-testid="input-purchase-date" />
        </div>
        <div>
          <Label htmlFor="returnDeadline">Return Deadline</Label>
          <Input id="returnDeadline" type="date" value={form.returnDeadline} onChange={(e) => setForm({ ...form, returnDeadline: e.target.value })} data-testid="input-return-deadline" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="warrantyEnd">Warranty End</Label>
          <Input id="warrantyEnd" type="date" value={form.warrantyEnd} onChange={(e) => setForm({ ...form, warrantyEnd: e.target.value })} data-testid="input-warranty-end" />
        </div>
        <div>
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input id="orderNumber" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} data-testid="input-order-number" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-purchase">
        {isPending ? "Adding..." : "Add Purchase"}
      </Button>
    </form>
  );
}

function ShoppingBagIcon() {
  return (
    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
      <ClipboardList className="h-6 w-6 text-muted-foreground" />
    </div>
  );
}
