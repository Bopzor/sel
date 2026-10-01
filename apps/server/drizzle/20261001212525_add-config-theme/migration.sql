ALTER TABLE "config" ADD COLUMN "primary_color" varchar(7) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "accent_color" varchar(7) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "custom_css" text DEFAULT '' NOT NULL;