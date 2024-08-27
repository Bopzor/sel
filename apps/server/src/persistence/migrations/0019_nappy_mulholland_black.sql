CREATE TABLE IF NOT EXISTS "notification_deliveries" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"notification_id" varchar(16) NOT NULL,
	"delivery_type" "notification_delivery_type" NOT NULL,
	"target" text NOT NULL,
	"delivered" boolean DEFAULT false NOT NULL,
	"error" json,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications2" (
	"id" varchar(16) PRIMARY KEY NOT NULL,
	"member_id" varchar(16) NOT NULL,
	"type" varchar(32) NOT NULL,
	"date" timestamp (3) NOT NULL,
	"read_at" timestamp (3),
	"context" json NOT NULL,
	"created_at" timestamp (3) NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_notifications2_id_fk" FOREIGN KEY ("notification_id") REFERENCES "notifications2"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications2" ADD CONSTRAINT "notifications2_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
