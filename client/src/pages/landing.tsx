import { Link } from "wouter";
import { RadarLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Bell,
  TrendingDown,
  Shield,
  ClipboardCheck,
  Chrome,
  ArrowRight,
  Check,
  Zap,
} from "lucide-react";

const features = [
  { icon: Mail, title: "Automatic Receipt Detection", description: "Connect your Gmail and we instantly find and parse your purchase receipts." },
  { icon: Bell, title: "Smart Return Alerts", description: "Never miss a return window again. We track every deadline and notify you in advance." },
  { icon: TrendingDown, title: "Price Drop Tracking", description: "We monitor prices on your purchases so you can request adjustments when they drop." },
  { icon: Shield, title: "Warranty Manager", description: "Keep track of warranty coverage and get reminded before protection periods expire." },
  { icon: ClipboardCheck, title: "Claim Checklists", description: "Step-by-step guides for every refund type — returns, price matches, and warranty claims." },
  { icon: Chrome, title: "Browser Extension", description: "Compare prices in real-time while you shop. Get instant alerts about price drops." },
];

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
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <RadarLogo size={32} />
          <span className="font-semibold text-lg text-foreground">
            Refund<span className="text-primary">Radar</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-landing-login">
              Log In
            </Button>
          </Link>
          <Link href="/">
            <Button size="sm" data-testid="button-landing-signup">
              Start Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto text-center">
        <div className="relative inline-block mb-8">
          <div className="relative">
            <RadarLogo size={80} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 animate-radar-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-primary/5 animate-radar-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Save money <span className="text-primary">after</span> you shop
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          RefundRadar tracks your purchases, monitors return windows, detects price drops, and
          alerts you to potential savings opportunities.
        </p>
        <Link href="/">
          <Button size="lg" className="gap-2 text-base px-8" data-testid="button-hero-cta">
            Start Saving Free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Stats */}
      <section className="bg-muted/50 border-y">
        <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-primary" data-testid="text-stat-receipts">2.4M</p>
            <p className="text-sm text-muted-foreground mt-1">Receipts tracked</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary" data-testid="text-stat-savings">$847</p>
            <p className="text-sm text-muted-foreground mt-1">Avg saved per year</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary" data-testid="text-stat-speed">48h</p>
            <p className="text-sm text-muted-foreground mt-1">Alert speed</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-3">Everything you need to save more</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          From receipt detection to claim checklists, RefundRadar gives you the tools to never leave money on the table.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="border bg-card" data-testid={`card-feature-${f.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-center mb-12">
            Start free. Upgrade when you need more power.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <Card className="border bg-card" data-testid="card-pricing-free">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-1">Free</h3>
                <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <ul className="space-y-2.5 mb-6">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/">
                  <Button variant="outline" className="w-full" data-testid="button-pricing-free">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-primary relative bg-card" data-testid="card-pricing-premium">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground font-semibold px-3">
                RECOMMENDED
              </Badge>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  Premium <Zap className="h-4 w-4 text-accent" />
                </h3>
                <div className="mb-4">
                  <p className="text-3xl font-bold">
                    $8<span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground">or $59/year (save 38%)</p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {premiumFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/">
                  <Button className="w-full" data-testid="button-pricing-premium">
                    Start Premium Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t bg-background">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <RadarLogo size={20} />
            <span className="text-sm text-muted-foreground">
              © 2026 RefundRadar. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">Terms</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
