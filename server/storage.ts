import {
  type User, type InsertUser, users,
  type Purchase, type InsertPurchase, purchases,
  type Alert, type InsertAlert, alerts,
  type Saving, type InsertSaving, savings,
  type PriceCheck, type InsertPriceCheck, priceChecks,
  type ClaimItem, type InsertClaimItem, claimItems,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, sql, desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // Users
  getUserById(id: number): User | undefined;
  getUserByEmail(email: string): User | undefined;
  createUser(user: InsertUser): User;
  updateUserPlan(id: number, plan: string): User | undefined;

  // Purchases
  getPurchasesByUserId(userId: number): Purchase[];
  getPurchaseById(id: number): Purchase | undefined;
  createPurchase(purchase: InsertPurchase): Purchase;
  updatePurchaseStatus(id: number, status: string): Purchase | undefined;
  deletePurchase(id: number): void;

  // Alerts
  getAlertsByUserId(userId: number): Alert[];
  getUnreadAlertCount(userId: number): number;
  createAlert(alert: InsertAlert): Alert;
  markAlertRead(id: number): Alert | undefined;
  markAlertActioned(id: number): Alert | undefined;

  // Savings
  getSavingsByUserId(userId: number): Saving[];
  getTotalSavings(userId: number): number;
  createSaving(saving: InsertSaving): Saving;

  // PriceChecks
  getPriceChecksByPurchaseId(purchaseId: number): PriceCheck[];
  createPriceCheck(check: InsertPriceCheck): PriceCheck;

  // ClaimItems
  getClaimItemsByPurchaseId(purchaseId: number): ClaimItem[];
  createClaimItem(item: InsertClaimItem): ClaimItem;
  updateClaimItem(id: number, isCompleted: boolean): ClaimItem | undefined;
}

export class DatabaseStorage implements IStorage {
  // Users
  getUserById(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  getUserByEmail(email: string): User | undefined {
    return db.select().from(users).where(eq(users.email, email)).get();
  }

  createUser(user: InsertUser): User {
    return db.insert(users).values(user).returning().get();
  }

  updateUserPlan(id: number, plan: string): User | undefined {
    return db.update(users).set({ plan }).where(eq(users.id, id)).returning().get();
  }

  // Purchases
  getPurchasesByUserId(userId: number): Purchase[] {
    return db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.purchaseDate)).all();
  }

  getPurchaseById(id: number): Purchase | undefined {
    return db.select().from(purchases).where(eq(purchases.id, id)).get();
  }

  createPurchase(purchase: InsertPurchase): Purchase {
    return db.insert(purchases).values(purchase).returning().get();
  }

  updatePurchaseStatus(id: number, status: string): Purchase | undefined {
    return db.update(purchases).set({ status }).where(eq(purchases.id, id)).returning().get();
  }

  deletePurchase(id: number): void {
    db.delete(purchases).where(eq(purchases.id, id)).run();
  }

  // Alerts
  getAlertsByUserId(userId: number): Alert[] {
    return db.select().from(alerts).where(eq(alerts.userId, userId)).orderBy(desc(alerts.createdAt)).all();
  }

  getUnreadAlertCount(userId: number): number {
    const result = db.select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(and(eq(alerts.userId, userId), eq(alerts.isRead, false)))
      .get();
    return result?.count ?? 0;
  }

  createAlert(alert: InsertAlert): Alert {
    return db.insert(alerts).values(alert).returning().get();
  }

  markAlertRead(id: number): Alert | undefined {
    return db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id)).returning().get();
  }

  markAlertActioned(id: number): Alert | undefined {
    return db.update(alerts).set({ isActioned: true }).where(eq(alerts.id, id)).returning().get();
  }

  // Savings
  getSavingsByUserId(userId: number): Saving[] {
    return db.select().from(savings).where(eq(savings.userId, userId)).orderBy(desc(savings.savedAt)).all();
  }

  getTotalSavings(userId: number): number {
    const result = db.select({ total: sql<number>`coalesce(sum(${savings.amount}), 0)` })
      .from(savings)
      .where(eq(savings.userId, userId))
      .get();
    return result?.total ?? 0;
  }

  createSaving(saving: InsertSaving): Saving {
    return db.insert(savings).values(saving).returning().get();
  }

  // PriceChecks
  getPriceChecksByPurchaseId(purchaseId: number): PriceCheck[] {
    return db.select().from(priceChecks).where(eq(priceChecks.purchaseId, purchaseId)).all();
  }

  createPriceCheck(check: InsertPriceCheck): PriceCheck {
    return db.insert(priceChecks).values(check).returning().get();
  }

  // ClaimItems
  getClaimItemsByPurchaseId(purchaseId: number): ClaimItem[] {
    return db.select().from(claimItems).where(eq(claimItems.purchaseId, purchaseId)).orderBy(claimItems.order).all();
  }

  createClaimItem(item: InsertClaimItem): ClaimItem {
    return db.insert(claimItems).values(item).returning().get();
  }

  updateClaimItem(id: number, isCompleted: boolean): ClaimItem | undefined {
    return db.update(claimItems).set({ isCompleted }).where(eq(claimItems.id, id)).returning().get();
  }
}

export const storage = new DatabaseStorage();
