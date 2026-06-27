CREATE TABLE "analysis_outputs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"island" text,
	"domain" text,
	"period" text,
	"headline" text NOT NULL,
	"take" text NOT NULL,
	"why_it_matters" text,
	"support" jsonb,
	"citations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"facts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"interpretation" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"signal" text DEFAULT 'moderate' NOT NULL,
	"confidence" double precision,
	"model" text,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text,
	"raw_item_id" uuid,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"published_at" timestamp with time zone,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lang" text DEFAULT 'fr' NOT NULL,
	"dedup_cluster_id" text,
	"domains" text[] DEFAULT '{}'::text[] NOT NULL,
	"subtags" text[] DEFAULT '{}'::text[] NOT NULL,
	"islands" text[] DEFAULT '{}'::text[] NOT NULL,
	"entities" text[] DEFAULT '{}'::text[] NOT NULL,
	"tagged" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text DEFAULT 'running' NOT NULL,
	"items_seen" integer DEFAULT 0 NOT NULL,
	"items_new" integer DEFAULT 0 NOT NULL,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "islands" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_ty" text,
	"archipelago" text NOT NULL,
	"aliases" text[] DEFAULT '{}'::text[] NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "official_notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text,
	"raw_item_id" uuid,
	"notice_type" text,
	"title" text NOT NULL,
	"body" text,
	"issued_at" timestamp with time zone,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"url" text NOT NULL,
	"lang" text DEFAULT 'fr' NOT NULL,
	"domains" text[] DEFAULT '{}'::text[] NOT NULL,
	"islands" text[] DEFAULT '{}'::text[] NOT NULL,
	"entities" text[] DEFAULT '{}'::text[] NOT NULL,
	"tagged" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text,
	"run_id" uuid,
	"url" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content_hash" text,
	"title" text,
	"raw_text" text,
	"published_at" timestamp with time zone,
	"lang" text,
	"payload" jsonb
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"source_type" text NOT NULL,
	"ingestion_method" text NOT NULL,
	"language" text DEFAULT 'fr' NOT NULL,
	"cadence" text DEFAULT 'daily' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"robots_notes" text,
	"licence_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statistical_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text,
	"series_code" text,
	"indicator" text NOT NULL,
	"period" text NOT NULL,
	"value" double precision,
	"unit" text,
	"geography" text,
	"theme" text,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"slug" text PRIMARY KEY NOT NULL,
	"label_en" text NOT NULL,
	"label_fr" text,
	"label_ty" text,
	"parent_slug" text,
	"color" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "travel_advisories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text,
	"level" text,
	"prev_level" text,
	"updated_at" timestamp with time zone,
	"summary" text,
	"url" text,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weather_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text,
	"island" text,
	"hazard_type" text,
	"vigilance_level" text,
	"issued_at" timestamp with time zone,
	"valid_until" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"url" text,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_raw_item_id_raw_items_id_fk" FOREIGN KEY ("raw_item_id") REFERENCES "public"."raw_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_notices" ADD CONSTRAINT "official_notices_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_notices" ADD CONSTRAINT "official_notices_raw_item_id_raw_items_id_fk" FOREIGN KEY ("raw_item_id") REFERENCES "public"."raw_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_items" ADD CONSTRAINT "raw_items_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "raw_items" ADD CONSTRAINT "raw_items_run_id_ingestion_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."ingestion_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistical_observations" ADD CONSTRAINT "statistical_observations_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travel_advisories" ADD CONSTRAINT "travel_advisories_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_alerts" ADD CONSTRAINT "weather_alerts_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;