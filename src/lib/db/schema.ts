import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const gmailTokens = sqliteTable("gmail_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiryDate: integer("expiry_date").notNull(),
  email: text("email").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const emails = sqliteTable("emails", {
  id: text("id").primaryKey(), // Gmail message ID
  threadId: text("thread_id"),
  subject: text("subject"),
  fromAddress: text("from_address"),
  date: text("date"),
  snippet: text("snippet"),
  bodyText: text("body_text"),
  hasPdf: integer("has_pdf", { mode: "boolean" }).default(false),
  pdfFilename: text("pdf_filename"),
  pdfText: text("pdf_text"),
  processed: integer("processed", { mode: "boolean" }).default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const renewals = sqliteTable("renewals", {
  id: text("id").primaryKey(), // UUID
  emailId: text("email_id").references(() => emails.id),
  category: text("category", { enum: ["home", "car"] }),
  provider: text("provider"),
  policyNumber: text("policy_number"),
  renewalDate: text("renewal_date"),
  premiumAnnual: real("premium_annual"),
  premiumMonthly: real("premium_monthly"),
  currency: text("currency").default("GBP"),
  status: text("status", {
    enum: ["upcoming", "due_soon", "expired", "actioned"],
  }).default("upcoming"),
  rawExtraction: text("raw_extraction"), // full JSON from LLM
  evidenceCategory: text("evidence_category"),
  evidenceProvider: text("evidence_provider"),
  evidencePolicy: text("evidence_policy"),
  evidenceDate: text("evidence_date"),
  evidencePremium: text("evidence_premium"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const renewalPacks = sqliteTable("renewal_packs", {
  id: text("id").primaryKey(), // UUID
  renewalId: text("renewal_id")
    .notNull()
    .references(() => renewals.id),
  content: text("content").notNull(), // markdown
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
