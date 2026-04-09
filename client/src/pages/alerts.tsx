import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  TrendingDown,
  Shield,
  DollarSign,
  Eye,
  CheckCircle2,
  ClipboardCheck,
  Bell,
} from "lucide-react";
import type { Alert, ClaimItem } from "@shared/schema";

const alertTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  return_window: { icon: Clock, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Return Window" },
  price_drop: { icon: TrendingDown, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "Price Drop" },
  warranty: { icon: Shield, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", label: "Warranty" },
  refund_opportunity: { icon: DollarSign, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "Refund Opportunity" },
};

const checklistTemplates: Record<string, string[]> = {
  return_window: [
    "Locate original packaging",
    "Find receipt or order confirmation email",
    "Check item condition meets return policy",
    "Initiate return online or in-store",
    "Ship or drop off item before deadline",
    "Confirm refund received within 5-10 business days",
  ],
  price_drop: [
    "Screenshot current lower price with date visible",
    "Log into your store account",
    "Check store's price adjustment policy",
    "Contact customer service (chat or phone)",
    "Request price adjustment with proof",
    "Confirm credit applied to your payment method",
  ],
  warranty: [
    "Locate warranty card or registration confirmation",
    "Document the issue with photos or video",
    "Gather proof of purchase (receipt/order email)",
    "Contact manufacturer support",
    "Provide all required documentation",
    "Follow claim instructions and track status",
  ],
  refund_opportunity: [
    "Review the store's refund/price match policy",
    "Gather proof of purchase",
    "Document the price difference or issue",
    "Contact customer service with details",
    "Submit formal request if required",
    "Follow up within 48 hours if no response",
  ],
};

export default function AlertsPage() {
  const [filter, setFilter] = useState("all");
  const [checklistDialog, setChecklistDialog] = useState<{ alert: Alert } | null>(null);
  const { toast } = useToast();

  const { data: alertsList, isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/alerts/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const filtered = (alertsList ?? []).filter((a) => {
    if (filter === "unread") return !a.isRead;
    if (filter === "return_window") return a.type === "return_window";
    if (filter === "price_drop") return a.type === "price_drop";
    if (filter === "warranty") return a.type === "warranty";
    if (filter === "refund_opportunity") return a.type === "refund_opportunity";
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-xl font-semibold" data-testid="text-alerts-title">Alerts</h1>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all" data-testid="tab-alerts-all">All</TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-alerts-unread">Unread</TabsTrigger>
          <TabsTrigger value="return_window" data-testid="tab-alerts-return">Return Windows</TabsTrigger>
          <TabsTrigger value="price_drop" data-testid="tab-alerts-price">Price Drops</TabsTrigger>
          <TabsTrigger value="warranty" data-testid="tab-alerts-warranty">Warranty</TabsTrigger>
          <TabsTrigger value="refund_opportunity" data-testid="tab-alerts-refund">Refund</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No alerts to show</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const config = alertTypeConfig[alert.type] || alertTypeConfig.refund_opportunity;
            const Icon = config.icon;
            return (
              <Card key={alert.id} className={!alert.isRead ? "border-l-2 border-l-primary" : ""} data-testid={`card-alert-${alert.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{alert.title}</span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className={`text-[10px] border-0 ${config.color}`}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => markReadMutation.mutate(alert.id)}
                          data-testid={`button-mark-read-${alert.id}`}
                        >
                          <Eye className="h-3 w-3 mr-1" /> Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setChecklistDialog({ alert })}
                        data-testid={`button-checklist-${alert.id}`}
                      >
                        <ClipboardCheck className="h-3 w-3 mr-1" /> Checklist
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Claim Checklist Dialog */}
      {checklistDialog && (
        <ClaimChecklistDialog
          alert={checklistDialog.alert}
          open={!!checklistDialog}
          onOpenChange={(open) => !open && setChecklistDialog(null)}
        />
      )}
    </div>
  );
}

function ClaimChecklistDialog({
  alert,
  open,
  onOpenChange,
}: {
  alert: Alert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const purchaseId = alert.purchaseId;

  const { data: existingItems } = useQuery<ClaimItem[]>({
    queryKey: ["/api/purchases", purchaseId, "claims"],
    enabled: !!purchaseId,
    queryFn: async () => {
      if (!purchaseId) return [];
      const res = await apiRequest("GET", `/api/purchases/${purchaseId}/claims`);
      return res.json();
    },
  });

  const createItemsMutation = useMutation({
    mutationFn: async (items: string[]) => {
      for (let i = 0; i < items.length; i++) {
        await apiRequest("POST", `/api/purchases/${purchaseId}/claims`, {
          label: items[i],
          isCompleted: false,
          order: i,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases", purchaseId, "claims"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      await apiRequest("PATCH", `/api/claims/${id}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases", purchaseId, "claims"] });
    },
  });

  const templateItems = checklistTemplates[alert.type] || checklistTemplates.refund_opportunity;
  const hasItems = existingItems && existingItems.length > 0;

  // Auto-create items if none exist
  if (purchaseId && existingItems && existingItems.length === 0 && !createItemsMutation.isPending && !createItemsMutation.isSuccess) {
    createItemsMutation.mutate(templateItems);
  }

  const displayItems = hasItems ? existingItems : templateItems.map((label, i) => ({
    id: i,
    purchaseId: purchaseId || 0,
    label,
    isCompleted: false,
    order: i,
  }));

  const completed = displayItems?.filter(i => i.isCompleted).length ?? 0;
  const total = displayItems?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Claim Checklist
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">{alert.title}</p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{completed}/{total}</span>
        </div>
        <div className="space-y-3">
          {displayItems?.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 cursor-pointer group"
              data-testid={`claim-item-${item.id}`}
            >
              <Checkbox
                checked={item.isCompleted ?? false}
                onCheckedChange={(checked) => {
                  if (hasItems && typeof item.id === "number") {
                    toggleMutation.mutate({ id: item.id, isCompleted: !!checked });
                  }
                }}
                data-testid={`checkbox-claim-${item.id}`}
              />
              <span className={`text-sm leading-snug ${item.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
