ALTER TABLE "config" ADD COLUMN "map_longitude" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "map_latitude" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "config" ADD COLUMN "map_zoom" varchar(256) DEFAULT '' NOT NULL;