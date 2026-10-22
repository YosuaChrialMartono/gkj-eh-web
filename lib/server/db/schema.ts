import { sql } from "drizzle-orm"
import { pgTable, pgEnum, uuid, text, timestamp, integer, boolean, date, jsonb, primaryKey, uniqueIndex, index, check } from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

export const userRole = pgEnum("user_role", ["viewer", "editor", "admin"])
export const contentType = pgEnum("content_type", ["article", "page", "sermon", "announcement"])
export const contentStatus = pgEnum("content_status", ["draft", "published", "archived"])
const timestamps = () => ({ createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull() })
export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(), name: text().notNull(), email: text().notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }), image: text(), passwordHash: text("password_hash"),
  role: userRole().default("viewer").notNull(), disabled: boolean().default(false).notNull(),
  sessionVersion: integer("session_version").default(0).notNull(), ...timestamps(),
}, t => [check("email_normalized", sql`${t.email} = lower(trim(${t.email}))`), check("user_name_nonempty", sql`length(trim(${t.name})) > 0`)])
export const accounts = pgTable("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text().$type<AdapterAccountType>().notNull(), provider: text().notNull(), providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text(), access_token: text(), expires_at: integer(), token_type: text(), scope: text(), id_token: text(), session_state: text(),
}, t => [primaryKey({ columns: [t.provider, t.providerAccountId] }), index("accounts_user_idx").on(t.userId)])
export const content = pgTable("content", {
  id: uuid().defaultRandom().primaryKey(), title: text().notNull(), slug: text().notNull().unique(),
  type: contentType().notNull(), status: contentStatus().default("draft").notNull(),
  // Serialized canonical TipTap JSON, matching the current editor's string contract.
  body: text().default("").notNull(), bodyHtml: text("body_html").default("").notNull(),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  featuredImageUrl: text("featured_image_url"), publishedAt: timestamp("published_at", { withTimezone: true }), ...timestamps(),
}, t => [index("content_public_idx").on(t.status, t.publishedAt, t.id), index("content_author_idx").on(t.authorId)])
export const reports = pgTable("reports", {
  id: uuid().defaultRandom().primaryKey(), tanggal: date().notNull(), jenisKebaktian: text("jenis_kebaktian").notNull(),
  // Validated payload excludes tanggal/jenisKebaktian/metadata. Replace, never merge.
  data: jsonb().$type<Record<string, unknown>>().default({}).notNull(), ...timestamps(),
}, t => [index("reports_date_idx").on(t.tanggal, t.id), check("report_data_object", sql`jsonb_typeof(${t.data}) = 'object'`)])
export const pelayanRoles = pgTable("pelayan_roles", {
  id: uuid().defaultRandom().primaryKey(), name: text().notNull(), order: integer().default(0).notNull(),
}, t => [uniqueIndex("pelayan_role_name_unique").on(sql`lower(trim(${t.name}))`), check("role_name_nonempty", sql`length(trim(${t.name})) > 0`)])
export const pelayanPersons = pgTable("pelayan_persons", {
  id: uuid().defaultRandom().primaryKey(), name: text().notNull(),
}, t => [uniqueIndex("pelayan_person_name_unique").on(sql`lower(trim(${t.name}))`), check("person_name_nonempty", sql`length(trim(${t.name})) > 0`)])
export const pelayanServices = pgTable("pelayan_services", {
  id: uuid().defaultRandom().primaryKey(), date: date().notNull(), label: text(), isExtra: boolean("is_extra").default(false).notNull(),
}, t => [index("pelayan_service_date_idx").on(t.date), uniqueIndex("pelayan_regular_date_unique").on(t.date).where(sql`NOT ${t.isExtra}`)])
export const pelayanAssignments = pgTable("pelayan_assignments", {
  id: uuid().defaultRandom().primaryKey(), serviceId: uuid("service_id").notNull().references(() => pelayanServices.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => pelayanRoles.id, { onDelete: "cascade" }),
  // Keep historical/freeform names when a person is deleted (legacy behavior).
  pelayanName: text("pelayan_name").notNull(),
}, t => [uniqueIndex("pelayan_assignment_slot_unique").on(t.serviceId, t.roleId), index("pelayan_assignment_role_idx").on(t.roleId), check("assignment_name_nonempty", sql`length(trim(${t.pelayanName})) > 0`)])
