import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export * from "./auth-schema";
import { user } from "./auth-schema";

// No recipient, token or message content. Welcome receipts live with the account;
// verification/submission receipts follow their own expiry and the daily purge.
export const emailDeliveries = sqliteTable("email_deliveries", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  state: text("state").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  providerId: text("provider_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  leaseUntil: integer("lease_until", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
}, (table) => [index("email_deliveries_expiry").on(table.expiresAt)]);

export const projectSubmissions = sqliteTable(
  "project_submissions",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    country: text("country").notNull(),
    sector: text("sector").notNull(),
    amount: text("amount").notNull(),
    currency: text("currency").notNull(),
    data: text("data", { mode: "json" }).notNull(),
    status: text("status").notNull().default("Nouveau"),
    noticeVersion: text("notice_version").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("projects_expiry").on(table.expiresAt)],
);

export const contactMessages = sqliteTable(
  "contact_messages",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    data: text("data", { mode: "json" }).notNull(),
    status: text("status").notNull().default("Nouveau"),
    noticeVersion: text("notice_version").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("contacts_expiry").on(table.expiresAt)],
);

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  state: text("state").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});
export const abuseBuckets = sqliteTable("abuse_buckets", {
  key: text("key").primaryKey(),
  hits: integer("hits").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});
export const maintenance = sqliteTable("maintenance", {
  key: text("key").primaryKey(),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
});

/**
 * Define your database schema here, then apply it with `bun run db:push`
 * (from packages/web). Re-export any generated schema from this file
 * (e.g. Better Auth's auth-schema.ts) so drizzle generates complete migrations.
 * Table patterns and conventions: skills/app/references/api.md
 */
