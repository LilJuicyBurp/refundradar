import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Zap,
  CreditCard,
  Crown,
  Star,
} from "lucide-react";
import type { User } from "@shared/schema";

const freeFeatures = [
  "25 purchases/month",
  "Basic return alerts",
  "Return deadline tracking",
  "Manual purchase entry",
];

const premiumFeatures = [
  "Unlimited purchases",
  "Gmail auto-sync",
  "Price drop tracking",
  "Warranty manager",
  "Priority alerts",
  "Claim checklists",
  "Browser extension",
  "Email support",
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period. No cancellation fees apply.",
  },
  {
    q: "Is my email data secure?",
    a: "Absolutely. We only scan for purchase receipts and never read, store, or share your personal emails. All data is encrypted in transit and at rest. We're SOC 2 compliant.",
  },
  {
    q: "What counts as a saved purchase?",
    a: "Any successful refund, price adjustment, or warranty claim that results in money back to you. We track the exact amount saved for each claim.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — we offer a 30-day money-back guarantee on all premium plans. If RefundRadar doesn't save you money, we'll refund your subscription.",
  },
];

export default function BillingPage() {
  const { toast } = useToast();
  const { data: user } = useQuery<User & { unreadAlerts: number }>({
    queryKey: ["/api/me"],
  });

  const isPremium = user?.plan === "premium";

  const handleUpgrade = (plan: string) => {
    toast({
      title: "Stripe integration required",
      description: `In production, this would redirect to Stripe checkout for the ${plan} plan.`,
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h1 className="text-xl font-semibold" data-testid="text-billing-title">Billing</h1>

      {/* Current plan */}
      <Card className={isPremium ? "border-primary/30 bg-primary/5" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              {isPremium ? <Crown className="h-4 w-4 text-primary" /> : <CreditCard className="h-4 w-4" />}
              Current Plan
            </CardTitle>
            <Badge
              data-testid="badge-current-plan"
              className={
                isPremium
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }
            >
              {isPremium ? "PREMIUM" : "FREE"}
            </Badge>
          </div>
          {isPremium && (
            <CardDescription>
              Your premium subscription is active. Next billing date: May 8, 2026.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(isPremium ? premiumFeatures : freeFeatures).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {isPremium && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => toast({ title: "Cancellation", description: "This would initiate cancellation in production." })}
                data-testid="button-cancel-subscription"
              >
                Cancel Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade options */}
      {!isPremium && (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-1">Upgrade to Premium</h2>
            <p className="text-sm text-muted-foreground">Unlock all features and start saving more.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Monthly */}
            <Card data-testid="card-plan-monthly">
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground mb-2">Monthly</p>
                <p className="text-2xl font-bold">$8</p>
                <p className="text-xs text-muted-foreground mb-4">/month</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUpgrade("monthly")}
                  data-testid="button-upgrade-monthly"
                >
                  Choose Monthly
                </Button>
              </CardContent>
            </Card>

            {/* Annual */}
            <Card className="border-2 border-primary relative" data-testid="card-plan-annual">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-semibold px-3">
                SAVE 38%
              </Badge>
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground mb-2">Annual</p>
                <p className="text-2xl font-bold">$59</p>
                <p className="text-xs text-muted-foreground mb-4">/year</p>
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade("annual")}
                  data-testid="button-upgrade-annual"
                >
                  Choose Annual
                </Button>
              </CardContent>
            </Card>

            {/* Lifetime */}
            <Card data-testid="card-plan-lifetime">
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground mb-2 flex items-center justify-center gap-1">
                  Lifetime <Star className="h-3 w-3 text-accent" />
                </p>
                <p className="text-2xl font-bold">$149</p>
                <p className="text-xs text-muted-foreground mb-4">one-time</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUpgrade("lifetime")}
                  data-testid="button-upgrade-lifetime"
                >
                  Choose Lifetime
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Premium features list */}
      {!isPremium && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" /> Premium includes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm" data-testid={`faq-trigger-${i}`}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
