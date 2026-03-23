ALTER TABLE "config" ADD COLUMN "maintenance" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "maintenance_end" timestamp (3);