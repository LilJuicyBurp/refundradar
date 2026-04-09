import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Bell,
  FileText,
  Download,
  Trash2,
  Chrome,
  CheckCircle2,
  Shield,
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: user } = useQuery<UserType & { unreadAlerts: number }>({
    queryKey: ["/api/me"],
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    returnReminders: true,
    returnDaysBefore: 3,
    priceDropThreshold: 10,
    warrantyReminders: true,
  });

  const [parsing, setParsing] = useState({
    defaultReturnDays: 30,
    autoDetectWarranty: true,
  });

  const handleExport = () => {
    toast({ title: "Export started", description: "Your purchases CSV will download shortly." });
  };

  const handleDeleteData = () => {
    toast({ title: "Data deletion", description: "This would delete all data in production.", variant: "destructive" });
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-xl font-semibold" data-testid="text-settings-title">Settings</h1>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={user?.name || ""} readOnly data-testid="input-settings-name" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} readOnly data-testid="input-settings-email" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Plan:</span>
            <Badge
              data-testid="badge-settings-plan"
              className={
                user?.plan === "premium"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {user?.plan === "premium" ? "PREMIUM" : "FREE"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Gmail Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Gmail Connection
          </CardTitle>
          <CardDescription>
            We only read purchase-related emails to detect receipts. We never read, store, or share your personal emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">Gmail Connected</span>
              <span className="text-xs text-muted-foreground">(alex@example.com)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast({ title: "Disconnected", description: "Gmail sync has been paused." })}
              data-testid="button-disconnect-gmail"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Alerts</p>
              <p className="text-xs text-muted-foreground">Receive alerts via email</p>
            </div>
            <Switch
              checked={notifications.emailAlerts}
              onCheckedChange={(v) => setNotifications({ ...notifications, emailAlerts: v })}
              data-testid="switch-email-alerts"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Return Window Reminders</p>
              <p className="text-xs text-muted-foreground">Get notified before return deadlines</p>
            </div>
            <Switch
              checked={notifications.returnReminders}
              onCheckedChange={(v) => setNotifications({ ...notifications, returnReminders: v })}
              data-testid="switch-return-reminders"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs shrink-0">Days before deadline</Label>
            <Input
              type="number"
              className="w-20 h-8 text-sm"
              value={notifications.returnDaysBefore}
              onChange={(e) => setNotifications({ ...notifications, returnDaysBefore: parseInt(e.target.value) || 3 })}
              data-testid="input-return-days"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Price Drop Threshold</p>
              <p className="text-xs text-muted-foreground">Minimum price drop to trigger an alert</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm">$</span>
              <Input
                type="number"
                className="w-20 h-8 text-sm"
                value={notifications.priceDropThreshold}
                onChange={(e) => setNotifications({ ...notifications, priceDropThreshold: parseInt(e.target.value) || 10 })}
                data-testid="input-price-threshold"
              />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Warranty Reminders</p>
              <p className="text-xs text-muted-foreground">Get notified about warranty milestones</p>
            </div>
            <Switch
              checked={notifications.warrantyReminders}
              onCheckedChange={(v) => setNotifications({ ...notifications, warrantyReminders: v })}
              data-testid="switch-warranty-reminders"
            />
          </div>
        </CardContent>
      </Card>

      {/* Receipt Parsing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Receipt Parsing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="text-sm shrink-0">Default return window (days)</Label>
            <Input
              type="number"
              className="w-20 h-8 text-sm"
              value={parsing.defaultReturnDays}
              onChange={(e) => setParsing({ ...parsing, defaultReturnDays: parseInt(e.target.value) || 30 })}
              data-testid="input-default-return"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-detect warranty length</p>
              <p className="text-xs text-muted-foreground">Automatically detect warranty from manufacturer info</p>
            </div>
            <Switch
              checked={parsing.autoDetectWarranty}
              onCheckedChange={(v) => setParsing({ ...parsing, autoDetectWarranty: v })}
              data-testid="switch-auto-warranty"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="gap-2" onClick={handleExport} data-testid="button-export-csv">
            <Download className="h-4 w-4" /> Export Purchases (CSV)
          </Button>
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={handleDeleteData} data-testid="button-delete-data">
            <Trash2 className="h-4 w-4" /> Delete All Data
          </Button>
        </CardContent>
      </Card>

      {/* Browser Extension */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Chrome className="h-4 w-4" /> Browser Extension
          </CardTitle>
          <CardDescription>
            The RefundRadar Chrome Extension compares prices in real-time while you browse and automatically checks for price drops on your purchases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="gap-2"
            onClick={() => toast({ title: "Coming soon", description: "The Chrome extension is currently in beta." })}
            data-testid="button-download-extension"
          >
            <Download className="h-4 w-4" /> Download Chrome Extension
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
