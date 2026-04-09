import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { 
  users, purchases, alerts, savings, priceChecks, claimItems,
  insertPurchaseSchema, insertSavingsSchema, insertClaimItemSchema, insertPriceCheckSchema
} from "@shared/schema";
import { sql } from "drizzle-orm";

const DEMO_USER_ID = 1;

function seedDatabase() {
  // Check if already seeded
  const existingUser = storage.getUserById(1);
  if (existingUser) return;

  // Create demo user
  storage.createUser({
    email: "alex@example.com",
    name: "Alex Morgan",
    plan: "premium",
    gmailConnected: true,
  });

  // 10 Purchases
  const purchaseData = [
    { store: "Amazon", items: JSON.stringify([{ name: "AirPods Pro 2nd Gen", quantity: 1, price: 249.00 }]), totalAmount: 249.00, purchaseDate: "2025-12-15", returnDeadline: "2026-01-31", orderNumber: "114-3941689-8772602", status: "active", emailSubject: "Your Amazon.com order of AirPods Pro" },
    { store: "Nike.com", items: JSON.stringify([{ name: "Air Max 270", quantity: 1, price: 150.00 }]), totalAmount: 150.00, purchaseDate: "2025-11-28", returnDeadline: "2025-12-28", orderNumber: "C00913478291", status: "expired", emailSubject: "Nike Order Confirmation" },
    { store: "Best Buy", items: JSON.stringify([{ name: "Sony 65\" X90L 4K TV", quantity: 1, price: 899.99 }]), totalAmount: 899.99, purchaseDate: "2026-01-05", returnDeadline: "2026-02-04", warrantyEnd: "2030-01-05", orderNumber: "BBY01-806547891", status: "active", emailSubject: "Best Buy Purchase Confirmation" },
    { store: "Target", items: JSON.stringify([{ name: "Instant Pot Duo 7-in-1", quantity: 1, price: 89.99 }]), totalAmount: 89.99, purchaseDate: "2026-01-20", returnDeadline: "2026-03-21", warrantyEnd: "2028-01-20", orderNumber: "102938475610", status: "active", emailSubject: "Your Target order has shipped" },
    { store: "Apple.com", items: JSON.stringify([{ name: "iPad Air M2 256GB", quantity: 1, price: 599.00 }]), totalAmount: 599.00, purchaseDate: "2026-02-01", returnDeadline: "2026-03-02", warrantyEnd: "2027-02-01", orderNumber: "W829174650", status: "active", emailSubject: "Your Apple Store order" },
    { store: "Wayfair", items: JSON.stringify([{ name: "Ergonomic Office Chair", quantity: 1, price: 325.00 }]), totalAmount: 325.00, purchaseDate: "2026-01-10", returnDeadline: "2026-02-09", orderNumber: "WF-3847291056", status: "returned", emailSubject: "Wayfair Order Confirmation" },
    { store: "Walmart", items: JSON.stringify([{ name: "Cuisinart Coffee Maker 14-Cup", quantity: 1, price: 64.99 }]), totalAmount: 64.99, purchaseDate: "2026-03-01", returnDeadline: "2026-03-31", orderNumber: "200049382716", status: "active", emailSubject: "Walmart.com Order Confirmation" },
    { store: "Gap", items: JSON.stringify([{ name: "Men's ColdControl Winter Jacket", quantity: 1, price: 129.99 }]), totalAmount: 129.99, purchaseDate: "2025-12-01", returnDeadline: "2026-01-15", orderNumber: "1GNKM7W", status: "expired", emailSubject: "Gap - Order Confirmation" },
    { store: "Costco", items: JSON.stringify([{ name: "KitchenAid Artisan Stand Mixer", quantity: 1, price: 449.99 }]), totalAmount: 449.99, purchaseDate: "2026-02-14", returnDeadline: "2026-05-14", warrantyEnd: "2032-02-14", orderNumber: "C9182736450", status: "active", emailSubject: "Costco.com Order Shipped" },
    { store: "Nordstrom", items: JSON.stringify([{ name: "Brooks Ghost 15 Running Shoes", quantity: 1, price: 175.00 }]), totalAmount: 175.00, purchaseDate: "2026-03-15", returnDeadline: "2026-04-14", orderNumber: "ND4829103756", status: "active", emailSubject: "Nordstrom Order Confirmation" },
  ];

  purchaseData.forEach(p => {
    storage.createPurchase({ userId: DEMO_USER_ID, ...p } as any);
  });

  // 8 Alerts
  const alertData = [
    { userId: DEMO_USER_ID, purchaseId: 1, type: "return_window", title: "Return window ending: AirPods Pro", message: "Your 30-day return window for AirPods Pro 2nd Gen from Amazon ends in 3 days. Review your options now.", isRead: false },
    { userId: DEMO_USER_ID, purchaseId: 5, type: "return_window", title: "Return window ending: iPad Air", message: "Your return window for iPad Air M2 from Apple.com closes in 7 days. Make sure you're happy with your purchase.", isRead: false },
    { userId: DEMO_USER_ID, purchaseId: 3, type: "price_drop", title: "Price drop detected: Sony 65\" TV", message: "The Sony 65\" X90L TV you purchased for $899.99 is now available for $749.99 at Best Buy. You may be eligible for a $150.00 price adjustment.", isRead: false },
    { userId: DEMO_USER_ID, purchaseId: 4, type: "price_drop", title: "Price drop detected: Instant Pot", message: "The Instant Pot Duo you bought for $89.99 is now $69.99 at Target. Check if you qualify for a $20.00 price match.", isRead: true },
    { userId: DEMO_USER_ID, purchaseId: 9, type: "warranty", title: "Warranty milestone: KitchenAid Mixer", message: "Your KitchenAid Artisan Stand Mixer has a 6-year manufacturer warranty valid until February 2032. Keep your receipt and registration handy.", isRead: true },
    { userId: DEMO_USER_ID, purchaseId: 2, type: "refund_opportunity", title: "Check price match: Nike Air Max", message: "Nike Air Max 270 may be eligible for a price adjustment under Nike's 60-day price protection policy. Current price is $119.99.", isRead: false },
    { userId: DEMO_USER_ID, purchaseId: 3, type: "warranty", title: "Warranty claim possible: Sony TV remote", message: "If your Sony TV remote has stopped working, it may be covered under your manufacturer warranty. Document the issue and contact Sony support.", isRead: false },
    { userId: DEMO_USER_ID, purchaseId: 7, type: "return_window", title: "Return window ending: Coffee Maker", message: "Your return window for the Cuisinart Coffee Maker from Walmart closes in 5 days. Act now if you need to return it.", isRead: false },
  ];

  alertData.forEach(a => {
    storage.createAlert(a as any);
  });

  // 5 Savings records
  const savingsData = [
    { userId: DEMO_USER_ID, purchaseId: null, type: "price_adjustment", amount: 45.00, store: "Target", description: "Price adjustment on Dyson V11 vacuum — price dropped $45 within 14 days", savedAt: "2026-01-15" },
    { userId: DEMO_USER_ID, purchaseId: 6, type: "refund", amount: 325.00, store: "Wayfair", description: "Full refund for Ergonomic Office Chair — returned within 30-day window", savedAt: "2026-02-05" },
    { userId: DEMO_USER_ID, purchaseId: null, type: "price_adjustment", amount: 25.00, store: "Amazon", description: "Price match credit on Bluetooth speaker — price dropped $25 after purchase", savedAt: "2026-02-20" },
    { userId: DEMO_USER_ID, purchaseId: null, type: "warranty_claim", amount: 89.00, store: "LG", description: "Warranty replacement for LG laptop charger — covered under 2-year manufacturer warranty", savedAt: "2026-03-01" },
    { userId: DEMO_USER_ID, purchaseId: null, type: "price_adjustment", amount: 30.00, store: "Best Buy", description: "Price protection match on wireless headphones — $30 credit applied", savedAt: "2026-03-10" },
  ];

  savingsData.forEach(s => {
    storage.createSaving(s as any);
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Push schema & seed
  db.run(sql`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free',
    gmail_connected INTEGER DEFAULT 0,
    created_at INTEGER
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    store TEXT NOT NULL,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL,
    purchase_date TEXT NOT NULL,
    return_deadline TEXT,
    warranty_end TEXT,
    order_number TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    email_subject TEXT
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    purchase_id INTEGER,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    is_actioned INTEGER DEFAULT 0,
    created_at INTEGER
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS savings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    purchase_id INTEGER,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    store TEXT NOT NULL,
    description TEXT NOT NULL,
    saved_at TEXT NOT NULL
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS price_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    purchase_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    original_price REAL NOT NULL,
    current_price REAL NOT NULL,
    url TEXT,
    checked_at INTEGER
  )`);
  db.run(sql`CREATE TABLE IF NOT EXISTS claim_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    is_completed INTEGER DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0
  )`);

  seedDatabase();

  // GET /api/me
  app.get("/api/me", (_req, res) => {
    const user = storage.getUserById(DEMO_USER_ID);
    if (!user) return res.status(404).json({ message: "User not found" });
    const unread = storage.getUnreadAlertCount(DEMO_USER_ID);
    res.json({ ...user, unreadAlerts: unread });
  });

  // GET /api/purchases
  app.get("/api/purchases", (_req, res) => {
    const list = storage.getPurchasesByUserId(DEMO_USER_ID);
    res.json(list);
  });

  // POST /api/purchases
  app.post("/api/purchases", (req, res) => {
    try {
      const data = { ...req.body, userId: DEMO_USER_ID };
      const purchase = storage.createPurchase(data);
      res.status(201).json(purchase);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // PATCH /api/purchases/:id
  app.patch("/api/purchases/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const purchase = storage.updatePurchaseStatus(id, status);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    res.json(purchase);
  });

  // DELETE /api/purchases/:id
  app.delete("/api/purchases/:id", (req, res) => {
    const id = parseInt(req.params.id);
    storage.deletePurchase(id);
    res.json({ success: true });
  });

  // GET /api/alerts
  app.get("/api/alerts", (_req, res) => {
    const list = storage.getAlertsByUserId(DEMO_USER_ID);
    res.json(list);
  });

  // PATCH /api/alerts/:id/read
  app.patch("/api/alerts/:id/read", (req, res) => {
    const id = parseInt(req.params.id);
    const alert = storage.markAlertRead(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  });

  // PATCH /api/alerts/:id/action
  app.patch("/api/alerts/:id/action", (req, res) => {
    const id = parseInt(req.params.id);
    const alert = storage.markAlertActioned(id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  });

  // GET /api/savings
  app.get("/api/savings", (_req, res) => {
    const list = storage.getSavingsByUserId(DEMO_USER_ID);
    res.json(list);
  });

  // POST /api/savings
  app.post("/api/savings", (req, res) => {
    try {
      const data = { ...req.body, userId: DEMO_USER_ID };
      const saving = storage.createSaving(data);
      res.status(201).json(saving);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // GET /api/purchases/:id/claims
  app.get("/api/purchases/:id/claims", (req, res) => {
    const purchaseId = parseInt(req.params.id);
    const items = storage.getClaimItemsByPurchaseId(purchaseId);
    res.json(items);
  });

  // POST /api/purchases/:id/claims
  app.post("/api/purchases/:id/claims", (req, res) => {
    const purchaseId = parseInt(req.params.id);
    try {
      const item = storage.createClaimItem({ ...req.body, purchaseId });
      res.status(201).json(item);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // PATCH /api/claims/:id
  app.patch("/api/claims/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { isCompleted } = req.body;
    const item = storage.updateClaimItem(id, isCompleted);
    if (!item) return res.status(404).json({ message: "Claim item not found" });
    res.json(item);
  });

  // POST /api/price-check
  app.post("/api/price-check", (req, res) => {
    try {
      const data = { ...req.body, userId: DEMO_USER_ID };
      const check = storage.createPriceCheck(data);
      res.status(201).json(check);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // GET /api/dashboard
  app.get("/api/dashboard", (_req, res) => {
    const totalSavings = storage.getTotalSavings(DEMO_USER_ID);
    const allPurchases = storage.getPurchasesByUserId(DEMO_USER_ID);
    const activePurchases = allPurchases.filter(p => p.status === "active").length;
    const allAlerts = storage.getAlertsByUserId(DEMO_USER_ID);
    const pendingAlerts = allAlerts.filter(a => !a.isRead).length;

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = allPurchases.filter(p => {
      if (!p.returnDeadline || p.status !== "active") return false;
      const deadline = new Date(p.returnDeadline);
      return deadline >= now && deadline <= sevenDaysFromNow;
    }).length;

    const recentAlerts = allAlerts.slice(0, 5);

    res.json({
      totalSavings,
      activePurchases,
      pendingAlerts,
      upcomingDeadlines,
      recentAlerts,
    });
  });

  // POST /api/seed
  app.post("/api/seed", (_req, res) => {
    seedDatabase();
    res.json({ success: true });
  });

  return httpServer;
}
