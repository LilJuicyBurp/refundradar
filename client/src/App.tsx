import { Switch, Route, Router, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import AppLayout from "@/components/app-layout";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import PurchasesPage from "@/pages/purchases";
import AlertsPage from "@/pages/alerts";
import SavingsPage from "@/pages/savings";
import SettingsPage from "@/pages/settings";
import BillingPage from "@/pages/billing";

function AppRouter() {
  const [location] = useLocation();
  const isLanding = location === "/landing";

  if (isLanding) {
    return (
      <Switch>
        <Route path="/landing" component={LandingPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/purchases" component={PurchasesPage} />
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/savings" component={SavingsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/billing" component={BillingPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
