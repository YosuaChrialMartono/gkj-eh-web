CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('article', 'page', 'sermon', 'announcement');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('viewer', 'editor', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"type" "content_type" NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"body_html" text DEFAULT '' NOT NULL,
	"author_id" uuid NOT NULL,
	"featured_image_url" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pelayan_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"pelayan_name" text NOT NULL,
	CONSTRAINT "assignment_name_nonempty" CHECK (length(trim("pelayan_assignments"."pelayan_name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "pelayan_persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "person_name_nonempty" CHECK (length(trim("pelayan_persons"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "pelayan_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "role_name_nonempty" CHECK (length(trim("pelayan_roles"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE "pelayan_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"label" text,
	"is_extra" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tanggal" date NOT NULL,
	"jenis_kebaktian" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_data_object" CHECK (jsonb_typeof("reports"."data") = 'object')
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"session_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "email_normalized" CHECK ("users"."email" = lower(trim("users"."email"))),
	CONSTRAINT "user_name_nonempty" CHECK (length(trim("users"."name")) > 0)
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pelayan_assignments" ADD CONSTRAINT "pelayan_assignments_service_id_pelayan_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."pelayan_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pelayan_assignments" ADD CONSTRAINT "pelayan_assignments_role_id_pelayan_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."pelayan_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "content_public_idx" ON "content" USING btree ("status","published_at","id");--> statement-breakpoint
CREATE INDEX "content_author_idx" ON "content" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pelayan_assignment_slot_unique" ON "pelayan_assignments" USING btree ("service_id","role_id");--> statement-breakpoint
CREATE INDEX "pelayan_assignment_role_idx" ON "pelayan_assignments" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pelayan_person_name_unique" ON "pelayan_persons" USING btree (lower(trim("name")));--> statement-breakpoint
CREATE UNIQUE INDEX "pelayan_role_name_unique" ON "pelayan_roles" USING btree (lower(trim("name")));--> statement-breakpoint
CREATE INDEX "pelayan_service_date_idx" ON "pelayan_services" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "pelayan_regular_date_unique" ON "pelayan_services" USING btree ("date") WHERE NOT "pelayan_services"."is_extra";--> statement-breakpoint
CREATE INDEX "reports_date_idx" ON "reports" USING btree ("tanggal","id");