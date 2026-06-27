CREATE TABLE "cruise_port_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" text,
	"port" text,
	"ship_name" text,
	"cruise_line" text,
	"arrive" timestamp with time zone,
	"depart" timestamp with time zone,
	"itinerary" text,
	"passengers" integer,
	"is_forward" boolean DEFAULT true NOT NULL,
	"content_hash" text,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cruise_port_calls" ADD CONSTRAINT "cruise_port_calls_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;