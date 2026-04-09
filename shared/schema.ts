import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"), // "free" | "premium"
  gmailConnected: integer("gmail_connected", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Purchases parsed from receipts
export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  store: text("store").notNull(),
  items: text("items").notNull(), // JSON array of {name, quantity, price}
  totalAmount: real("total_amount").notNull(),
  purchaseDate: text("purchase_date").notNull(), // ISO date string
  returnDeadline: text("return_deadline"), // ISO date string
  warrantyEnd: text("warranty_end"), // ISO date string
  orderNumber: text("order_number"),
  status: text("status").notNull().default("active"), // "active" | "returned" | "claimed" | "expired"
  emailSubject: text("email_subject"),
});

// Alerts
export const alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  purchaseId: integer("purchase_id"),
  type: text("type").notNull(), // "return_window" | "price_drop" | "warranty" | "refund_opportunity"
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).default(false),
  isActioned: integer("is_actioned", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Savings record
export const savings = sqliteTable("savings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  purchaseId: integer("purchase_id"),
  type: text("type").notNull(), // "refund" | "price_adjustment" | "warranty_claim"
  amount: real("amount").notNull(),
  store: text("store").notNull(),
  description: text("description").notNull(),
  savedAt: text("saved_at").notNull(), // ISO date string
});

// Price checks (from browser extension or manual entry)
export const priceChecks = sqliteTable("price_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  purchaseId: integer("purchase_id").notNull(),
  productName: text("product_name").notNull(),
  originalPrice: real("original_price").notNull(),
  currentPrice: real("current_price").notNull(),
  url: text("url"),
  checkedAt: integer("checked_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Claim checklists
export const claimItems = sqliteTable("claim_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  purchaseId: integer("purchase_id").notNull(),
  label: text("label").notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  order: integer("order").notNull().default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });
export const insertSavingsSchema = createInsertSchema(savings).omit({ id: true });
export const insertPriceCheckSchema = createInsertSchema(priceChecks).omit({ id: true, checkedAt: true });
export const insertClaimItemSchema = createInsertSchema(claimItems).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type Saving = typeof savings.$inferSelect;
export type PriceCheck = typeof priceChecks.$inferSelect;
export type ClaimItem = typeof claimItems.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertSaving = z.infer<typeof insertSavingsSchema>;
export type InsertPriceCheck = z.infer<typeof insertPriceCheckSchema>;
export type InsertClaimItem = z.infer<typeof insertClaimItemSchema>;
